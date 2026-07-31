"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";

const schema = z.object({
  fullname: z.string().min(2, "Ad soyad en az 2 karakter olmalı"),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ProfileSettingsForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullname: "Doğukan",
      description: "Yazılım Geliştirici",
    },
  });

  async function onSubmit(data: FormData) {
    await new Promise((r) => setTimeout(r, 1000));
    console.log("Profile updated:", data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-4">
        <Input
          label="Ad Soyad"
          type="text"
          error={errors.fullname?.message}
          {...register("fullname")}
        />
        <TextArea
          label="Hakkımda"
          placeholder="Kendinizden bahsedin..."
          error={errors.description?.message}
          {...register("description")}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        isLoading={isSubmitting}
      >
        {isSubmitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
      </Button>
    </form>
  );
}
