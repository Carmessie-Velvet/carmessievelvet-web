import { orderService } from "@/services/order-service";

const POLL_INTERVAL_MS = 1500;
const MAX_ATTEMPTS = 8;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Stripe's own confirmation is only a client-side signal — the order stays
 * PENDING until the payment_intent.succeeded webhook lands (see
 * docs/API-FRONTEND.md sección 7). Polls the order for up to ~12s so the
 * "confirmando pago" screen has something real to wait on instead of
 * treating Stripe's confirmPayment resolving as "done".
 *
 * Guests have no equivalent endpoint (`/me/orders/:id` is USER-only), so
 * there's nothing to poll — just hold the screen briefly for the same
 * perceived weight before moving on.
 */
export async function waitForOrderPaid(
  orderId: string,
  isAuthenticated: boolean
): Promise<void> {
  if (!isAuthenticated) {
    await delay(POLL_INTERVAL_MS);
    return;
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const order = await orderService.getMyOrder(orderId);
      if (order.status !== "PENDING") return;
    } catch {
      return;
    }
    await delay(POLL_INTERVAL_MS);
  }
}
