import { ApiError } from "./api-client";
import { formatRetryAfter } from "./format-retry-after";

/**
 * Turns an ApiError into a user-facing string, appending a "try again in
 * N minutes" hint on 429s (rate-limited auth routes carry `retryAfter`).
 *
 * `statusMessages` replaces the API's own message for specific status codes —
 * for the handful of cases where the backend's English string (e.g. checkout's
 * 404 "Shipping method <code> not found") shouldn't reach a shopper as-is.
 */
export function getErrorMessage(
  err: unknown,
  fallback: string,
  statusMessages?: Record<number, string>
): string {
  if (!(err instanceof ApiError)) return fallback;
  const override = statusMessages?.[err.status];
  if (override) return override;
  if (err.status === 429 && err.retryAfter) {
    return `${err.message} Intenta de nuevo en ${formatRetryAfter(err.retryAfter)}.`;
  }
  return err.message;
}
