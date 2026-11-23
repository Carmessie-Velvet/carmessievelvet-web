"use client";

import type { Product } from "@/types/product";
import { useGridColumns } from "@/lib/grid-columns";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  adjustable = false,
}: {
  products: Product[];
  /**
   * The shop page lets a phone choose one or two columns (the toggle lives in
   * its filter bar); the homepage grid always shows two.
   */
  adjustable?: boolean;
}) {
  const columns = useGridColumns();
  const single = adjustable && columns === 1;

  if (products.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-ink-muted">
        No encontramos piezas en esta categoría todavía.
      </p>
    );
  }

  return (
    // On a phone the photos nearly reach the screen edges, as the client
    // asked, but keep a 6px margin and a 6px gap instead of touching: the
    // text lines up with the photo, and a thumb that misses a button never
    // lands on the screen bezel. `-mx-2.5` cancels 10px of the page's own
    // 16px padding. From `sm` up it's the normal boxed layout.
    <div
      className={`-mx-2.5 grid gap-x-1.5 sm:mx-0 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 ${
        single ? "grid-cols-1 gap-y-9" : "grid-cols-2 gap-y-8 sm:gap-y-10"
      }`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} large={single} />
      ))}
    </div>
  );
}
