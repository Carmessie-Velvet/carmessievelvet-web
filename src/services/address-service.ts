import { apiFetch } from "@/lib/api-client";
import type { AddressInput, UserAddress } from "@/types/address";

/**
 * Contract for a logged-in user's saved shipping addresses (`USER`-only,
 * same as wishlist/orders — an unauthenticated call just 401s). Selecting
 * one at checkout sends its `id` as `shippingAddressId` instead of a full
 * `shippingAddress` object (see `orderService.createOrder`).
 */
export interface AddressService {
  getAll(): Promise<UserAddress[]>;
  create(payload: AddressInput): Promise<UserAddress>;
  update(id: string, payload: Partial<AddressInput>): Promise<UserAddress>;
  remove(id: string): Promise<void>;
  setDefault(id: string): Promise<UserAddress>;
}

export class RestAddressService implements AddressService {
  async getAll(): Promise<UserAddress[]> {
    return apiFetch<UserAddress[]>("/me/addresses", { auth: true });
  }

  async create(payload: AddressInput): Promise<UserAddress> {
    return apiFetch<UserAddress>("/me/addresses", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    });
  }

  async update(id: string, payload: Partial<AddressInput>): Promise<UserAddress> {
    return apiFetch<UserAddress>(`/me/addresses/${encodeURIComponent(id)}`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(payload),
    });
  }

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/me/addresses/${encodeURIComponent(id)}`, {
      method: "DELETE",
      auth: true,
    });
  }

  async setDefault(id: string): Promise<UserAddress> {
    return apiFetch<UserAddress>(`/me/addresses/${encodeURIComponent(id)}/default`, {
      method: "PATCH",
      auth: true,
    });
  }
}

export const addressService: AddressService = new RestAddressService();
