import Link from "next/link";
import type { Metadata } from "next";
import { productService } from "@/services/product-service";
import { ProductGrid } from "@/components/product/ProductGrid";

export const metadata: Metadata = {
  title: "Tienda — Carmessie Velvet",
};

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const [products, categories] = await Promise.all([
    productService.getAll({ categorySlug: categoria }),
    productService.getCategories(),
  ]);

  const activeCategory = categories.find((c) => c.slug === categoria);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink sm:text-4xl">
        {activeCategory ? activeCategory.name : "Toda la colección"}
      </h1>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-sand pb-6">
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

      <div className="mt-10">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
