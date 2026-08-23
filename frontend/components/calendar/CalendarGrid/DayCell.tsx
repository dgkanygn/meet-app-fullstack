import type { CalendarEntry } from "./index";

interface DayCellProps {
  day: number | null;
  isToday: boolean;
  isSelected: boolean;
  entries: CalendarEntry[];
  onClick?: () => void;
}

export default function DayCell({
  day,
  isToday,
  isSelected,
  entries,
  onClick,
}: DayCellProps) {
  return (
    <div
      onClick={onClick}
      className={[
        "flex min-h-[64px] flex-col gap-1 border-r border-b border-border p-1.5 sm:min-h-[80px] sm:p-2",
        day && onClick ? "cursor-pointer transition-colors hover:bg-surface" : "",
        isSelected ? "bg-surface" : "",
      ].join(" ")}
    >
      {day && (
        <>
          <span
            className={[
              "flex h-6 w-6 shrink-0 items-center justify-center self-start rounded-full text-xs font-medium",
              isToday ? "bg-accent text-accent-fg" : "text-foreground",
            ].join(" ")}
          >
            {day}
          </span>

          {/* Dar ekranlarda başlıklara yer yok; yalnızca sayı rozeti gösterilir. */}
          <div className="hidden flex-col gap-1 sm:flex">
            {entries.slice(0, 2).map((entry) => (
              <div
                key={entry.id}
                title={entry.title}
                className={[
                  "truncate rounded-[4px] px-1.5 py-1 text-[10px] leading-none",
                  entry.kind === "meeting"
                    ? "bg-accent/10 text-accent"
                    : "bg-border/60 text-foreground/80",
                ].join(" ")}
              >
                {entry.title}
              </div>
            ))}
            {entries.length > 2 && (
              <span className="text-[10px] text-muted">
                +{entries.length - 2} daha
              </span>
            )}
          </div>

          {entries.length > 0 && (
            <span className="mt-auto self-start rounded-full bg-accent/15 px-1.5 text-[10px] font-medium text-accent sm:hidden">
              {entries.length}
            </span>
          )}
        </>
      )}
    </div>
  );
}
