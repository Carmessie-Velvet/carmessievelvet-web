import type { Product } from "@/types/product";

export function isSoldOut(product: Pick<Product, "variants">): boolean {
  return product.variants.every((variant) => !variant.inStock);
}
