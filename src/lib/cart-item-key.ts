import type { CartItem } from "@/types/cart";

// A SIMPLE line's identity is product+size; a SET line has no single size,
// so its identity is product+selections (sorted so key order never matters).
// Used to merge/find/remove cart lines instead of the old "productId-size"
// string, which breaks for a set (no `size` to interpolate).
export function cartItemKey(item: Pick<CartItem, "product" | "size" | "selections">): string {
  if (item.selections) {
    const parts = [...item.selections]
      .sort((a, b) => a.componentId.localeCompare(b.componentId))
      .map((s) => `${s.componentId}:${s.size}:${s.color ?? ""}`);
    return `${item.product.id}|${parts.join(",")}`;
  }
  return `${item.product.id}|${item.size}`;
}
