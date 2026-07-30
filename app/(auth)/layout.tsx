import { ReactNode } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10 cursor-pointer">
        <div className="w-7 h-7 rounded-[6px] bg-accent flex items-center justify-center">
          <Zap size={14} className="text-accent-fg" />
        </div>
        <span className="font-semibold text-sm text-foreground">Meet</span>
      </Link>

      {/* Form card */}
      <div className="w-full max-w-[400px] bg-surface border border-border rounded-[8px] p-8">
        {children}
      </div>
    </div>
  );
}
