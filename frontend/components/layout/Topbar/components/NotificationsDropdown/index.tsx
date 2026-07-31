"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

export default function NotificationsDropdown() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setNotificationsOpen((o) => !o)}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-border/50 text-muted hover:text-foreground transition-colors cursor-pointer relative"
        aria-label="Bildirimler"
      >
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent border-2 border-surface"></span>
      </button>

      {notificationsOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setNotificationsOpen(false)}
          />
          <div
            className="absolute right-0 mt-2 w-[320px] bg-surface border border-border rounded-[8px] shadow-[var(--shadow-floating)] z-20"
            role="menu"
          >
            <div className="px-4 py-3 border-b border-border flex justify-between items-center">
              <h3 className="text-sm font-semibold text-foreground">Bildirimler</h3>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto py-1">
              {/* Mock Takip İsteği Bildirimi */}
              <div className="px-4 py-3 hover:bg-border/30 transition-colors flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-accent">A</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">Ahmet Yılmaz</span> sana bir takip isteği gönderdi.
                  </p>
                  <p className="text-xs text-muted mt-0.5 mb-2.5">2 saat önce</p>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-accent text-accent-fg text-xs font-medium rounded-[6px] hover:bg-accent/90 transition-colors cursor-pointer">
                      Kabul Et
                    </button>
                    <button className="px-3 py-1.5 bg-transparent text-foreground border border-border text-xs font-medium rounded-[6px] hover:bg-border/50 transition-colors cursor-pointer">
                      Reddet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
