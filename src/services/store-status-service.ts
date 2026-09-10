import { apiFetch } from "@/lib/api-client";
import type { StoreStatus } from "@/types/store-status";

/**
 * Whether the store is accepting orders today — admin-configurable from the
 * admin panel (`PATCH /settings`, `closedDays`). Public, no auth.
 */
export interface StoreStatusService {
  getStatus(): Promise<StoreStatus>;
}

export class RestStoreStatusService implements StoreStatusService {
  async getStatus(): Promise<StoreStatus> {
    return apiFetch<StoreStatus>("/store/status");
  }
}

export const storeStatusService: StoreStatusService = new RestStoreStatusService();
