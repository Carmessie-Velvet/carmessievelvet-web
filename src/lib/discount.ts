import type { Product } from "@/types/product";

/** Rounded percent off, or `null` when the product isn't currently discounted. */
export function discountPercent(product: Pick<Product, "price" | "compareAtPrice">): number | null {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null;
  return Math.round((1 - product.price / product.compareAtPrice) * 100);
}
