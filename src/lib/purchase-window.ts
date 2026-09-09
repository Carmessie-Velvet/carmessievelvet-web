// Which days the store accepts orders is now admin-configurable (`GET
// /store/status`, `closedDays` set from the admin panel) instead of a
// hardcoded Friday–Sunday window — this module only does the client-side
// countdown math on top of that server-resolved state, computed from
// `Intl.DateTimeFormat`'s civil-time parts rather than a date library (same
// "no date-time dependency" convention the backend uses for its own
// timezone bucketing, docs/API-FRONTEND.md's admin stats section).
import type { StoreStatus } from "@/types/store-status";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_ES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const SECONDS_PER_DAY = 86400;

interface CivilTime {
  weekday: number; // 0=Sun .. 6=Sat
  secondsIntoDay: number;
}

function getCivilTime(date: Date, timeZone: string): CivilTime {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  // A midnight hour can come back as "24" with hour12: false in some ICU
  // versions — normalize before using it in arithmetic.
  const hour = Number(byType.hour) % 24;
  return {
    weekday: WEEKDAYS.indexOf(byType.weekday),
    secondsIntoDay: hour * 3600 + Number(byType.minute) * 60 + Number(byType.second),
  };
}

export interface PurchaseWindowState {
  isOpen: boolean;
  /**
   * Seconds until the window closes (if open) or opens (if closed). `null`
   * only when open with no `closedDays` configured — the store never
   * closes, so there's nothing to count down to.
   */
  secondsRemaining: number | null;
  /** Passed through from `StoreStatus` for messaging (see `describeOpenDays`). */
  closedDays: number[];
}

// The API only resolves "today" (`open`/`nextOpenAt`) — when open, it
// doesn't say when the window closes, so that's derived client-side from
// the same `closedDays`/`timezone` the admin configured: scan forward for
// the next day-of-week that's closed.
function secondsUntilClose(closedDays: number[], timezone: string, now: Date): number | null {
  if (closedDays.length === 0) return null;
  const closed = new Set(closedDays);
  const { weekday, secondsIntoDay } = getCivilTime(now, timezone);
  for (let offset = 1; offset <= 7; offset++) {
    if (closed.has((weekday + offset) % 7)) {
      return offset * SECONDS_PER_DAY - secondsIntoDay;
    }
  }
  return null;
}

export function derivePurchaseWindowState(
  status: StoreStatus,
  now: Date = new Date()
): PurchaseWindowState {
  if (!status.open) {
    const secondsRemaining = status.nextOpenAt
      ? Math.max(0, (new Date(status.nextOpenAt).getTime() - now.getTime()) / 1000)
      : null;
    return { isOpen: false, secondsRemaining, closedDays: status.closedDays };
  }
  return {
    isOpen: true,
    secondsRemaining: secondsUntilClose(status.closedDays, status.timezone, now),
    closedDays: status.closedDays,
  };
}

// Monday-first reading order (1..6, then 0) so a weekend-only window still
// reads as "viernes, sábado y domingo" instead of "domingo, viernes y
// sábado" — `DAY_NAMES_ES`/`closedDays` themselves stay Sunday-first to
// match the API's `Date.getUTCDay()` convention.
const WEEK_READING_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** e.g. "todos los días" / "viernes, sábado y domingo" — for banner/gate copy. */
export function describeOpenDays(closedDays: number[]): string {
  if (closedDays.length === 0) return "todos los días";
  const closed = new Set(closedDays);
  const openDays = WEEK_READING_ORDER.filter((day) => !closed.has(day)).map(
    (day) => DAY_NAMES_ES[day]
  );
  if (openDays.length === 0) return "";
  if (openDays.length === 1) return openDays[0];
  return `${openDays.slice(0, -1).join(", ")} y ${openDays[openDays.length - 1]}`;
}

export function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(clamped / 86400);
  const hours = Math.floor((clamped % 86400) / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return days > 0
    ? `${days}d ${pad(hours)}h ${pad(minutes)}m`
    : `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}
