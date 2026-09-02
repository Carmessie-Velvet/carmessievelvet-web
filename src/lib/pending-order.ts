const PENDING_ORDER_KEY = "carmessie-velvet-pending-order";

// Stripe's off-page confirmation flows (3-D Secure, OXXO, SPEI) navigate the
// shopper away from /checkout entirely — by the time they land back on
// /checkout/retorno, every bit of in-memory order state is gone. This is the
// hand-off: written right before confirmPayment() sends them away, read back
// once Stripe returns.
export interface PendingOrder {
  orderId: string;
  orderNumber: string;
  isAuthenticated: boolean;
  publishableKey: string;
}

export function savePendingOrder(order: PendingOrder) {
  try {
    sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(order));
  } catch {
    // Best-effort — a lost write just means /checkout/retorno falls back to
    // its generic "check your order" state instead of auto-redirecting.
  }
}

export function readPendingOrder(): PendingOrder | null {
  try {
    const raw = sessionStorage.getItem(PENDING_ORDER_KEY);
    return raw ? (JSON.parse(raw) as PendingOrder) : null;
  } catch {
    return null;
  }
}

export function clearPendingOrder() {
  try {
    sessionStorage.removeItem(PENDING_ORDER_KEY);
  } catch {
    // no-op
  }
}
