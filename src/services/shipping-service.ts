import { apiFetch } from "@/lib/api-client";
import type { ShippingMethod } from "@/types/shipping";

interface ApiShippingMethod {
  id: string;
  code: string;
  /** Cents, like every other amount this API returns. */
  priceMinor: number;
  description?: string;
}

/**
 * Contract for the shipping-method catalog. It's a live, admin-editable table
 * — options can be added, repriced or retired at any time — so the checkout
 * must always paint its selector from this list instead of hardcoding
 * `STANDARD`/`EXPRESS`, and `POST /orders` reprices server-side from the same
 * rows (the order body never carries a shipping amount).
 */
export interface ShippingService {
  getMethods(): Promise<ShippingMethod[]>;
}

function mapShippingMethod(api: ApiShippingMethod): ShippingMethod {
  return {
    id: api.id,
    code: api.code,
    price: api.priceMinor / 100,
    description: api.description,
  };
}

export class RestShippingService implements ShippingService {
  async getMethods(): Promise<ShippingMethod[]> {
    // Public, no auth — same `/store/*` surface as the catalog.
    const methods = await apiFetch<ApiShippingMethod[]>("/store/shipping-methods");
    return methods.map(mapShippingMethod);
  }
}

export const shippingService: ShippingService = new RestShippingService();
