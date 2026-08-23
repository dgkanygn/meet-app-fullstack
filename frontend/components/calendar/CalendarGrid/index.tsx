"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import DayCell from "./DayCell";
import { toDateKey } from "@/lib/utils/date";

const DAYS_OF_WEEK = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

/** Takvimde bir güne düşen kayıt — ya toplantı ya da not. */
export interface CalendarEntry {
  id: string;
  title: string;
  kind: "meeting" | "note";
  /** Toplantılar için saat bilgisi. */
  time?: string;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  // JS'te 0=Pazar; takvim Pazartesi ile başladığı için kaydırıyoruz.
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

interface CalendarGridProps {
  year: number;
  /** 0-11 (JS ay indeksi). */
  month: number;
  entriesByDate: Record<string, CalendarEntry[]>;
  selectedDate: string | null;
  onMonthChange: (year: number, month: number) => void;
  onDaySelect: (dateKey: string) => void;
}

export default function CalendarGrid({
  year,
  month,
  entriesByDate,
  selectedDate,
  onMonthChange,
  onDaySelect,
}: CalendarGridProps) {
  const today = new Date();
  const todayKey = toDateKey(today);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  function prev() {
    if (month === 0) onMonthChange(year - 1, 11);
    else onMonthChange(year, month - 1);
  }

  function next() {
    if (month === 11) onMonthChange(year + 1, 0);
    else onMonthChange(year, month + 1);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={prev}
            aria-label="Önceki ay"
            className="cursor-pointer rounded-[6px] border border-border p-1.5 text-foreground transition-colors hover:bg-surface"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={next}
            aria-label="Sonraki ay"
            className="cursor-pointer rounded-[6px] border border-border p-1.5 text-foreground transition-colors hover:bg-surface"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="border-t border-l border-border">
        <div className="grid grid-cols-7">
          {DAYS_OF_WEEK.map((d) => (
            <div
              key={d}
              className="border-r border-b border-border py-2 text-center text-xs font-medium text-muted"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const dateKey = day ? toDateKey(new Date(year, month, day)) : null;
            return (
              <DayCell
                key={idx}
                day={day}
                isToday={dateKey === todayKey}
                isSelected={!!dateKey && dateKey === selectedDate}
                entries={dateKey ? (entriesByDate[dateKey] ?? []) : []}
                onClick={dateKey ? () => onDaySelect(dateKey) : undefined}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
