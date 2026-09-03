"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useAuthModal } from "@/context/auth-modal-context";
import { useRequireAuth } from "@/lib/use-require-auth";
import { orderService } from "@/services/order-service";
import { ApiError } from "@/lib/api-client";
import type { Order } from "@/types/order";
import { buttonClasses } from "@/components/ui/Button";
import { OrderDetailCard } from "@/components/account/OrderDetailCard";

export default function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { open: openAuthModal } = useAuthModal();
  const isAuthenticated = useRequireAuth();
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
        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className={`${buttonClasses("solid")} mt-6`}
        >
          Iniciar sesión
        </button>
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

      <div className="mt-6">
        <OrderDetailCard order={order} />
      </div>
    </div>
  );
}
