import type { Product } from "./product";

export interface WishlistItem {
  id: string;
  addedAt: string;
  product: Product;
}
