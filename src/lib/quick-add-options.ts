import type { Product, ProductComponentOption } from "@/types/product";

/**
 * Can this product be added straight from its card, by picking only a size?
 * True for a single piece (not a set) with at most one color — nothing else to
 * choose. A set (a size per piece) or a piece offered in several colors needs
 * the full quick-add dialog instead.
 */
export function canPickSizeInline(product: Product): boolean {
  return product.category.type === "SIMPLE" && product.colors.length <= 1;
}

/** The size options to show for a product that passes `canPickSizeInline`. */
export function inlineSizeOptions(product: Product): {
  options: ProductComponentOption[];
  color: string | undefined;
} {
  const color = product.colors.length === 1 ? product.colors[0] : undefined;
  const options =
    product.colors.length === 1
      ? product.options.filter((option) => option.color === color)
      : product.options;
  return { options, color };
}
