"use client";

import Avatar from "@/components/ui/Avatar";

interface Contact {
  id: string;
  fullname: string;
  username: string;
}

export default function ContactCard({ contact }: { contact: Contact }) {
  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-[8px] bg-surface transition-colors hover:border-accent/30">
      <div className="flex items-center gap-3">
        <Avatar name={contact.username} size="md" />
        <div>
          <p className="text-sm font-medium text-foreground">{contact.fullname}</p>
          <p className="text-xs text-muted">@{contact.username}</p>
        </div>
      </div>
    </div>
  );
}
