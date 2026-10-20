"use client";

import Avatar from "@/components/ui/Avatar";
import { MessageSquare } from "lucide-react";

interface ContactItemProps {
  id: string;
  fullName: string;
  username: string;
  subtitle?: string;
  badge?: string;
  isSelected?: boolean;
  onSelect: () => void;
}

export default function ContactItem({
  fullName,
  username,
  subtitle,
  badge,
  isSelected,
  onSelect,
}: ContactItemProps) {
  return (
    <button
      onClick={onSelect}
      className={[
        "w-full text-left flex items-center justify-between gap-3 p-3 rounded-lg transition-colors cursor-pointer group",
        isSelected
          ? "bg-accent/10 text-foreground font-medium"
          : "hover:bg-border/40 text-foreground",
      ].join(" ")}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={fullName || username} size="md" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              {fullName}
            </p>
            {badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-border text-muted font-normal shrink-0">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-muted truncate">
            {subtitle ?? `@${username}`}
          </p>
        </div>
      </div>

      <div className="shrink-0 p-2 rounded-full text-muted group-hover:text-accent group-hover:bg-accent/10 transition-colors">
        <MessageSquare size={16} />
      </div>
    </button>
  );
}
