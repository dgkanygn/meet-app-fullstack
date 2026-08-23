"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { getAccessToken } from "@/lib/apiClient";
import { SessionProvider } from "@/lib/context/SessionContext";
import { NotificationProvider } from "@/lib/context/NotificationContext";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Token localStorage'da olduğu için kontrol ancak istemcide yapılabilir.
  // Doğrulanana kadar hiçbir şey render etmiyoruz ki korumalı içerik
  // bir an için bile görünmesin.
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  // Mobilde sidebar bir drawer; masaüstünde her zaman görünür.
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    // localStorage yalnızca istemcide okunabilir; bu yüzden token kontrolü
    // render sırasında değil, mount efektinde yapılmak zorunda.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthed(!!getAccessToken());
  }, []);

  useEffect(() => {
    if (isAuthed === false) router.replace("/login");
  }, [isAuthed, router]);

  // Sayfa değişince mobil drawer kapansın.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDrawerOpen(false);
  }, [pathname]);

  if (isAuthed !== true) return null;

  return (
    <SessionProvider>
      <NotificationProvider>
        <div className="min-h-dvh bg-background">
          <Sidebar
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
          />

          {/* Sidebar masaüstünde sabit konumlu olduğu için içerik lg'den
              itibaren kaydırılır; mobilde tam genişlik kullanır. */}
          <div className="flex min-h-dvh flex-col lg:pl-56">
            <Topbar onMenuClick={() => setIsDrawerOpen(true)} />
            <main className="flex-1 p-4 sm:p-6">{children}</main>
          </div>
        </div>
      </NotificationProvider>
    </SessionProvider>
  );
}
