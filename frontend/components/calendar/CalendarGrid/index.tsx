"use client";

import { useState } from "react";
import DayCell from "./DayCell";

const DAYS_OF_WEEK = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = [
  "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
  "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık",
];

// Mock meetings
const mockMeetings: Record<number, string[]> = {
  3: ["Ekip Toplantısı"],
  7: ["Ürün Demo"],
  14: ["Tasarım İncelemesi", "1:1"],
  21: ["Haftalık Sync"],
  28: ["Sprint Review"],
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  // 0=Sun, convert to Mon-based
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

interface CalendarGridProps {
  onDaySelect: (day: number, meetings: string[]) => void;
}

export default function CalendarGrid({ onDaySelect }: CalendarGridProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  function prev() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function next() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={prev}
            className="px-3 py-1.5 text-sm border border-border rounded-[6px] text-foreground hover:bg-surface cursor-pointer transition-colors"
          >
            ←
          </button>
          <button
            onClick={next}
            className="px-3 py-1.5 text-sm border border-border rounded-[6px] text-foreground hover:bg-surface cursor-pointer transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 border-l border-t border-border">
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-medium text-muted border-r border-b border-border"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 border-l border-t border-border -mt-4">
        {cells.map((day, idx) => (
          <DayCell
            key={idx}
            day={day}
            isToday={
              !!day &&
              year === today.getFullYear() &&
              month === today.getMonth() &&
              day === today.getDate()
            }
            meetings={day ? (mockMeetings[day] ?? []) : []}
            onClick={
              day
                ? () => onDaySelect(day, mockMeetings[day] ?? [])
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
