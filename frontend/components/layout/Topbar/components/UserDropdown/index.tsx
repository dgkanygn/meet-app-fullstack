"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Settings, LogOut, User } from "lucide-react";

export default function UserDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        id="topbar-user-menu"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 cursor-pointer text-sm text-foreground hover:text-foreground transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center">
          <span className="text-xs font-semibold text-accent">D</span>
        </div>
        <span className="text-sm font-medium hidden sm:block">Dogukan</span>
        <ChevronDown
          size={14}
          className={`text-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-[8px] shadow-[var(--shadow-floating)] z-20 py-1"
            role="menu"
          >
            <Link
              href="/profile"
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-border/50 cursor-pointer transition-colors"
              onClick={() => setOpen(false)}
            >
              <User size={14} className="text-muted" />
              Profil
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-border/50 cursor-pointer transition-colors"
              onClick={() => setOpen(false)}
            >
              <Settings size={14} className="text-muted" />
              Ayarlar
            </Link>
            <hr className="my-1 border-border" />
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-error hover:bg-error/5 cursor-pointer transition-colors text-left"
              onClick={() => setOpen(false)}
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
