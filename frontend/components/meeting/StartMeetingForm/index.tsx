"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import TextArea from "@/components/ui/TextArea";
import PasswordInput from "@/components/ui/PasswordInput";
import { useCreateMeeting } from "@/lib/hooks/useMeetings";

const schema = z.object({
  title: z.string().min(2, "Toplantı adı en az 2 karakter olmalı"),
  description: z.string().optional(),
  password: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function StartMeetingForm() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const { createMeeting, isLoading, error } = useCreateMeeting();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    await createMeeting({
      title: data.title,
      description: data.description,
      password: data.password || undefined,
      isInstant: true,
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Input
        label="Toplantı Adı*"
        type="text"
        placeholder="Örn. Haftalık Ekip Toplantısı"
        error={errors.title?.message}
        {...register("title")}
      />

      <TextArea
        label="Açıklama"
        placeholder="Toplantı detayları..."
        error={errors.description?.message}
        {...register("description")}
      />

      <PasswordInput
        label="Şifre"
        placeholder="Toplantı şifresi"
        error={errors.password?.message}
        {...register("password")}
      />

      {/* Önizleme alanı */}
      <div className="aspect-video bg-background border border-border rounded-[8px] flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-full bg-accent/10 border border-border flex items-center justify-center">
          {camOn ? (
            <Video size={24} className="text-muted" />
          ) : (
            <VideoOff size={24} className="text-muted" />
          )}
        </div>
        <p className="text-xs text-muted">
          {camOn ? "Kamera açık (önizleme)" : "Kamera kapalı"}
        </p>
      </div>

      {/* Kamera & Mikrofon toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMicOn((v) => !v)}
          className={[
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-[6px] border text-sm cursor-pointer transition-colors duration-150",
            micOn
              ? "border-border text-foreground hover:bg-surface"
              : "border-error/30 text-error bg-error/5",
          ].join(" ")}
        >
          {micOn ? <Mic size={15} /> : <MicOff size={15} />}
          {micOn ? "Mikrofon Açık" : "Mikrofon Kapalı"}
        </button>
        <button
          type="button"
          onClick={() => setCamOn((v) => !v)}
          className={[
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-[6px] border text-sm cursor-pointer transition-colors duration-150",
            camOn
              ? "border-border text-foreground hover:bg-surface"
              : "border-error/30 text-error bg-error/5",
          ].join(" ")}
        >
          {camOn ? <Video size={15} /> : <VideoOff size={15} />}
          {camOn ? "Kamera Açık" : "Kamera Kapalı"}
        </button>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
        {isLoading ? "Başlatılıyor..." : "Toplantıyı Başlat"}
      </Button>
    </form>
  );
}

