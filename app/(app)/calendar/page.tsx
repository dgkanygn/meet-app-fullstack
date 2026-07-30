"use client";

import { useState } from "react";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import { X, Clock } from "lucide-react";

export default function CalendarPage() {
  const [selected, setSelected] = useState<{
    day: number;
    meetings: string[];
  } | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Takvim</h1>
        <p className="text-sm text-muted mt-1">
          Toplantılarını gün ve aya göre takip et.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_260px] gap-6 items-start">
        <CalendarGrid
          onDaySelect={(day, meetings) => setSelected({ day, meetings })}
        />

        {/* Side panel */}
        <div className="bg-surface border border-border rounded-[8px] min-h-[200px] overflow-hidden">
          {selected ? (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {selected.day} — Toplantılar
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-muted hover:text-foreground cursor-pointer transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              {selected.meetings.length === 0 ? (
                <p className="text-xs text-muted">Bu gün toplantı yok.</p>
              ) : (
                <ul className="space-y-2">
                  {selected.meetings.map((m, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <Clock size={13} className="text-muted shrink-0" />
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-xs text-muted text-center px-4">
                Toplantılarını görmek için
                <br />
                bir güne tıkla
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
