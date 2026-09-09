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
  closedDays: number[];
  timezone: string;
  /** Present (not `null`) only when `open` is `false`. */
  nextOpenAt: string | null;
  opensIn: StoreOpensIn | null;
}
