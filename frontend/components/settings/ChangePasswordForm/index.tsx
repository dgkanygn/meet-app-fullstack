"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { authService } from "@/lib/services/authService";
import { useSession } from "@/lib/context/SessionContext";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifre zorunludur"),
    newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalı"),
    confirmPassword: z.string().min(6, "Şifre tekrarı en az 6 karakter olmalı"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Yeni şifre mevcut şifreyle aynı olamaz",
    path: ["newPassword"],
  });
type FormData = z.infer<typeof schema>;

export default function ChangePasswordForm() {
  const { logout } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError(null);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      reset();
      setIsDone(true);

      // Backend şifre değişiminde refresh token'ı iptal ediyor;
      // kullanıcıyı yeniden giriş yapmaya yönlendiriyoruz.
      setTimeout(() => logout(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Şifre güncellenemedi.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-4">
        <PasswordInput
          label="Mevcut Şifre"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <PasswordInput
          label="Yeni Şifre"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <PasswordInput
          label="Yeni Şifre (Tekrar)"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
      {isDone && !error && (
        <p className="text-sm text-foreground">
          Şifren güncellendi. Güvenlik için yeniden giriş yapman gerekiyor...
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        isLoading={isSubmitting}
        disabled={isDone}
      >
        {isSubmitting ? "Güncelleniyor..." : "Şifreyi Güncelle"}
      </Button>
    </form>
  );
}
