// Shared by cart lines (CartSelection) and order lines (OrderItemSelection)
// — both carry the same componentName/size/color shape, so one formatter
// covers a line's "Talla M" (simple) vs "Top M · Negro / Panty S · Negro"
// (set) display everywhere a cart/order line is rendered.
interface SelectionLike {
  componentName: string;
  size: string;
  color?: string;
}

export function formatVariantMeta(
  size: string | null | undefined,
  selections?: SelectionLike[] | null
): string {
  if (selections && selections.length > 0) {
    return selections
      .map((s) => `${s.componentName} ${s.size}${s.color ? ` · ${s.color}` : ""}`)
      .join(" / ");
  }
  return `Talla ${size}`;
}
