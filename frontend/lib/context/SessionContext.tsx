"use client";

/**
 * SessionContext — oturum açmış kullanıcının profilini tek bir yerde tutar.
 *
 * Sidebar, Topbar, dashboard ve profil sayfası aynı veriyi kullandığı için
 * her bileşenin ayrı ayrı /api/profiles/me çağırmasının önüne geçer.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  profileService,
  type UpdateProfilePayload,
} from "@/lib/services/profileService";
import { authService } from "@/lib/services/authService";
import { clearTokens, getRefreshToken } from "@/lib/apiClient";
import type { ProfileResponse } from "@/lib/types";

interface SessionContextValue {
  profile: ProfileResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  updateProfile: (payload: UpdateProfilePayload) => Promise<ProfileResponse>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadedKey, setLoadedKey] = useState<number | null>(null);

  const isLoading = loadedKey !== reloadKey;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await profileService.getMe();
        if (cancelled) return;
        setProfile(data);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Profil yüklenemedi.");
      } finally {
        if (!cancelled) setLoadedKey(reloadKey);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const updated = await profileService.updateMe(payload);
    setProfile(updated);
    return updated;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        // Token zaten geçersizse de yerel oturumu kapatmaya devam et.
      }
    }
    clearTokens();
    setProfile(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ profile, isLoading, error, refresh, updateProfile, logout }),
    [profile, isLoading, error, refresh, updateProfile, logout]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession, SessionProvider içinde kullanılmalıdır.");
  }
  return ctx;
}
