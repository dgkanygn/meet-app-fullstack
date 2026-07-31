"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Video,
  LogIn,
  Menu,
  X,
  Zap,
  CalendarPlus,
  Settings
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Takvim", icon: Calendar },
  { href: "/meeting/start", label: "Toplantı Başlat", icon: Video },
  { href: "/meeting/join", label: "Katıl", icon: LogIn },
  { href: "/meeting/schedule", label: "Toplantı Planla", icon: CalendarPlus },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed top-0 left-0 z-30 h-full flex flex-col",
          "bg-surface border-r border-border",
          "transition-all duration-200",
          collapsed ? "w-16" : "w-56",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 h-14 px-4 border-b border-border shrink-0">
          <div className="w-7 h-7 rounded-[6px] bg-accent flex items-center justify-center shrink-0">
            <Zap size={14} className="text-accent-fg" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm text-foreground tracking-tight">
              Meet
            </span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="ml-auto text-muted hover:text-foreground cursor-pointer transition-colors"
            aria-label="Kenar çubuğunu daralt"
          >
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={[
                  "flex items-center gap-3 px-2 py-2 rounded-[6px] text-sm cursor-pointer",
                  "transition-colors duration-150 group",
                  isActive
                    ? "text-accent bg-accent/8 font-medium"
                    : "text-muted hover:text-foreground hover:bg-border/50",
                ].join(" ")}
              >
                <Icon
                  size={18}
                  className={
                    isActive
                      ? "text-accent shrink-0"
                      : "text-muted group-hover:text-foreground shrink-0"
                  }
                />
                {!collapsed && <span className="truncate">{label}</span>}
                {!collapsed && isActive && (
                  <span className="ml-auto w-1 h-4 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-border shrink-0">
          <Link
            href="/profile"
            className={[
              "flex items-center gap-3 px-2 py-2 rounded-[6px] hover:bg-border/50 transition-colors cursor-pointer",
              collapsed ? "justify-center" : "",
            ].join(" ")}
          >
            <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-accent">D</span>
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-foreground truncate">
                  Dogukan
                </p>
                <p className="text-xs text-muted truncate">dogukan@meet.app</p>
              </div>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
