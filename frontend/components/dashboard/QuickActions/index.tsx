import Link from "next/link";
import Button from "@/components/ui/Button";
import { Video, LogIn, CalendarPlus } from "lucide-react";

export default function QuickActions() {

  const actionItems = [
    { href: "/dashboard", label: "Dashboard", icon: Video },
    { href: "/meeting/start", label: "Toplantı Başlat", icon: LogIn },
    { href: "/meeting/schedule", label: "Toplantı Planla", icon: CalendarPlus },
  ];

  return (
    <div className="bg-surface border border-border rounded-[8px] p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Hızlı Eylemler</h2>
      <div className="flex flex-col gap-2">
        {actionItems.map((action) => (
          <Link key={action.href} href={action.href} className="block cursor-pointer">
            <Button variant="primary" size="md" className="w-full justify-start gap-3">
              <action.icon size={16} />
              {action.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
