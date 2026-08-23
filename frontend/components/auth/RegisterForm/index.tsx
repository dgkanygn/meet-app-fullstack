"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";

const schema = z
  .object({
    fullName: z.string().min(2, "Ad en az 2 karakter olmalı"),
    username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı").regex(/^[a-z0-9_]+$/, "Sadece küçük harf, rakam ve _ kullanılabilir"),
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterForm() {
  const { register: registerUser, isLoading, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    await registerUser({
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      password: data.password,
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Hesap Oluştur
        </h1>
        <p className="text-sm text-muted">
          Ücretsiz başla, dakikalar içinde hazır ol.
        </p>
      </div>

      <Input
        label="Ad Soyad"
        type="text"
        placeholder="Adın Soyadın"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register("fullName")}
      />

      <Input
        label="Kullanıcı Adı"
        type="text"
        placeholder="kullanici_adi"
        autoComplete="username"
        error={errors.username?.message}
        {...register("username")}
      />

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
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <Input
        label="Şifre Tekrar"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
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
        {isLoading ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
      </Button>

      <p className="text-sm text-center text-muted">
        Zaten hesabın var mı?{" "}
        <Link
          href="/login"
          className="text-accent hover:opacity-80 transition-opacity font-medium"
        >
          Giriş Yap
        </Link>
      </p>
    </form>
  );
}
