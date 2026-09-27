// Which days (and, since 2026-09-24, which hours) the store accepts orders
// is admin-configurable (`GET /store/status`, `closedDays` set from the
// admin panel) instead of a hardcoded Friday–Sunday window — this module
// only does the client-side countdown math on top of that server-resolved
// state, computed from `Intl.DateTimeFormat`'s civil-time parts rather than
// a date library (same "no date-time dependency" convention the backend
// uses for its own timezone bucketing, docs/API-FRONTEND.md's admin stats
// section).
import type { ClosedDaySchedule, StoreStatus } from "@/types/store-status";

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
  closedDays: ClosedDaySchedule[];
}

function timeToSecondsOfDay(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 3600 + m * 60;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function addMinute(time: string): string {
  return minutesToTime(timeToMinutes(time) + 1);
}

function subtractMinute(time: string): string {
  return minutesToTime(timeToMinutes(time) - 1);
}

/** Ninguna ventana cerrada, o el día completo — sin restricción de horario. */
function isFullyOpenDay(schedule: ClosedDaySchedule | undefined): boolean {
  return !schedule;
}

/** El día completo cerrado — `"00:00"`-`"23:59"`, sin ninguna hora abierta. */
function isFullyClosedDay(schedule: ClosedDaySchedule): boolean {
  return schedule.startTime === "00:00" && schedule.endTime === "23:59";
}

// The API only resolves "right now" (`open`/`nextOpenAt`) — when open, it
// doesn't say when the window closes, so that's derived client-side from
// the same `closedDays`/`timezone` the admin configured: scan forward
// through today and the next 6 days for the next moment a closed window
// begins. Works the same whether that's later today (a "cierra a las"
// day) or on a future day (a fully closed day, or one that "abre tarde" —
// which, for someone already open right now, only ever becomes relevant
// on a later day, since today's own late-open window is already behind
// `now`).
function secondsUntilClose(schedules: ClosedDaySchedule[], timezone: string, now: Date): number | null {
  if (schedules.length === 0) return null;
  const byDay = new Map(schedules.map((s) => [s.day, s]));
  const { weekday, secondsIntoDay } = getCivilTime(now, timezone);

  for (let offset = 0; offset <= 7; offset++) {
    const schedule = byDay.get((weekday + offset) % 7);
    if (!schedule) continue;
    const startOfClosure = offset * SECONDS_PER_DAY + timeToSecondsOfDay(schedule.startTime);
    const secondsUntil = startOfClosure - secondsIntoDay;
    // Un valor <= 0 en `offset === 0` significa que la ventana cerrada de
    // hoy ya pasó (ej. un día que "abre tarde" — su cierre fue a
    // medianoche, ya quedó atrás) — sigue buscando en los días siguientes
    // en vez de reportar un conteo negativo.
    if (secondsUntil > 0) return secondsUntil;
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

/** "6:00 p.m." / "11:30 a.m." — 12h con el punto que ya usa el resto del sitio. */
function formatHour12(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h < 12 ? "a.m." : "p.m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}:00 ${period}` : `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * e.g. "todos los días" / "viernes, sábado y domingo" / "jueves desde las
 * 6:00 p.m., viernes y sábado hasta las 5:00 p.m." — para el copy del
 * banner/checkout. Un día completamente cerrado se omite (como antes); uno
 * con horario limitado se lista con la hora en que abre o cierra — no la
 * ventana *cerrada* que guarda `ClosedDaySchedule`, su complemento (ej.
 * cerrado `"00:00"`-`"17:59"` = abre a las 18:00, no "hasta las 17:59").
 * Nunca las dos restricciones a la vez en el mismo día — es lo único que
 * la API permite guardar hoy.
 */
export function describeOpenDays(closedDays: ClosedDaySchedule[]): string {
  if (closedDays.length === 0) return "todos los días";
  const byDay = new Map(closedDays.map((s) => [s.day, s]));
  const parts = WEEK_READING_ORDER.filter((day) => {
    const schedule = byDay.get(day);
    return isFullyOpenDay(schedule) || !isFullyClosedDay(schedule!);
  }).map((day) => {
    const schedule = byDay.get(day);
    const name = DAY_NAMES_ES[day];
    if (!schedule) return name;
    if (schedule.startTime === "00:00") {
      // Cerrado de medianoche hasta `endTime` -> abre justo después.
      return `${name} desde las ${formatHour12(addMinute(schedule.endTime))}`;
    }
    if (schedule.endTime === "23:59") {
      // Cerrado desde `startTime` hasta medianoche -> cierra justo antes.
      return `${name} hasta las ${formatHour12(subtractMinute(schedule.startTime))}`;
    }
    return name;
  });
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1]}`;
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
