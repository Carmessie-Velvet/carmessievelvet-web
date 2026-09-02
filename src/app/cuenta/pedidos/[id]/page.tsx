"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { orderService } from "@/services/order-service";
import { ApiError } from "@/lib/api-client";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import { formatCurrency } from "@/lib/format-currency";
import type { Order } from "@/types/order";
import { buttonClasses } from "@/components/ui/Button";

export default function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    orderService
      .getMyOrder(id)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError && err.status === 404
              ? "No encontramos ese pedido."
              : "No se pudo cargar el pedido."
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <p className="text-sm text-ink-muted">Inicia sesión para ver este pedido.</p>
        <Link href="/cuenta/login" className={`${buttonClasses("solid")} mt-6`}>
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <p className="text-sm text-velvet">{error}</p>
        <Link href="/cuenta/pedidos" className={`${buttonClasses("outline")} mt-6`}>
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <p className="text-sm text-ink-muted">Cargando pedido…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <Link
        href="/cuenta/pedidos"
        className="text-xs font-medium uppercase tracking-[0.1em] text-ink-muted hover:text-velvet"
      >
        ← Mis pedidos
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
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
