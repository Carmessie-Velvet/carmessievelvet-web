import { apiFetch } from "@/lib/api-client";
import type { Testimonial } from "@/types/testimonial";

interface ApiPaginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Testimonios curados por el admin, mostrados en la home después de "Recién
 * llegado". `GET /store/testimonials` solo devuelve los `visible: true`
 * (la API oculta el resto) — ver el módulo `testimonial` de
 * `carmessievelvet-api`.
 */
export interface TestimonialService {
  getActive(): Promise<Testimonial[]>;
}

export class RestTestimonialService implements TestimonialService {
  async getActive(): Promise<Testimonial[]> {
    // Hasta 20 en una sola llamada — no hay UI de paginación en la home,
    // mismo criterio que `productService.getAll()` con el catálogo.
    const page = await apiFetch<ApiPaginated<Testimonial>>("/store/testimonials?limit=20");
    return page.items;
  }
}

export const testimonialService: TestimonialService = new RestTestimonialService();
