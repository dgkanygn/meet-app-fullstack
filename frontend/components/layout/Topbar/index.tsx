"use client";

import { Menu } from "lucide-react";
import NotificationsDropdown from "./components/NotificationsDropdown";
import UserDropdown from "./components/UserDropdown";

interface TopbarProps {
  /** Mobil sidebar drawer'ını açar. */
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="-ml-1 cursor-pointer rounded-[6px] p-1.5 text-muted transition-colors hover:bg-border/50 hover:text-foreground lg:hidden"
        aria-label="Menüyü aç"
      >
        <Menu size={20} />
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <NotificationsDropdown />
        <UserDropdown />
      </div>
    </header>
  );
}
