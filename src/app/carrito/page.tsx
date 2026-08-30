"use client";

import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/format-currency";
import { buttonClasses } from "@/components/ui/Button";
import { CartLineItem } from "@/components/cart/CartLineItem";

export default function CarritoPage() {
  const { items, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center">
        <h1 className="text-3xl font-black uppercase tracking-tight text-ink">
          Tu carrito está vacío
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Todavía no agregas ninguna pieza.
        </p>
        <Link href="/tienda" className={`${buttonClasses("solid")} mt-8`}>
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink sm:text-4xl">
        Tu carrito
      </h1>

      <ul className="mt-8 flex flex-col divide-y divide-sand">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item) => (
            <CartLineItem key={`${item.product.id}-${item.size}`} item={item} />
          ))}
        </AnimatePresence>
      </ul>

      <div className="mt-8 flex flex-col gap-4 border-t border-sand pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
          Subtotal
          <span className="ml-2 text-base font-medium text-ink">
            {formatCurrency(subtotal)}
          </span>
        </p>
        <button
          type="button"
          className={buttonClasses("solid", "w-full sm:w-auto")}
          disabled
          title="El checkout se conecta cuando el backend esté listo"
        >
          Finalizar compra
        </button>
      </div>
    </div>
  );
}
