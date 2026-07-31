"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const schema = z.object({
  code: z
    .string()
    .min(6, "Toplantı kodu en az 6 karakter olmalı")
    .max(12, "Toplantı kodu en fazla 12 karakter"),
});
type FormData = z.infer<typeof schema>;

export default function JoinMeetingForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    await new Promise((r) => setTimeout(r, 800));
    console.log("Join meeting:", data.code);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Toplantı Kodu veya Linki
        </label>
        <input
          type="text"
          placeholder="a3f9k2"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          {...register("code")}
          className={[
            "w-full px-3 py-2.5 text-sm rounded-[6px] tracking-widest font-mono",
            "bg-surface text-foreground placeholder:text-muted placeholder:tracking-normal placeholder:font-sans",
            "border transition-colors duration-150 outline-none",
            errors.code
              ? "border-error focus:border-error"
              : "border-border focus:border-foreground",
          ].join(" ")}
        />
        {errors.code && (
          <p className="text-xs text-error">{errors.code.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Katılınıyor..." : "Katıl"}
      </Button>
    </form>
  );
}
