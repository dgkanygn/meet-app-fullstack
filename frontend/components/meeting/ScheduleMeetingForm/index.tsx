"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import TextArea from "@/components/ui/TextArea";
import DatePicker from "@/components/ui/DatePicker";
import TimePicker from "@/components/ui/TimePicker";
import PasswordInput from "@/components/ui/PasswordInput";

const schema = z.object({
    title: z.string().min(2, "Toplantı adı en az 2 karakter olmalı"),
    description: z.string().optional(),
    date: z.string().min(1, "Tarih zorunludur"),
    time: z.string().min(1, "Saat zorunludur"),
    password: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ScheduleMeetingForm() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    async function onSubmit(data: FormData) {
        await new Promise((r) => setTimeout(r, 1000));
        console.log("Schedule meeting:", data);
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

            <div className="grid grid-cols-2 gap-4">
                <DatePicker
                    label="Tarih*"
                    error={errors.date?.message}
                    {...register("date")}
                />
                <TimePicker
                    label="Saat*"
                    error={errors.time?.message}
                    {...register("time")}
                />
            </div>

            <PasswordInput
                label="Şifre (Opsiyonel)"
                placeholder="Toplantı şifresi"
                error={errors.password?.message}
                {...register("password")}
            />

            <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full"
            >
                {isSubmitting ? "Planlanıyor..." : "Toplantıyı Planla"}
            </Button>
        </form>
    );
}
