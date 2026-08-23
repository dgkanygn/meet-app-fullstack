"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService, type RegisterPayload } from "@/lib/services/authService";

/**
 * Giriş/kayıt formları için. Oturum açıldıktan sonraki profil yönetimi
 * SessionProvider'ın sorumluluğundadır.
 */
export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(emailOrUsername: string, password: string) {
    setIsLoading(true);
    setError(null);
    try {
      await authService.login(emailOrUsername, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  }

  async function register(data: RegisterPayload) {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(data);
      router.replace("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  }

  return { login, register, isLoading, error };
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Bilinmeyen bir hata oluştu.";
}
