import { apiFetch } from "@/lib/api-client";
import type { Hero } from "@/types/hero";

/**
 * The homepage hero banner and the image-only banner section below the
 * brand message — content for both lives entirely in the admin panel
 * (`carmessievelvet-admin`, not this repo), which manages them as the same
 * underlying row discriminated by `section` (see "Banner section" in
 * `carmessievelvet-api`'s hero module `CLAUDE.md`) — this repo just reads
 * two different public endpoints for the two sections. Both are read-only:
 * an empty array means the admin hasn't activated one for that section yet.
 */
export interface HeroService {
  getActive(): Promise<Hero[]>;
  /** `GET /store/hero/banner` — same shape as `getActive()`, `title`/`content`/`buttonLabel`/`buttonPath` are always `null` (a banner is image-only). */
  getActiveBanner(): Promise<Hero[]>;
}

export class RestHeroService implements HeroService {
  async getActive(): Promise<Hero[]> {
    return apiFetch<Hero[]>("/store/hero");
  }

  async getActiveBanner(): Promise<Hero[]> {
    return apiFetch<Hero[]>("/store/hero/banner");
  }
}

export const heroService: HeroService = new RestHeroService();
