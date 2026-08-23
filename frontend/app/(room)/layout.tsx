"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/apiClient";

export default function RoomGroupLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    // localStorage yalnızca istemcide okunabilir; token kontrolü mount
    // efektinde yapılmak zorunda.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthed(!!getAccessToken());
  }, []);

  useEffect(() => {
    if (isAuthed === false) router.replace("/login");
  }, [isAuthed, router]);

  if (isAuthed !== true) return null;

  return <>{children}</>;
}
