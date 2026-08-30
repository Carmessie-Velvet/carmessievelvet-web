import type { Product, Size } from "./product";

export interface CartItem {
  product: Product;
  size: Size;
  quantity: number;
}
