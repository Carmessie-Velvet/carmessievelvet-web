// How long a made-to-order piece takes before it ships — the figure shown on
// the product page, the checkout, the FAQ, the announcement bar and the
// "En elaboración" step of an order. Everything the store sells is made to
// order, so this one promise is repeated all over the site; it lives here so
// a campaign (Buen Fin) can lengthen it by editing one table instead of
// seven strings, and so it goes back on its own when the campaign ends.
//
// The "Pago confirmado" email states the same figure from the API's own copy
// of this table (carmessievelvet-api, src/config/lead-time.config.ts, the
// `{{leadTime}}` placeholder). It's deliberately not an endpoint, so this site
// can ship the new figure without waiting for an API deploy — **change both
// when the dates change.**
//
// `from` is inclusive and `until` exclusive, with the Mexico City offset
// written out (`-06:00`: Mexico has no daylight saving time since 2022) so the
// boundary is the same on the server and in a shopper's browser whatever
// timezone either one is in. Windows must not overlap — the first match wins.
// Past entries can stay: they stop matching by themselves.

export const STANDARD_LEAD_TIME = "3 a 4 semanas";

interface LeadTimeWindow {
  weeks: string;
  /** Campaign name, for the announcement bar ("Buen Fin"). */
  campaign: string;
  /** Why it's longer, to put next to the figure ("por la alta demanda del Buen Fin"). */
  reason: string;
  from: string;
  until: string;
}

const LEAD_TIME_WINDOWS: LeadTimeWindow[] = [
  {
    // Buen Fin 2026: Thursday 12 to Monday 16 November, both included.
    weeks: "5 a 6 semanas",
    campaign: "Buen Fin",
    reason: "por la alta demanda del Buen Fin",
    from: "2026-11-12T00:00:00-06:00",
    until: "2026-11-17T00:00:00-06:00",
  },
];

export interface LeadTime {
  /** "3 a 4 semanas", or the campaign's figure while one is on. */
  weeks: string;
  /** Campaign name while one is on, `null` otherwise. */
  campaign: string | null;
  /** Why the figure is longer right now, `null` outside a campaign. */
  reason: string | null;
}

/**
 * The lead time that applies to an order placed at `at` (default: right now).
 * Pass the order's own date to describe an order that already exists — the
 * figure it was sold with, not whatever is on today.
 */
export function getLeadTime(at: Date | string | number = new Date()): LeadTime {
  const time = new Date(at).getTime();
  const window = LEAD_TIME_WINDOWS.find(
    (candidate) => time >= Date.parse(candidate.from) && time < Date.parse(candidate.until)
  );
  if (!window) return { weeks: STANDARD_LEAD_TIME, campaign: null, reason: null };
  return { weeks: window.weeks, campaign: window.campaign, reason: window.reason };
}

/** "5 a 6 semanas (por la alta demanda del Buen Fin)", or just the figure outside a campaign. */
export function formatLeadTime({ weeks, reason }: LeadTime): string {
  return reason ? `${weeks} (${reason})` : weeks;
}
