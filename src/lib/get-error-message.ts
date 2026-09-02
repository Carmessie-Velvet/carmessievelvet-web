import { ApiError } from "./api-client";
import { formatRetryAfter } from "./format-retry-after";

/**
 * Turns an ApiError into a user-facing string, appending a "try again in
 * N minutes" hint on 429s (rate-limited auth routes carry `retryAfter`).
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback;
  if (err.status === 429 && err.retryAfter) {
    return `${err.message} Intenta de nuevo en ${formatRetryAfter(err.retryAfter)}.`;
  }
  return err.message;
}
