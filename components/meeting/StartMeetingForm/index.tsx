"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const schema = z.object({
  title: z.string().min(2, "Toplantı adı en az 2 karakter olmalı"),
});
type FormData = z.infer<typeof schema>;

export default function StartMeetingForm() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    await new Promise((r) => setTimeout(r, 1000));
    console.log("Start meeting:", data, { micOn, camOn });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Input
        label="Toplantı Adı"
        type="text"
        placeholder="Örn. Haftalık Ekip Toplantısı"
        error={errors.title?.message}
        {...register("title")}
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

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Başlatılıyor..." : "Toplantıyı Başlat"}
      </Button>
    </form>
  );
}
