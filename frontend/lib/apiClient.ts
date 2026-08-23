/**
 * apiClient — merkezi HTTP istemcisi
 *
 * Sorumlulukları:
 *  - Authorization header'ını otomatik eklemek
 *  - 401 gelince refresh token ile access token yenilemek
 *  - Yenileme başarısızsa token'ları temizleyip /login'e yönlendirmek
 *  - Hata nesnelerini tutarlı ApiError formatında fırlatmak
 */

import type { ApiError, AuthResponse } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5079";

export { BASE_URL };

// ─── Token helpers ────────────────────────────────────────────────────────────
export const TOKEN_KEY = "meetapp_access";
export const REFRESH_KEY = "meetapp_refresh";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/**
 * Login/register/refresh uçları. Bunlardan gelen 401 "oturum düştü" değil
 * "kimlik bilgileri hatalı" demektir; token yenilemeye çalışmak, backend'in
 * asıl hata mesajını yutar.
 */
const AUTH_PATHS = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh"];

// ─── Refresh lock (concurrent 401'leri tek refresh'e indirgeme) ───────────────
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data: AuthResponse = await res.json();
    saveTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

/** Oturum tamamen düştüğünde token'ları temizleyip giriş sayfasına atar. */
function forceLogout(): void {
  clearTokens();
  if (typeof window === "undefined") return;
  const { pathname } = window.location;
  if (pathname !== "/login" && pathname !== "/register" && pathname !== "/") {
    window.location.href = "/login";
  }
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** İlk deneyde refresh yapılıp yapılmadığını takip eder */
  _retried?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, _retried = false } = options;

  const token = getAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Ağ hatası / API ayakta değil
    throw buildError(0, "Sunucuya ulaşılamıyor. Bağlantını kontrol et.");
  }

  // 401 → refresh token dene, sonra tekrar iste.
  // Auth uçlarında refresh denenmez; oradaki 401 gerçek bir kimlik hatasıdır.
  const isAuthPath = AUTH_PATHS.some((p) => path.startsWith(p));
  if (res.status === 401 && !_retried && !isAuthPath) {
    try {
      await refreshAccessToken();
      return apiRequest<T>(path, { ...options, _retried: true });
    } catch {
      forceLogout();
      throw buildError(401, "Oturum süresi doldu. Lütfen tekrar giriş yap.");
    }
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  // Başarılı yanıt
  if (res.ok) {
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  // Hata — backend'in body'sini oku
  throw buildError(res.status, await readErrorMessage(res));
}

/** Backend hata gövdesinden okunabilir bir mesaj çıkarır. */
async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();

    // GlobalExceptionHandlingMiddleware formatı
    if (typeof body?.message === "string") return body.message;

    // ASP.NET ValidationProblemDetails
    if (body?.errors && typeof body.errors === "object") {
      const first = Object.values(body.errors as Record<string, string[]>)[0];
      if (Array.isArray(first) && first.length > 0) return first[0];
    }

    if (typeof body?.title === "string") return body.title;
  } catch {
    /* gövde JSON değil — aşağıdaki varsayılana düş */
  }

  return res.status === 403
    ? "Bu işlem için yetkin yok."
    : `Beklenmeyen bir hata oluştu (HTTP ${res.status}).`;
}

function buildError(status: number, message: string): ApiError {
  const err = new Error(message) as Error & ApiError;
  err.status = status;
  err.message = message;
  return err;
}

// ─── Convenience helpers ──────────────────────────────────────────────────────
export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "PATCH", body }),
  delete: <T = void>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "DELETE", body }),
};
