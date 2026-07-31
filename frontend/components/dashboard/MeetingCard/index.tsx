import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { Clock, Users } from "lucide-react";

interface MeetingCardProps {
  id: string;
  title: string;
  time: string;
  participants: number;
  status?: "upcoming" | "live" | "ended";
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
}: MeetingCardProps) {
  const { label, variant } = statusLabels[status];

  return (
    <Link href={`/meeting/${id}`} className="block group cursor-pointer">
      <div className="bg-surface border border-border rounded-[8px] p-4 hover:border-foreground/20 transition-colors duration-150">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
            {title}
          </h3>
          <Badge variant={variant}>{label}</Badge>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Clock size={12} />
            {time}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Users size={12} />
            {participants} katılımcı
          </span>
        </div>
      </div>
    </Link>
  );
}
