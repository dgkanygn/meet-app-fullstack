"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    await login(data.email, data.password);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Giriş Yap</h1>
        <p className="text-sm text-muted">Hesabına giriş yap ve devam et.</p>
      </div>

      <Input
        label="E-posta"
        type="email"
        placeholder="ornek@mail.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Şifre"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      {error && (
        <p className="text-sm text-error">{error}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full mt-2"
      >
        {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>

      <p className="text-sm text-center text-muted">
        Hesabın yok mu?{" "}
        <Link
          href="/register"
          className="text-accent hover:opacity-80 transition-opacity font-medium"
        >
          Kaydol
        </Link>
      </p>
    </form>
  );
}
