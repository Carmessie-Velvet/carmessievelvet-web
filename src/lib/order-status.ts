import type { OrderStatus } from "@/types/order";

// Customer-facing wording. PAID/PROCESSING deliberately don't say "Pagado" /
// "En preparación": every piece is made to order, so the customer was reading
// "Pagado" as "payment received, nobody has started on it yet". The payment
// confirmation itself is still spelled out in OrderStatusStepper's note.
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendiente de pago",
  PAID: "En elaboración",
  PROCESSING: "En empaquetado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
  PARTIALLY_REFUNDED: "Reembolsado parcialmente",
};
