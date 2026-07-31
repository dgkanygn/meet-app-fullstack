interface DayCellProps {
  day: number | null;
  isToday: boolean;
  meetings: string[];
  onClick?: () => void;
}

export default function DayCell({ day, isToday, meetings, onClick }: DayCellProps) {
  return (
    <div
      onClick={onClick}
      className={[
        "min-h-[80px] p-2 border-r border-b border-border flex flex-col gap-1",
        day && onClick ? "cursor-pointer hover:bg-surface transition-colors" : "",
      ].join(" ")}
    >
      {day && (
        <>
          <span
            className={[
              "w-6 h-6 text-xs flex items-center justify-center rounded-full font-medium self-start",
              isToday
                ? "bg-accent text-accent-fg"
                : "text-foreground",
            ].join(" ")}
          >
            {day}
          </span>
          {meetings.slice(0, 2).map((m, i) => (
            <div
              key={i}
              className="text-[10px] leading-none px-1.5 py-1 bg-accent/10 text-accent rounded-[4px] truncate"
            >
              {m}
            </div>
          ))}
          {meetings.length > 2 && (
            <span className="text-[10px] text-muted">
              +{meetings.length - 2} daha
            </span>
          )}
        </>
      )}
    </div>
  );
}
