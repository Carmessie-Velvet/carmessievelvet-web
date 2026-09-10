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
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  sortOrder: number;
}
