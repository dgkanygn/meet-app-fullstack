"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Video,
  LogIn,
  X,
  Zap,
  CalendarPlus,
  Settings,
  LogOut,
  ListVideo,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useSession } from "@/lib/context/SessionContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meetings", label: "Toplantılar", icon: ListVideo },
  { href: "/calendar", label: "Takvim", icon: Calendar },
  { href: "/start", label: "Toplantı Başlat", icon: Video },
  { href: "/join", label: "Katıl", icon: LogIn },
  { href: "/schedule", label: "Toplantı Planla", icon: CalendarPlus },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

interface SidebarProps {
  /** Yalnızca mobil drawer'ı ilgilendirir; lg ve üstünde sidebar hep açıktır. */
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile, logout } = useSession();

  return (
    <>
      {/* Mobil overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "fixed top-0 left-0 z-40 h-dvh w-56 flex flex-col",
          "bg-surface border-r border-border",
          "transition-transform duration-200 ease-out",
          // Mobilde ekran dışına kayar, lg'den itibaren sabit durur.
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-accent">
              <Zap size={14} className="text-accent-fg" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Meet
            </span>
          </Link>

          {/* Kapatma yalnızca mobilde anlamlı */}
          <button
            onClick={onClose}
            className="ml-auto cursor-pointer text-muted transition-colors hover:text-foreground lg:hidden"
            aria-label="Menüyü kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "group flex items-center gap-3 rounded-[6px] px-2 py-2 text-sm",
                  "cursor-pointer transition-colors duration-150",
                  isActive
                    ? "bg-accent/8 font-medium text-accent"
                    : "text-muted hover:bg-border/50 hover:text-foreground",
                ].join(" ")}
              >
                <Icon
                  size={18}
                  className={
                    isActive
                      ? "shrink-0 text-accent"
                      : "shrink-0 text-muted group-hover:text-foreground"
                  }
                />
                <span className="truncate">{label}</span>
                {isActive && (
                  <span className="ml-auto h-4 w-1 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Alt bölüm */}
        <div className="shrink-0 space-y-1 border-t border-border px-2 py-3">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-[6px] px-2 py-2 transition-colors hover:bg-border/50"
          >
            <Avatar name={profile?.username ?? "?"} size="sm" />
            <div className="min-w-0 overflow-hidden">
              <p className="truncate text-xs font-medium text-foreground">
                {profile?.fullName ?? "—"}
              </p>
              <p className="truncate text-xs text-muted">
                {profile?.email ?? ""}
              </p>
            </div>
          </Link>

          <button
            onClick={logout}
            className={[
              "flex w-full cursor-pointer items-center gap-3 rounded-[6px] px-2 py-2 text-sm",
              "text-muted transition-colors duration-150 hover:bg-error/5 hover:text-error",
            ].join(" ")}
          >
            <LogOut size={16} className="shrink-0" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
}
