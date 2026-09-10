import { apiFetch } from "@/lib/api-client";
import type { Hero } from "@/types/hero";

/**
 * The homepage hero banner — content lives entirely in the admin panel
 * (`carmessievelvet-admin`, not this repo). This is read-only: `GET
 * /store/hero` returns the active, image-ready heroes in `sortOrder`; an
 * empty array means the admin hasn't activated one yet.
 */
export interface HeroService {
  getActive(): Promise<Hero[]>;
}

export class RestHeroService implements HeroService {
  async getActive(): Promise<Hero[]> {
    return apiFetch<Hero[]>("/store/hero");
  }
}

export const heroService: HeroService = new RestHeroService();
