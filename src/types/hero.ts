/**
 * A homepage hero slide, from `GET /store/hero` (public — only active heroes
 * that already have an image). `title`/`content`/`buttonLabel`/`buttonPath`
 * come back `null` when the admin turned that piece off — render only what
 * isn't `null`, never assume all four are present.
 */
export interface Hero {
  id: string;
  /** Small eyebrow label above the headline (e.g. "Nueva colección"). */
  title: string | null;
  /** The big headline. */
  content: string | null;
  buttonLabel: string | null;
  /** Relative path only (the API rejects absolute URLs) — safe to use as a Link href. */
  buttonPath: string | null;
  /** Desktop, ~16:9. */
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  /**
   * Mobile, ~4:5 — a separate crop the admin uploads on purpose, not a CSS
   * crop of `imageUrl`. `null` for a hero activated before this field
   * existed — fall back to `imageUrl` in that case (see `page.tsx`).
   */
  imageMobileUrl: string | null;
  imageMobileWidth: number | null;
  imageMobileHeight: number | null;
  sortOrder: number;
}
