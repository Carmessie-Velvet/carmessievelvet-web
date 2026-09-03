"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { formatCurrency } from "@/lib/format-currency";
import { buttonClasses } from "@/components/ui/Button";
import { SlideOver } from "@/components/ui/SlideOver";
import { HeartIcon } from "@/components/icons/HeartIcon";
import { CartLineItem } from "./CartLineItem";

type Tab = "cart" | "wishlist";

export function CartDrawer() {
  const { items, subtotal, isDrawerOpen, closeDrawer } = useCart();
  const { items: wishlistItems, toggle: toggleWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState<Tab>("cart");

  // The drawer never unmounts (it's mounted once in the layout and just
  // hidden/shown), so a tab picked on a previous visit would otherwise stick
  // around — e.g. leaving it on "Favoritos" and later adding something to
  // the cart would reopen the drawer on the wrong tab.
  useEffect(() => {
    if (isDrawerOpen) setActiveTab("cart");
  }, [isDrawerOpen]);

  return (
    <SlideOver
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      side="right"
      labelledBy="cart-drawer-heading"
    >
      <div className="border-b border-sand px-5 py-4">
        <div className="flex items-center justify-between">
          <h2
            id="cart-drawer-heading"
            className="text-xs font-medium uppercase tracking-[0.2em] text-ink"
          >
            {activeTab === "cart" ? "Carrito" : "Favoritos"}
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center text-ink transition-transform duration-300 ease-out hover:rotate-90"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-3 flex border-b border-sand">
          <button
            type="button"
            onClick={() => setActiveTab("cart")}
            aria-label={`Ver carrito, ${items.length} artículo${items.length === 1 ? "" : "s"}`}
            aria-pressed={activeTab === "cart"}
            className={tabButtonClass(activeTab === "cart")}
          >
            <BagIcon />
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("wishlist")}
            aria-label={`Ver favoritos, ${wishlistItems.length} producto${wishlistItems.length === 1 ? "" : "s"}`}
            aria-pressed={activeTab === "wishlist"}
            className={tabButtonClass(activeTab === "wishlist")}
          >
            <HeartIcon filled={false} className="h-4 w-4" />
          </button>
        </div>
      </div>

      {activeTab === "cart" ? (
        items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-sm text-ink-muted">Tu carrito está vacío.</p>
            <Link href="/tienda" onClick={closeDrawer} className={buttonClasses("solid")}>
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
                <span className="font-medium text-ink">{formatCurrency(subtotal)}</span>
              </div>
              <Link href="/carrito" onClick={closeDrawer} className={`${buttonClasses("solid")} w-full`}>
                Ver carrito completo
              </Link>
            </div>
          </>
        )
      ) : wishlistItems.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm text-ink-muted">Todavía no guardaste ningún producto.</p>
          <Link href="/tienda" onClick={closeDrawer} className={buttonClasses("solid")}>
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-sand overflow-y-auto px-5">
            {wishlistItems.map((item) => (
              <li key={item.id} className="flex gap-4 py-5">
                <Link
                  href={`/producto/${item.product.slug}`}
                  onClick={closeDrawer}
                  className="relative h-24 w-20 shrink-0 overflow-hidden bg-sand"
                >
                  <Image
                    src={item.product.images[0].src}
                    alt={item.product.images[0].alt}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/producto/${item.product.slug}`}
                      onClick={closeDrawer}
                      className="text-sm text-ink"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-sm font-medium text-ink">
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(item.product).catch(() => {})}
                    className="self-start text-xs uppercase tracking-[0.1em] text-ink-muted underline-offset-2 hover:text-velvet hover:underline"
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-sand px-5 py-5">
            <Link
              href="/cuenta/favoritos"
              onClick={closeDrawer}
              className={`${buttonClasses("solid")} w-full`}
            >
              Ver todos mis favoritos
            </Link>
          </div>
        </>
      )}
    </SlideOver>
  );
}

function tabButtonClass(active: boolean) {
  return `flex h-11 flex-1 items-center justify-center border-b-2 transition-colors duration-200 ${
    active ? "border-ink text-ink" : "border-transparent text-ink-muted hover:text-ink"
  }`;
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

function BagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M6 8h12l-1 12.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
