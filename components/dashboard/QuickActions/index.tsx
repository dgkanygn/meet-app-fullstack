import Link from "next/link";
import Button from "@/components/ui/Button";
import { Video, LogIn } from "lucide-react";

export default function QuickActions() {
  return (
    <div className="bg-surface border border-border rounded-[8px] p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Hızlı Eylemler</h2>
      <div className="flex flex-col gap-2">
        <Link href="/meeting/start" className="block cursor-pointer">
          <Button variant="primary" size="md" className="w-full justify-start gap-3">
            <Video size={16} />
            Toplantı Başlat
          </Button>
        </Link>
        <Link href="/meeting/join" className="block cursor-pointer">
          <Button variant="outline" size="md" className="w-full justify-start gap-3">
            <LogIn size={16} />
            Toplantıya Katıl
          </Button>
        </Link>
      </div>
    </div>
  );
}
