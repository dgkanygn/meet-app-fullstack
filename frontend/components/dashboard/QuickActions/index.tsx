import Link from "next/link";
import Button from "@/components/ui/Button";
import { Video, LogIn, CalendarPlus } from "lucide-react";

const actionItems = [
  { href: "/start", label: "Toplantı Başlat", icon: Video },
  { href: "/join", label: "Toplantıya Katıl", icon: LogIn },
  { href: "/schedule", label: "Toplantı Planla", icon: CalendarPlus },
];

export default function QuickActions() {
  return (
    <div className="space-y-4 rounded-[8px] border border-border bg-surface p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-foreground">Hızlı Eylemler</h2>
      <div className="flex flex-col gap-2">
        {actionItems.map((action) => (
          <Link key={action.href} href={action.href} className="block">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-start gap-3"
            >
              <action.icon size={16} />
              {action.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
