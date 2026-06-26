import { format, parseISO } from "date-fns";

/** Pretty-print a number of hours, e.g. 0.4 -> "24m", 3.5 -> "3h 30m". */
export function formatHours(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatMinutes(minutes: number): string {
  return formatHours(minutes / 60);
}

/** Format an ISO date string (or DateOnly "yyyy-MM-dd") as e.g. "Mar 3, 2026". */
export function formatDay(iso?: string | null, pattern = "MMM d, yyyy"): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return "—";
  }
}
