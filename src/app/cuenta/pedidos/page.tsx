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

const PAGE_SIZE = 8;

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
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialPage = Number(searchParams.get("page"));
  const [page, setPage] = useState(
    Number.isFinite(initialPage) && initialPage > 0 ? initialPage : 1
  );
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("pedido"));
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setIsLoadingList(true);
    orderService
      .getMyOrdersPage(page, PAGE_SIZE)
      .then((data) => {
        if (cancelled) return;
        setOrders(data.items);
        setTotalPages(data.totalPages);
        // Desktop's right-hand panel needs *something* selected — default
        // to this page's first order, unless something's already selected
        // (a deep link, or the shopper's own click). Done right here, off
        // this fetch's own fresh `data.items`, rather than a separate
        // effect watching `orders` — that used to fire against the
        // *previous* page's still-in-state items during the gap before
        // this fetch resolved, re-selecting a stale id out from under the
        // new page.
        setSelectedId((prev) => prev ?? data.items[0]?.id ?? null);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "No se pudieron cargar tus pedidos.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingList(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, page]);

  function buildHref(next: { pedido?: string | null; page: number }) {
    const params = new URLSearchParams();
    if (next.pedido) params.set("pedido", next.pedido);
    if (next.page > 1) params.set("page", String(next.page));
    const qs = params.toString();
    return `/cuenta/pedidos${qs ? `?${qs}` : ""}`;
  }

  function goToPage(next: number) {
    if (next < 1 || next > totalPages || next === page) return;
    setPage(next);
    // A different page's orders won't include whatever was selected before
    // — clear both so the right-hand panel drops the stale card and
    // re-selects the new page's first order instead of staying stuck on
    // one that's no longer in view.
    setSelectedId(null);
    setSelectedOrder(null);
    router.replace(buildHref({ page: next }), { scroll: false });
  }

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
    router.replace(buildHref({ pedido: id, page }), { scroll: false });
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
          <div>
            <ul
              className={`flex flex-col divide-y divide-sand border border-sand bg-paper transition-opacity ${
                isLoadingList ? "opacity-60" : ""
              }`}
            >
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

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-xs font-medium uppercase tracking-[0.1em] text-ink-muted">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="transition-colors disabled:opacity-30 enabled:hover:text-ink"
                >
                  ← Anterior
                </button>
                <span>
                  Página {page} de {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="transition-colors disabled:opacity-30 enabled:hover:text-ink"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>

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
