"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { orderService } from "@/services/order-service";
import { ApiError } from "@/lib/api-client";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import { formatCurrency } from "@/lib/format-currency";
import type { Order } from "@/types/order";
import { buttonClasses } from "@/components/ui/Button";

export default function PedidosPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    orderService
      .getMyOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "No se pudieron cargar tus pedidos.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-ink">
          Mis pedidos
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Inicia sesión para ver tu historial de pedidos.
        </p>
        <Link href="/cuenta/login" className={`${buttonClasses("solid")} mt-8`}>
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink">
        Mis pedidos
      </h1>

      {error && <p className="mt-6 text-sm text-velvet">{error}</p>}

      {!error && !orders && (
        <p className="mt-6 text-sm text-ink-muted">Cargando pedidos…</p>
      )}

      {orders && orders.length === 0 && (
        <div className="mt-10 text-center">
          <p className="text-sm text-ink-muted">Todavía no tienes pedidos.</p>
          <Link href="/tienda" className={`${buttonClasses("solid")} mt-6`}>
            Ir a la tienda
          </Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <ul className="mt-8 flex flex-col divide-y divide-sand">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/cuenta/pedidos/${order.id}`}
                className="flex items-center justify-between gap-4 py-5"
              >
                <div>
                  <p className="text-sm text-ink">{order.orderNumber}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.1em] text-ink-muted">
                    {ORDER_STATUS_LABELS[order.status]} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("es-MX")}
                  </p>
                </div>
                <p className="text-sm font-medium text-ink">
                  {formatCurrency(order.total)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
