import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { Clock, Users } from "lucide-react";

export interface MeetingCardAttendee {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
}

interface MeetingCardProps {
  id: string;
  title: string;
  time: string;
  participants: number;
  status?: "upcoming" | "live" | "ended";
  attendees?: MeetingCardAttendee[];
}

const statusLabels = {
  upcoming: { label: "Yakında", variant: "default" as const },
  live: { label: "Canlı", variant: "success" as const },
  ended: { label: "Bitti", variant: "error" as const },
};

export default function MeetingCard({
  id,
  title,
  time,
  participants,
  status = "upcoming",
  attendees,
}: MeetingCardProps) {
  const { label, variant } = statusLabels[status];

  const content = (
    <div className="rounded-[8px] border border-border bg-surface p-4 transition-colors duration-150 hover:border-foreground/20">
      <div className="flex items-start justify-between gap-3">
        <h3 className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-accent">
          {title}
        </h3>
        <Badge variant={variant}>{label}</Badge>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Clock size={12} />
          {time}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Users size={12} />
          {attendees && attendees.length > 0
            ? `${attendees.length} katılımcı`
            : `${participants} kişi`}
        </span>
      </div>

      {attendees && attendees.length > 0 && (
        <div className="mt-3.5 border-t border-border pt-3">
          <p className="mb-2 text-[11px] font-medium text-muted">
            Katılan Kişiler ({attendees.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {attendees.map((attendee) => (
              <div
                key={attendee.id}
                className="flex items-center gap-1.5 rounded-[4px] border border-border bg-background px-2 py-1 text-xs text-foreground"
              >
                <Avatar name={attendee.username || attendee.fullName} size="xs" />
                <span className="max-w-[140px] truncate text-xs">
                  {attendee.fullName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Biten toplantılar için doğrudan odaya yönlendirme yerine kart olarak gösterilir
  if (status === "ended") {
    return <div className="block">{content}</div>;
  }

  return (
    <Link href={`/meeting/${id}`} className="group block cursor-pointer">
      {content}
    </Link>
  );
}
