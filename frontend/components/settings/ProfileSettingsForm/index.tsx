"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import { useSession } from "@/lib/context/SessionContext";

const schema = z.object({
  fullName: z.string().min(2, "Ad soyad en az 2 karakter olmalı"),
  bio: z.string().max(500, "Hakkımda en fazla 500 karakter olabilir").optional(),
});
type FormData = z.infer<typeof schema>;

export default function ProfileSettingsForm() {
  const { profile, isLoading, updateProfile } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Profil context'ten geç geldiği için form değerleri yüklenince doldurulur.
  useEffect(() => {
    if (profile) {
      reset({ fullName: profile.fullName, bio: profile.bio ?? "" });
    }
  }, [profile, reset]);

  async function onSubmit(data: FormData) {
    setError(null);
    setIsSaved(false);
    try {
      await updateProfile({ fullName: data.fullName, bio: data.bio ?? "" });
      setIsSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profil güncellenemedi.");
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted">Yükleniyor...</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-4">
        <Input
          label="Ad Soyad"
          type="text"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <TextArea
          label="Hakkımda"
          placeholder="Kendinizden bahsedin..."
          error={errors.bio?.message}
          {...register("bio")}
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
      {isSaved && !error && (
        <p className="text-sm text-foreground">Profilin güncellendi.</p>
      )}

      <Button type="submit" variant="primary" isLoading={isSubmitting}>
        {isSubmitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
      </Button>
    </form>
  );
}
