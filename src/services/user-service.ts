import { apiFetch, USER_API_BASE_URL } from "@/lib/api-client";
import type { PaymentMethod, UpdateProfilePayload, UserProfile } from "@/types/user";

/**
 * Contract for the logged-in user's own account data. Talks to
 * `/api/user/*` — the one controller in the API without a `/v1` prefix.
 */
export interface UserService {
  getProfile(): Promise<UserProfile>;
  updateProfile(payload: UpdateProfilePayload): Promise<UserProfile>;
  deleteAccount(): Promise<void>;
  getPaymentMethods(): Promise<PaymentMethod[]>;
  deletePaymentMethod(paymentMethodId: string): Promise<void>;
}

export class RestUserService implements UserService {
  async getProfile(): Promise<UserProfile> {
    return apiFetch<UserProfile>("/user/profile", {
      auth: true,
      base: USER_API_BASE_URL,
    });
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    return apiFetch<UserProfile>("/user/profile", {
      method: "PATCH",
      auth: true,
      base: USER_API_BASE_URL,
      body: JSON.stringify(payload),
    });
  }

  async deleteAccount(): Promise<void> {
    await apiFetch<boolean>("/user/account", {
      method: "DELETE",
      auth: true,
      base: USER_API_BASE_URL,
    });
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return apiFetch<PaymentMethod[]>("/user/payment-methods", {
      auth: true,
      base: USER_API_BASE_URL,
    });
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    await apiFetch<boolean>(
      `/user/payment-methods/${encodeURIComponent(paymentMethodId)}`,
      { method: "DELETE", auth: true, base: USER_API_BASE_URL }
    );
  }
}

export const userService: UserService = new RestUserService();
