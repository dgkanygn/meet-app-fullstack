"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";

const schema = z.object({
  currentPassword: z.string().min(1, "Mevcut şifre zorunludur"),
  newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalı"),
  confirmPassword: z.string().min(6, "Şifre tekrarı en az 6 karakter olmalı"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

export default function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    await new Promise((r) => setTimeout(r, 1000));
    console.log("Password changed:", data);
    reset();
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

      <Button
        type="submit"
        variant="primary"
        isLoading={isSubmitting}
      >
        {isSubmitting ? "Güncelleniyor..." : "Şifreyi Güncelle"}
      </Button>
    </form>
  );
}
