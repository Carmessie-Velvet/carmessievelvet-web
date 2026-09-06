"use client";

import Link from "next/link";
import { use } from "react";
import { buttonClasses } from "@/components/ui/Button";

export default function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = use(searchParams);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink">
        ¡Gracias por tu compra!
      </h1>
      {order && (
        <div className="mt-6 w-full border border-sand bg-paper px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
            Número de pedido
          </p>
          <p className="mt-1 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            {order}
          </p>
        </div>
      )}
      <p className="mt-4 text-sm text-ink-muted">
        Tu pago está siendo confirmado. Guarda tu número de pedido — al no tener cuenta, es la
        única forma de identificarlo.
      </p>
      <Link href="/tienda" className={`${buttonClasses("solid")} mt-8`}>
        Seguir comprando
      </Link>
      {order && (
        <Link
          href={`/rastrear-pedido?pedido=${encodeURIComponent(order)}`}
          className="mt-4 text-xs font-medium uppercase tracking-[0.1em] text-ink-muted underline-offset-2 hover:text-velvet hover:underline"
        >
          Consulta tu pedido más tarde aquí
        </Link>
      )}
    </div>
  );
}
