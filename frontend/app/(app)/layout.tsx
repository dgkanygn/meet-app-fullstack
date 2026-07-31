import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex bg-background">
      {/* Sidebar — fixed, width managed internally */}
      <Sidebar />

      {/* Main content shifts with sidebar width */}
      {/* On large screens sidebar is 56 (collapsed) or 224px (expanded) */}
      <div className="flex-1 flex flex-col min-w-0 pl-56 transition-all duration-200">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
