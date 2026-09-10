import type { Product } from "@/types/product";

// A SET product has no `variants` of its own (that array is empty and means
// nothing for it) — it's sellable only when every one of its pieces is, per
// the API's own rule: "el inStock del producto es true sólo si todas las
// prendas tienen inStock: true".
export function isSoldOut(product: Pick<Product, "category" | "variants" | "components">): boolean {
  if (product.category.type === "SET") {
    return product.components.length === 0 || product.components.some((c) => !c.inStock);
  }
  return product.variants.every((variant) => !variant.inStock);
}
