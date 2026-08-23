/** Backend UTC üretir; "Z" taşımayan ISO stringleri de UTC kabul edilir. */
export function parseApiDate(value: string): Date {
  const hasZone = /[Zz]|[+-]\d{2}:\d{2}$/.test(value);
  return new Date(hasZone ? value : `${value}Z`);
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

const relativeFormatter = new Intl.RelativeTimeFormat("tr-TR", { numeric: "auto" });

/** "2 saat önce" gibi göreli zaman metni üretir. */
export function formatRelativeTime(value: string): string {
  const seconds = (parseApiDate(value).getTime() - Date.now()) / 1000;

  for (const [unit, secondsPerUnit] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= secondsPerUnit) {
      return relativeFormatter.format(Math.round(seconds / secondsPerUnit), unit);
    }
  }
  return "az önce";
}

/** "23 Ağu 2026, 14:00" */
export function formatDateTime(value: string): string {
  return parseApiDate(value).toLocaleString("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Yalnızca saat: "14:00" */
export function formatTime(value: string): string {
  return parseApiDate(value).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Yerel takvim gününü "YYYY-MM-DD" olarak verir (UTC kaydırması olmadan). */
export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** "YYYY-MM-DD" anahtarını yerel saat diliminde bir Date'e çevirir. */
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}
