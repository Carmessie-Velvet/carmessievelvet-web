"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthModal } from "@/context/auth-modal-context";
import { useRequireAuth } from "@/lib/use-require-auth";
import { orderService } from "@/services/order-service";
import { ApiError } from "@/lib/api-client";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import { formatCurrency } from "@/lib/format-currency";
import { formatOrderDate } from "@/lib/format-order-date";
import type { Order } from "@/types/order";
import { buttonClasses } from "@/components/ui/Button";
import { OrderDetailCard } from "@/components/account/OrderDetailCard";

export default function PedidosPage() {
  return (
    <Suspense fallback={null}>
      <PedidosPageContent />
    </Suspense>
  );
}

function PedidosPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { open: openAuthModal } = useAuthModal();
  const isAuthenticated = useRequireAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("pedido"));
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

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

  // Desktop's right-hand panel needs *something* selected — default to the
  // first order once the list loads, unless a deep link already named one.
  useEffect(() => {
    if (orders && orders.length > 0 && !selectedId) {
      setSelectedId(orders[0].id);
    }
  }, [orders, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setIsLoadingDetail(true);
    orderService
      .getMyOrder(selectedId)
      .then((data) => {
        if (!cancelled) setSelectedOrder(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingDetail(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  function selectOrder(id: string) {
    setSelectedId(id);
    router.replace(`/cuenta/pedidos?pedido=${id}`, { scroll: false });
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-ink">
          Mis pedidos
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Inicia sesión para ver tu historial de pedidos.
        </p>
        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className={`${buttonClasses("solid")} mt-8`}
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
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
        <div className="mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10">
          <ul className="flex flex-col divide-y divide-sand border border-sand bg-paper">
            {orders.map((order) => {
              const active = order.id === selectedId;
              return (
                <li key={order.id}>
                  <Link
                    href={`/cuenta/pedidos/${order.id}`}
                    onClick={(event) => {
                      if (window.matchMedia("(min-width: 1024px)").matches) {
                        event.preventDefault();
                        selectOrder(order.id);
                      }
                    }}
                    className={`flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:text-velvet lg:px-5 ${
                      active ? "lg:bg-cream-soft" : ""
                    }`}
                  >
                    <div>
                      <p className="text-sm text-ink">{order.orderNumber}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.1em] text-ink-muted">
                        {ORDER_STATUS_LABELS[order.status]} · {formatOrderDate(order.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-ink">
                      {formatCurrency(order.total)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 hidden flex-1 lg:mt-0 lg:block">
            {selectedOrder ? (
              <div className={isLoadingDetail ? "opacity-60 transition-opacity" : "transition-opacity"}>
                <OrderDetailCard order={selectedOrder} />
              </div>
            ) : (
              <div className="border border-sand bg-paper p-6">
                <p className="text-sm text-ink-muted">Cargando pedido…</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
