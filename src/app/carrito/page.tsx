"use client";

import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/format-currency";
import { formatLeadTime, getLeadTime } from "@/lib/lead-time";
import { buttonClasses } from "@/components/ui/Button";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { cartItemKey } from "@/lib/cart-item-key";

// The full-page twin of the cart drawer (reached by a direct link): same
// summary, same "Ir a pagar · $X" button and the same made-to-order note, so
// the shopper sees one cart, not two.
export default function CarritoPage() {
  const { items, subtotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[56vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-sand text-ink"
          aria-hidden="true"
        >
          <BagIcon className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-3xl font-black uppercase leading-tight tracking-tight text-ink sm:text-4xl">
          Tu carrito está vacío
        </h1>
        <p className="mt-3 text-sm text-ink-muted">Todavía no agregas ninguna pieza.</p>
        <Link href="/tienda" className={buttonClasses("solid", "mt-8 h-[52px] w-full sm:w-auto sm:px-10")}>
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink sm:text-4xl">
        Tu carrito{" "}
        <span className="text-ink-muted">({itemCount})</span>
      </h1>

      <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-12">
        <ul className="flex flex-col divide-y divide-sand border-y border-sand">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item) => (
              <CartLineItem key={cartItemKey(item)} item={item} />
            ))}
          </AnimatePresence>
        </ul>

        <aside className="mt-8 border border-sand bg-paper p-5 lg:sticky lg:top-[calc(var(--sticky-top)+1.5rem)] lg:mt-0">
          {items.some((item) => item.product.madeToOrder) && (
            <p className="mb-4 flex items-center gap-2.5 border border-sand bg-cream-soft px-3 py-2.5 text-xs text-ink-muted">
              <ScissorsIcon />
              <span>
                Hecho sobre pedido · lo elaboramos para ti en {formatLeadTime(getLeadTime())}
              </span>
            </p>
          )}
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-ink-muted">Subtotal</span>
            <span className="text-lg font-extrabold text-ink">{formatCurrency(subtotal)}</span>
          </div>
          <p className="mb-4 mt-0.5 text-xs text-ink-muted">El envío se calcula al pagar.</p>
          <Link
            href="/checkout"
            className={buttonClasses("solid", "h-14 w-full gap-2.5 bg-velvet hover:bg-ink")}
          >
            <BagIcon className="h-4 w-4" />
            Ir a pagar · {formatCurrency(subtotal)}
          </Link>
          <Link
            href="/tienda"
            className="mt-1 flex h-12 w-full items-center justify-center text-xs font-medium uppercase tracking-[0.16em] text-ink-muted underline-offset-4 hover:text-velvet hover:underline"
          >
            Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  );
}

function BagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      className={className}
      aria-hidden="true"
    >
      <path d="M6 8h12l-1 12.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function ScissorsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-[18px] w-[18px] shrink-0 text-velvet"
      aria-hidden="true"
    >
      <circle cx="6" cy="7" r="2.6" />
      <circle cx="6" cy="17" r="2.6" />
      <path d="M8.3 8.5L20 15M8.3 15.5L20 9" />
    </svg>
  );
}
