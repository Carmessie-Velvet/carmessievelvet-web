import Link from "next/link";
import type { Metadata } from "next";
import type { ProductSortBy } from "@/services/product-service";
import type { Size } from "@/types/product";
import { productService } from "@/services/product-service";
import { SITE_URL } from "@/lib/site-url";
import { ProductGrid } from "@/components/product/ProductGrid";
import { TiendaFilters } from "@/components/product/TiendaFilters";

// Catalog data (price, stock) is live in the real API.
export const revalidate = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}): Promise<Metadata> {
  const { categoria } = await searchParams;
  if (!categoria) {
    return {
      title: "Tienda",
      description:
        "Todo el catálogo de Carmessie Velvet — corsets y sets de tiraje corto.",
      alternates: { canonical: "/tienda" },
    };
  }

  const categories = await productService.getCategories();
  const category = categories.find((c) => c.slug === categoria);
  if (!category) return { title: "Tienda" };

  return {
    title: category.name,
    description: `${category.name} — Carmessie Velvet. Corsets y sets de tiraje corto.`,
    alternates: { canonical: `/tienda?categoria=${category.slug}` },
  };
}

function BreadcrumbJsonLd({ categoryName }: { categoryName?: string }) {
  const items = [
    { name: "Inicio", url: SITE_URL },
    { name: "Tienda", url: `${SITE_URL}/tienda` },
    ...(categoryName
      ? [{ name: categoryName, url: `${SITE_URL}/tienda` }]
      : []),
  ];
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

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
      <BreadcrumbJsonLd categoryName={activeCategory?.name} />
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink sm:text-4xl">
        {activeCategory ? activeCategory.name : "Toda la colección"}
      </h1>

      <div className="mt-6 flex gap-6 border-b border-sand">
        <Link
          href="/tienda"
          className={`border-b-2 py-3 text-xs font-medium uppercase tracking-[0.16em] transition-colors ${
            !activeCategory
              ? "border-ink text-ink"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          Todo
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/tienda?categoria=${cat.slug}`}
            className={`border-b-2 py-3 text-xs font-medium uppercase tracking-[0.16em] transition-colors ${
              activeCategory?.slug === cat.slug
                ? "border-ink text-ink"
                : "border-transparent text-ink-muted hover:text-ink"
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
