import type { Metadata } from "next";
import type { ProductSortBy } from "@/services/product-service";
import type { Size } from "@/types/product";
import { productService } from "@/services/product-service";
import { SITE_URL } from "@/lib/site-url";
import { ProductGrid } from "@/components/product/ProductGrid";
import { TiendaFilters } from "@/components/product/TiendaFilters";
import { CategoryTabs } from "@/components/product/CategoryTabs";
import { Pagination } from "@/components/product/Pagination";


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

// 4 columns on desktop x 3 rows — matches how the grid actually lays out
// (see ProductGrid's lg:grid-cols-4) instead of an arbitrary round number.
const PAGE_SIZE = 12;

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoria?: string;
    q?: string;
    talla?: string;
    orden?: string;
    pagina?: string;
  }>;
}) {
  const { categoria, q, talla, orden, pagina } = await searchParams;
  const sort = SORT_MAP[orden ?? "recientes"] ?? SORT_MAP.recientes;
  const size = VALID_SIZES.find((s) => s === talla);
  const requestedPage = Number(pagina);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [productPage, categories] = await Promise.all([
    productService.getPage({
      categorySlug: categoria,
      search: q,
      size,
      page,
      limit: PAGE_SIZE,
      ...sort,
    }),
    productService.getCategories(),
  ]);
  const products = productPage.items;

  const activeCategory = categories.find((c) => c.slug === categoria);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <BreadcrumbJsonLd categoryName={activeCategory?.name} />
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink sm:text-4xl">
        {activeCategory ? activeCategory.name : "Toda la colección"}
      </h1>

      {/* Tabs and filters stay pinned under the header while the list scrolls,
          so changing category or sorting never means scrolling back up. */}
      <div className="sticky top-[var(--sticky-top)] z-30 -mx-4 bg-cream/95 px-4 pt-4 backdrop-blur sm:-mx-6 sm:px-6">
        <CategoryTabs categories={categories} activeSlug={activeCategory?.slug} />
        <TiendaFilters total={productPage.total} />
      </div>

      <div className="mt-4 sm:mt-6">
        <ProductGrid products={products} adjustable />
      </div>

      <Pagination
        currentPage={productPage.page}
        totalPages={productPage.totalPages}
        total={productPage.total}
        pageSize={PAGE_SIZE}
        searchParams={{ categoria, q, talla, orden }}
      />
    </div>
  );
}
