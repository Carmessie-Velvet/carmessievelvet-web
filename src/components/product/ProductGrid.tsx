import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-ink-muted">
        No encontramos piezas en esta categoría todavía.
      </p>
    );
  }

  return (
    // `-mx-4 sm:mx-0` breaks out of the page's own px-4 on mobile only — full
    // bleed to the screen edges, matching the reference site's mobile grid
    // (images read noticeably bigger edge-to-edge than boxed in with a wide
    // outer margin). `gap-x-px` mirrors it too: the two columns nearly touch
    // instead of a full gap-x-4 eating into each image's width.
    <div className="-mx-4 grid grid-cols-2 gap-x-px gap-y-10 sm:mx-0 sm:gap-x-6 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
