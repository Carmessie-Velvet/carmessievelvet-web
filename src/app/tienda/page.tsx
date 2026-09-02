import Link from "next/link";
import type { Metadata } from "next";
import type { ProductSortBy } from "@/services/product-service";
import type { Size } from "@/types/product";
import { productService } from "@/services/product-service";
import { ProductGrid } from "@/components/product/ProductGrid";
import { TiendaFilters } from "@/components/product/TiendaFilters";

export const metadata: Metadata = {
  title: "Tienda — Carmessie Velvet",
};

// Catalog data (price, stock) is live in the real API.
export const revalidate = 60;

const SORT_MAP: Record<string, { sortBy: ProductSortBy; sortOrder: "ASC" | "DESC" }> = {
  recientes: { sortBy: "createdAt", sortOrder: "DESC" },
  "precio-asc": { sortBy: "price", sortOrder: "ASC" },
  "precio-desc": { sortBy: "price", sortOrder: "DESC" },
  nombre: { sortBy: "name", sortOrder: "ASC" },
  descuento: { sortBy: "discount", sortOrder: "DESC" },
};

const VALID_SIZES: Size[] = ["XS", "S", "M", "L"];

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoria?: string;
    q?: string;
    talla?: string;
    orden?: string;
  }>;
}) {
  const { categoria, q, talla, orden } = await searchParams;
  const sort = SORT_MAP[orden ?? "recientes"] ?? SORT_MAP.recientes;
  const size = VALID_SIZES.find((s) => s === talla);

  const [products, categories] = await Promise.all([
    productService.getAll({
      categorySlug: categoria,
      search: q,
      size,
      ...sort,
    }),
    productService.getCategories(),
  ]);

  const activeCategory = categories.find((c) => c.slug === categoria);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink sm:text-4xl">
        {activeCategory ? activeCategory.name : "Toda la colección"}
      </h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/tienda"
          className={`px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] transition-colors ${
            !activeCategory
              ? "bg-ink text-cream-soft"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Todo
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/tienda?categoria=${cat.slug}`}
            className={`px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] transition-colors ${
              activeCategory?.slug === cat.slug
                ? "bg-ink text-cream-soft"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <TiendaFilters />

      <div className="mt-10">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
