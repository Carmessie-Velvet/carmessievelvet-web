import { apiFetch } from "@/lib/api-client";
import type { Order } from "@/types/order";

export interface ReturnRequestInput {
  orderNumber: string;
  email: string;
  reason: string;
}

/**
 * Contract for the public post-delivery return/refund request form
 * (`/devoluciones`, and the shortcut on `/cuenta/pedidos/:id` once an order
 * is delivered) — public, no token, same `orderNumber`+`email`
 * anti-enumeration pairing as order tracking (`OrderService.trackGuestOrder`).
 * Only usable once an order is `DELIVERED`; the confirmation email is sent
 * entirely server-side. Resolves with the updated `Order` (its
 * `returnRequest` now populated) so a caller that already has the order on
 * screen can refresh its local state without a second round trip.
 */
export interface ReturnRequestService {
  submit(payload: ReturnRequestInput): Promise<Order>;
}

export class RestReturnRequestService implements ReturnRequestService {
  async submit(payload: ReturnRequestInput): Promise<Order> {
    return apiFetch<Order>("/store/orders/return-request", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export const returnRequestService: ReturnRequestService = new RestReturnRequestService();
