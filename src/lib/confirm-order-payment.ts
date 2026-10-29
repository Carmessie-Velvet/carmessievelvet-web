import { orderService } from "@/services/order-service";
import type { Order } from "@/types/order";

/**
 * Stripe's own confirmation is only a client-side signal — the order stays
 * PENDING, with its temporary `TMP-` folio, until the backend settles the
 * payment. The `payment_intent.succeeded` webhook usually hasn't arrived yet
 * when the shopper lands on the thank-you screen, so instead of polling for
 * it, this asks the API to check the payment with Stripe right now
 * (`POST /store/orders/confirm-payment`) and returns the order as it stands:
 * `PAID` with the official `CM-` folio, or still `PENDING` if Stripe hasn't
 * settled it (OXXO/SPEI, `processing`).
 *
 * Best-effort on purpose: the shopper already paid (or didn't) by the time
 * this runs, so a failure here — rate limit, network — must never block the
 * success screen. It resolves to `null` and the caller falls back to the
 * folio it already has; the webhook settles the order either way.
 */
export async function confirmOrderPayment(
  orderNumber: string,
  email: string
): Promise<Order | null> {
  try {
    return await orderService.confirmPayment(orderNumber, email);
  } catch {
    return null;
  }
}
