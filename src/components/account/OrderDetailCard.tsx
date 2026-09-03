import Image from "next/image";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import { formatCurrency } from "@/lib/format-currency";
import type { Order } from "@/types/order";

// Shared between the standalone /cuenta/pedidos/[id] page (mobile, and any
// direct link) and the desktop master-detail panel on /cuenta/pedidos —
// same card, two places it gets mounted.
export function OrderDetailCard({ order }: { order: Order }) {
  return (
    <div className="border border-sand bg-paper p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-ink">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.1em] text-ink-muted">
            {new Date(order.createdAt).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span className="shrink-0 bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream-soft">
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {order.trackingNumber && (
        <p className="mt-3 text-sm text-ink-muted">
          Número de rastreo: <span className="text-ink">{order.trackingNumber}</span>
        </p>
      )}

      <ul className="mt-8 flex flex-col divide-y divide-sand border-t border-sand">
        {order.items.map((item) => (
          <li key={item.id} className="flex gap-4 py-4">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-sand">
              <Image
                src={item.productImage}
                alt={item.productName}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 items-center justify-between">
              <div>
                <p className="text-sm text-ink">{item.productName}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.1em] text-ink-muted">
                  Talla {item.size} · Cant. {item.quantity}
                </p>
              </div>
              <p className="text-sm font-medium text-ink">
                {formatCurrency(item.lineTotal, order.currency.toUpperCase())}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-1.5 border-t border-sand pt-6 text-sm">
        <div className="flex justify-between text-ink-muted">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal, order.currency.toUpperCase())}</span>
        </div>
        {order.discountTotal > 0 && (
          <div className="flex justify-between text-ink-muted">
            <span>Descuento{order.couponCode ? ` (${order.couponCode})` : ""}</span>
            <span>−{formatCurrency(order.discountTotal, order.currency.toUpperCase())}</span>
          </div>
        )}
        <div className="flex justify-between font-medium text-ink">
          <span>Total</span>
          <span>{formatCurrency(order.total, order.currency.toUpperCase())}</span>
        </div>
      </div>

      <div className="mt-8 border-t border-sand pt-6">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
          Dirección de envío
        </h2>
        <p className="mt-2 text-sm text-ink">{order.shippingAddress.fullName}</p>
        <p className="text-sm text-ink-muted">
          {order.shippingAddress.line1}
          {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
        </p>
        <p className="text-sm text-ink-muted">
          {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
          {order.shippingAddress.postalCode}
        </p>
      </div>
    </div>
  );
}
