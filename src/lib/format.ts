/** HH:MM:SS countdown-style duration, used by any live-ticking rental display. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":");
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Matches `Calendar.isDateInToday` — used to filter Wallet's "today" list and
 *  group Transaction History by day. */
export function isToday(iso: string): boolean {
  return startOfDay(new Date(iso)) === startOfDay(new Date());
}

export function isYesterday(iso: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return startOfDay(new Date(iso)) === startOfDay(yesterday);
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Calendar-day key (not a display label — callers translate "today"/"yesterday"
 *  themselves via `isToday`/`isYesterday`; this is only for grouping/sorting). */
export function dayKey(iso: string): number {
  return startOfDay(new Date(iso));
}
