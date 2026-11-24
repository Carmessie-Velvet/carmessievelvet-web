import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import type { OrderStatus } from "@/types/order";

// One colour per stage so an order list can be scanned without reading:
// dark = being made, wine = on its way, green = delivered, sand = closed
// without a delivery.
const TONE: Record<OrderStatus, string> = {
  PENDING: "bg-ember/10 text-ember",
  PAID: "bg-ink text-cream-soft",
  PROCESSING: "bg-ink text-cream-soft",
  SHIPPED: "bg-velvet text-cream-soft",
  DELIVERED: "bg-[#2f6f4a]/10 text-[#2f6f4a]",
  CANCELLED: "bg-sand text-ink-muted",
  REFUNDED: "bg-sand text-ink-muted",
  PARTIALLY_REFUNDED: "bg-sand text-ink-muted",
};

export function OrderStatusChip({
  status,
  className = "",
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={`inline-block whitespace-nowrap px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${TONE[status]} ${className}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
