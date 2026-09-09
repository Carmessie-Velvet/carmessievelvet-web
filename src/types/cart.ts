import type { Product, Size } from "./product";

/** One piece of a SET line — mirrors the API's `OrderItemSelection` shape. */
export interface CartSelection {
  componentId: string;
  componentName: string;
  size: Size;
  color?: string;
}

export interface CartItem {
  product: Product;
  /** `category.type === "SIMPLE"` — mutually exclusive with `selections`. */
  size?: Size;
  /** `category.type === "SET"` — one entry per component. */
  selections?: CartSelection[];
  quantity: number;
}
