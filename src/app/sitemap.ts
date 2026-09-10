import type { MetadataRoute } from "next";
import { productService } from "@/services/product-service";
import { SITE_URL } from "@/lib/site-url";

const STATIC_PAGES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/tienda", changeFrequency: "daily", priority: 0.9 },
  { path: "/contacto", changeFrequency: "yearly", priority: 0.3 },
  { path: "/preguntas-frecuentes", changeFrequency: "monthly", priority: 0.3 },
  { path: "/devoluciones", changeFrequency: "yearly", priority: 0.3 },
  { path: "/politica-de-privacidad", changeFrequency: "yearly", priority: 0.1 },
  { path: "/terminos-de-servicio", changeFrequency: "yearly", priority: 0.1 },
];

/**
 * Generated from the real catalog (not a static list) — a product added
 * from the admin shows up here on the sitemap's next fetch, no manual
 * step. Categories are included too (`/tienda?categoria=<slug>`): there
 * are only two (`corsets`/`sets`, see `CATEGORY_OVERRIDES` in
 * `product-service.ts`), a finite, meaningful set of pages — not the kind
 * of open-ended query-string pagination that's usually a sitemap
 * anti-pattern.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    productService.getAll(),
    productService.getCategories(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/tienda?categoria=${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/producto/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
