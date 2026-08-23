"use client";

import { useState } from "react";
import { UserMinus } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

interface Contact {
  id: string;
  fullName: string;
  username: string;
}

interface ContactCardProps {
  contact: Contact;
  /** Verilirse kartta bağlantıyı kaldırma düğmesi gösterilir. */
  onRemove?: () => Promise<void> | void;
}

export default function ContactCard({ contact, onRemove }: ContactCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleRemove() {
    if (!onRemove) return;
    setIsRemoving(true);
    try {
      await onRemove();
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] border border-border bg-surface p-4 transition-colors hover:border-accent/30">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={contact.username} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {contact.fullName}
          </p>
          <p className="truncate text-xs text-muted">@{contact.username}</p>
        </div>
      </div>

      {onRemove && (
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          aria-label={`${contact.fullName} bağlantısını kaldır`}
          title="Bağlantıyı kaldır"
          className="shrink-0 cursor-pointer rounded-[6px] p-1.5 text-muted transition-colors hover:bg-error/5 hover:text-error disabled:opacity-50"
        >
          <UserMinus size={16} />
        </button>
      )}
    </div>
  );
}
