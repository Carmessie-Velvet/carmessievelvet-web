"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonClasses } from "@/components/ui/Button";

// Shown when a page throws while rendering (the catalog API being down is the
// usual cause). Keeps the header and footer — it replaces only the page — and
// offers a retry before sending the shopper elsewhere.
export default function Error({
  error,
  retry,
}: {
  error: globalThis.Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[62vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">Algo salió mal</p>
      <h1 className="mt-4 text-4xl font-black uppercase leading-[1.02] tracking-tight text-ink sm:text-5xl">
        No pudimos cargar esta página
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-muted">
        Fue un problema de nuestro lado, no de tu compra ni de tu carrito. Inténtalo de nuevo en un
        momento.
      </p>
      <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <button
          type="button"
          onClick={() => retry()}
          className={buttonClasses("solid", "h-[52px] sm:px-10")}
        >
          Intentar de nuevo
        </button>
        <Link href="/" className={buttonClasses("outline", "h-[52px] sm:px-10")}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
