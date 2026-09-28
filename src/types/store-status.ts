/**
 * One weekday's closed window (2026-09-24) — replaced a plain day number
 * when the admin gained the ability to close only part of a day instead of
 * always the whole thing. `day` follows `Date.getUTCDay()` (0=Sunday..
 * 6=Saturday); `startTime`/`endTime` are `"HH:mm"` 24h, in `timezone`
 * below, `endTime` inclusive to the minute — `"00:00"`-`"23:59"` is the
 * whole day closed. At most one entry per weekday.
 */
export interface ClosedDaySchedule {
  day: number;
  startTime: string;
  endTime: string;
}

/** Resolved "is the store accepting orders today" state, from `GET /store/status`. */
export interface StoreOpensIn {
  seconds: number;
  /** Already in Spanish, ready to render as-is (e.g. "2 días 5 horas"). */
  human: string;
}

export interface StoreStatus {
  open: boolean;
  /** 0 = Sunday … 6 = Saturday, same convention as `Date.getUTCDay()`. */
  today: number;
  todayLabel: string;
  /** Admin-configured, `[]` by default (open every day). */
  closedDays: ClosedDaySchedule[];
  timezone: string;
  /** Present (not `null`) only when `open` is `false`. */
  nextOpenAt: string | null;
  opensIn: StoreOpensIn | null;
}
