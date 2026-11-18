export const EMAIL_MISMATCH_MESSAGE = "Los correos no coinciden.";

/**
 * Whether the two times someone typed their email are the same address.
 * Trimmed and case-insensitive, like the API (which stores `Ana@x.com` and
 * `ana@x.com` as the same mailbox): a capital letter is not a typo worth
 * stopping a purchase for.
 */
export function emailsMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
