// The client only wants checkout open Friday–Sunday (America/Mexico_City) —
// building a cart stays available every day, only completing a purchase is
// gated. Computed from `Intl.DateTimeFormat`'s civil-time parts rather than
// a date library (same "no date-time dependency" convention the backend
// uses for its own timezone bucketing, docs/API-FRONTEND.md's admin stats
// section) — Mexico dropped DST nationally in 2022, so there's no seasonal
// offset shift to account for either.
//
// ⚠️ This is a UX gate only. The real enforcement has to live in the
// backend (`POST /orders` should 400 outside the window) — a shopper who
// calls the API directly bypasses anything checked only here. Flagged to
// the backend team; not yet implemented server-side as of this writing.
const TIMEZONE = "America/Mexico_City";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const OPEN_WEEKDAYS = new Set([5, 6, 0]); // Fri, Sat, Sun

interface CivilTime {
  weekday: number; // 0=Sun .. 6=Sat
  secondsIntoDay: number;
}

function getCivilTime(date: Date): CivilTime {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
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
  /** Seconds until the window closes (if open) or opens (if closed). */
  secondsRemaining: number;
}

export function getPurchaseWindowState(now: Date = new Date()): PurchaseWindowState {
  const { weekday, secondsIntoDay } = getCivilTime(now);
  const isOpen = OPEN_WEEKDAYS.has(weekday);
  const SECONDS_PER_DAY = 86400;

  if (isOpen) {
    // Closes at the start of Monday (weekday 1) — Fri is 3 days out,
    // Sat 2, Sun 1.
    const daysUntilClose = ((8 - weekday) % 7) || 7;
    return { isOpen, secondsRemaining: daysUntilClose * SECONDS_PER_DAY - secondsIntoDay };
  }

  // Closed (Mon–Thu, weekdays 1-4) — opens at the start of Friday (weekday 5).
  const daysUntilOpen = (5 - weekday + 7) % 7;
  return { isOpen, secondsRemaining: daysUntilOpen * SECONDS_PER_DAY - secondsIntoDay };
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
