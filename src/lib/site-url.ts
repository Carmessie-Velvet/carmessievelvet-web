/**
 * Absolute site origin — needed anywhere the Metadata API/sitemap/robots
 * can't infer it themselves (canonical/OG URLs, sitemap entries). Falls
 * back to the real production domain (see "Despliegue" in CLAUDE.md) so
 * metadata still resolves to a valid absolute URL even if
 * `NEXT_PUBLIC_SITE_URL` is never set anywhere — this is public marketing
 * info, not a secret, so a hardcoded fallback is fine.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://carmessievelvet.com.mx";
