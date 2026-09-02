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
        <p className="mt-3 text-sm text-ink-muted">
          Tu pedido <span className="text-ink">{order}</span> quedó registrado y tu pago
          está siendo confirmado.
        </p>
      )}
      <p className="mt-2 text-sm text-ink-muted">
        Guarda tu número de pedido — al no tener cuenta, es la única forma de identificarlo.
      </p>
      <Link href="/tienda" className={`${buttonClasses("solid")} mt-8`}>
        Seguir comprando
      </Link>
    </div>
  );
}
