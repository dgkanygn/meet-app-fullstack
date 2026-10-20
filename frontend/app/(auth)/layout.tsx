"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/Logo";
import { getAccessToken } from "@/lib/apiClient";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (getAccessToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-4 py-12">
      {/* Logo */}
      <div className="mb-10">
        <Logo href="/" size="md" />
      </div>

      {/* Form card */}
      <div className="w-full max-w-[400px] bg-surface border border-border rounded-[8px] p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}

