import { apiFetch } from "@/lib/api-client";
import { mapProduct, type ApiStoreProduct } from "@/services/product-service";
import type { WishlistItem } from "@/types/wishlist";

interface ApiPaginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiWishlistItem {
  id: string;
  addedAt: string;
  product: ApiStoreProduct;
}

/**
 * Contract for a logged-in user's saved products. `USER`-only on the API —
 * every call here assumes `isAuthenticated` was already checked by the
 * caller (an unauthenticated call just 401s, `apiFetch` sends no token).
 */
export interface WishlistService {
  getAll(): Promise<WishlistItem[]>;
  add(sku: string): Promise<WishlistItem>;
  remove(sku: string): Promise<void>;
}

function mapWishlistItem(api: ApiWishlistItem): WishlistItem {
  return {
    id: api.id,
    addedAt: api.addedAt,
    product: mapProduct(api.product),
  };
}

export class RestWishlistService implements WishlistService {
  async getAll(): Promise<WishlistItem[]> {
    const page = await apiFetch<ApiPaginated<ApiWishlistItem>>("/me/wishlist?limit=100", {
      auth: true,
    });
    return page.items.map(mapWishlistItem);
  }

  async add(sku: string): Promise<WishlistItem> {
    const item = await apiFetch<ApiWishlistItem>("/me/wishlist", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ sku }),
    });
    return mapWishlistItem(item);
  }

  async remove(sku: string): Promise<void> {
    await apiFetch<void>(`/me/wishlist/${encodeURIComponent(sku)}`, {
      method: "DELETE",
      auth: true,
    });
  }
}

export const wishlistService: WishlistService = new RestWishlistService();
