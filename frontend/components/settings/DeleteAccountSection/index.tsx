"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/ui/PasswordInput";
import { profileService } from "@/lib/services/profileService";
import { clearTokens } from "@/lib/apiClient";

export default function DeleteAccountSection() {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!password) {
      setError("Devam etmek için şifreni gir.");
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await profileService.deleteMe(password);
      // Hesap silindi; sunucuda oturum kapatmaya çalışmadan yerel token'ları temizle.
      clearTokens();
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hesap silinemedi.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="rounded-[8px] border border-error/20 bg-error/5 p-4 sm:p-6">
      <h3 className="mb-2 text-base font-semibold text-error">Hesabımı Sil</h3>
      <p className="mb-4 text-sm text-foreground/80">
        Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinecektir ve bu
        işlem geri alınamaz. Lütfen emin olmadan bu işlemi gerçekleştirmeyin.
      </p>

      {!isConfirming ? (
        <Button
          variant="outline"
          onClick={() => setIsConfirming(true)}
          className="border-error/50 text-error hover:border-error hover:bg-error/10"
        >
          Hesabımı Kalıcı Olarak Sil
        </Button>
      ) : (
        <div className="space-y-4">
          <PasswordInput
            label="Onaylamak için şifreni gir"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleDelete}
              isLoading={isDeleting}
              disabled={isDeleting}
              className="border-error/50 text-error hover:border-error hover:bg-error/10"
            >
              {isDeleting ? "Siliniyor..." : "Evet, hesabımı sil"}
            </Button>
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => {
                setIsConfirming(false);
                setPassword("");
                setError(null);
              }}
            >
              Vazgeç
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
