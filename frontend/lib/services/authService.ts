import { api, saveTokens, clearTokens } from "@/lib/apiClient";
import type { AuthResponse } from "@/lib/types";

export interface RegisterPayload {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  async register(data: RegisterPayload): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/api/auth/register", data);
    saveTokens(res.accessToken, res.refreshToken);
    return res;
  },

  /** emailOrUsername: backend hem e-posta hem kullanıcı adı kabul eder. */
  async login(emailOrUsername: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/api/auth/login", {
      emailOrUsername,
      password,
    });
    saveTokens(res.accessToken, res.refreshToken);
    return res;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post<void>("/api/auth/logout", { refreshToken });
    clearTokens();
  },

  /** Başarılı olursa backend refresh token'ı iptal eder — yeniden giriş gerekir. */
  changePassword(payload: ChangePasswordPayload): Promise<void> {
    return api.post<void>("/api/auth/change-password", payload);
  },
};
