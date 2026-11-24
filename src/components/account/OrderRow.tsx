import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";
import { OrderStatusChip } from "@/components/account/OrderStatusChip";
import type { Order } from "@/types/order";

/**
 * One order in a list: photo of the first piece, folio, date and piece count,
 * the status as a coloured tag, and the total. Shared by `/cuenta` (recent
 * orders) and `/cuenta/pedidos` so both lists read the same way.
 */
export function OrderRow({
  order,
  href,
  onClick,
  active = false,
}: {
  order: Order;
  href: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  active?: boolean;
}) {
  const items = order.items ?? [];
  const first = items[0];
  const pieces = items.reduce((sum, item) => sum + item.quantity, 0);
  const date = new Date(order.createdAt).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex min-h-[92px] items-center gap-4 px-4 py-4 transition-colors hover:bg-cream-soft sm:px-5 ${
        active ? "lg:bg-cream-soft" : ""
      }`}
    >
      <div className="relative h-[68px] w-14 shrink-0 overflow-hidden bg-sand">
        {first?.productImage && (
          <Image
            src={first.productImage}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        )}
        {items.length > 1 && (
          <span className="absolute bottom-0 right-0 bg-ink px-1.5 py-0.5 text-[10px] font-semibold leading-none text-cream-soft">
            +{items.length - 1}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{order.orderNumber}</p>
        <p className="mt-0.5 text-xs text-ink-muted">
          {date}
          {pieces > 0 && ` · ${pieces} ${pieces === 1 ? "pieza" : "piezas"}`}
        </p>
        <OrderStatusChip status={order.status} className="mt-2" />
      </div>

      <p className="shrink-0 self-start pt-0.5 text-sm font-bold text-ink">
        {formatCurrency(order.total)}
      </p>
    </Link>
  );
}
