"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { orderService } from "@/services/order-service";
import { ApiError } from "@/lib/api-client";
import { FormField } from "@/components/ui/FormField";
import { buttonClasses } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { OrderDetailCard } from "@/components/account/OrderDetailCard";
import type { Order } from "@/types/order";

export default function RastrearPedidoPage() {
  return (
    <Suspense fallback={null}>
      <RastrearPedidoContent />
    </Suspense>
  );
}

function RastrearPedidoContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("pedido") ?? "");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    setOrder(null);
    try {
      const result = await orderService.trackGuestOrder(orderNumber.trim(), email.trim());
      setOrder(result);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? "No encontramos un pedido con ese número y correo. Verifica que ambos sean correctos."
          : "No se pudo consultar tu pedido. Intenta de nuevo en unos minutos."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink">
        Rastrear mi pedido
      </h1>
      <p className="mt-3 text-sm text-ink-muted">
        Ingresa tu número de pedido y el correo que usaste al comprar para ver el estatus.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <FormField
          id="orderNumber"
          label="Número de pedido"
          placeholder="CM-001021"
          required
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
        />
        <FormField
          id="email"
          label="Correo electrónico"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p className="text-sm text-velvet">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className={`${buttonClasses("solid")} flex items-center justify-center gap-2`}
        >
          {isLoading && <Spinner className="h-3.5 w-3.5 border-cream-soft/40 border-t-cream-soft" />}
          {isLoading ? "Buscando…" : "Buscar pedido"}
        </button>
      </form>

      {order && (
        <div className="mt-10">
          <OrderDetailCard order={order} />
        </div>
      )}
    </div>
  );
}
