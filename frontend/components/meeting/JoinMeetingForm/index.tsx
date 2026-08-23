"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useJoinMeeting } from "@/lib/hooks/useMeeting";

/** Davet linkinden yapıştırılan URL'den toplantı id'sini ayıklar. */
function extractMeetingId(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  return match ? match[0] : trimmed;
}

const schema = z.object({
  meetingId: z
    .string()
    .min(1, "Toplantı kodu zorunludur")
    .refine(
      (v) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          extractMeetingId(v)
        ),
      "Geçerli bir toplantı kodu ya da davet linki gir"
    ),
  password: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function JoinMeetingForm() {
  const searchParams = useSearchParams();
  const { joinMeeting, isLoading, error } = useJoinMeeting();

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Şifreli bir odaya doğrudan gidildiğinde buraya yönlendiriliyoruz;
  // kod alanı doldurulup imleç şifreye konur.
  useEffect(() => {
    const prefilled = searchParams.get("meetingId");
    if (prefilled) {
      setValue("meetingId", prefilled);
      setFocus("password");
    }
  }, [searchParams, setValue, setFocus]);

  async function onSubmit(data: FormData) {
    await joinMeeting(extractMeetingId(data.meetingId), data.password || undefined);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <label
          htmlFor="join-meeting-id"
          className="text-sm font-medium text-foreground"
        >
          Toplantı Kodu veya Davet Linki
        </label>
        <input
          id="join-meeting-id"
          type="text"
          placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          {...register("meetingId")}
          className={[
            "w-full rounded-[6px] px-3 py-2.5 font-mono text-sm",
            "bg-surface text-foreground placeholder:font-sans placeholder:text-muted",
            "border outline-none transition-colors duration-150",
            errors.meetingId
              ? "border-error focus:border-error"
              : "border-border focus:border-foreground",
          ].join(" ")}
        />
        {errors.meetingId && (
          <p className="text-xs text-error">{errors.meetingId.message}</p>
        )}
      </div>

      <Input
        label="Şifre (opsiyonel)"
        type="password"
        placeholder="••••••••"
        autoComplete="off"
        error={errors.password?.message}
        {...register("password")}
      />

      {error && <p className="text-sm text-error">{error}</p>}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
        {isLoading ? "Katılınıyor..." : "Katıl"}
      </Button>
    </form>
  );
}
