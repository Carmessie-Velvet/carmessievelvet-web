"use client";

import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/format-currency";
import { buttonClasses } from "@/components/ui/Button";
import { SlideOver } from "@/components/ui/SlideOver";
import { CartLineItem } from "./CartLineItem";

export function CartDrawer() {
  const { items, subtotal, isDrawerOpen, closeDrawer } = useCart();

  return (
    <SlideOver
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      side="right"
      labelledBy="cart-drawer-heading"
    >
      <div className="flex items-center justify-between border-b border-sand px-5 py-4">
        <h2
          id="cart-drawer-heading"
          className="text-xs font-medium uppercase tracking-[0.2em] text-ink"
        >
          Carrito
        </h2>
        <button
          type="button"
          onClick={closeDrawer}
          aria-label="Cerrar carrito"
          className="flex h-8 w-8 items-center justify-center text-ink"
        >
          <CloseIcon />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm text-ink-muted">Tu carrito está vacío.</p>
          <Link
            href="/tienda"
            onClick={closeDrawer}
            className={buttonClasses("solid")}
          >
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-sand overflow-y-auto px-5">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((item) => (
                <CartLineItem
                  key={`${item.product.id}-${item.size}`}
                  item={item}
                  onNavigate={closeDrawer}
                />
              ))}
            </AnimatePresence>
          </ul>

          <div className="border-t border-sand px-5 py-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-ink-muted">Subtotal</span>
              <span className="font-medium text-ink">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <Link
              href="/carrito"
              onClick={closeDrawer}
              className={`${buttonClasses("solid")} w-full`}
            >
              Ver carrito completo
            </Link>
          </div>
        </>
      )}
    </SlideOver>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
