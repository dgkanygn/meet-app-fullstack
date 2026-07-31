"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function DeleteAccountSection() {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    
    setIsDeleting(true);
    await new Promise((r) => setTimeout(r, 1000));
    console.log("Account deleted");
    setIsDeleting(false);
  }

  return (
    <div className="p-6 border border-error/20 bg-error/5 rounded-[8px]">
      <h3 className="text-base font-semibold text-error mb-2">Hesabımı Sil</h3>
      <p className="text-sm text-foreground/80 mb-4">
        Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinecektir ve bu işlem geri alınamaz. 
        Lütfen emin olmadan bu işlemi gerçekleştirmeyin.
      </p>
      
      <Button
        variant="outline"
        onClick={handleDelete}
        isLoading={isDeleting}
        className="text-error border-error/50 hover:bg-error/10 hover:border-error"
      >
        Hesabımı Kalıcı Olarak Sil
      </Button>
    </div>
  );
}
