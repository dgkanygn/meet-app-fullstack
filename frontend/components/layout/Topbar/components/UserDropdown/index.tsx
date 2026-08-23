"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Settings, LogOut, User } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useSession } from "@/lib/context/SessionContext";

export default function UserDropdown() {
  const [open, setOpen] = useState(false);
  const { profile, logout } = useSession();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2 text-sm text-foreground transition-colors"
      >
        <Avatar name={profile?.username ?? "?"} size="sm" />
        <span className="hidden max-w-[140px] truncate text-sm font-medium sm:block">
          {profile?.fullName ?? "—"}
        </span>
        <ChevronDown
          size={14}
          className={`text-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 z-20 mt-2 w-48 rounded-[8px] border border-border bg-surface py-1 shadow-[var(--shadow-floating)]"
            role="menu"
          >
            <Link
              href="/profile"
              className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-border/50"
              onClick={() => setOpen(false)}
            >
              <User size={14} className="text-muted" />
              Profil
            </Link>
            <Link
              href="/settings"
              className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-border/50"
              onClick={() => setOpen(false)}
            >
              <Settings size={14} className="text-muted" />
              Ayarlar
            </Link>
            <hr className="my-1 border-border" />
            <button
              className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm text-error transition-colors hover:bg-error/5"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              <LogOut size={14} />
              Çıkış Yap
            </button>
          </div>
        </>
      )}
    </div>
  );
}
