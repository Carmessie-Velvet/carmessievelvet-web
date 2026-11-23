"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Product, Size } from "@/types/product";
import { formatCurrency } from "@/lib/format-currency";
import { discountPercent } from "@/lib/discount";
import { formatLeadTime, getLeadTime } from "@/lib/lead-time";
import { canPickSizeInline, inlineSizeOptions } from "@/lib/quick-add-options";
import { useCart } from "@/context/cart-context";
import { useQuickAdd } from "@/context/quick-add-context";
import { useWishlist } from "@/context/wishlist-context";
import { useAuth } from "@/context/auth-context";
import { useAuthModal } from "@/context/auth-modal-context";
import { HeartIcon } from "@/components/icons/HeartIcon";
import { DiscountBadge } from "@/components/product/DiscountBadge";
import { isSoldOut } from "@/lib/product-stock";

/**
 * One product in a grid.
 *
 * Quick add works differently per device on purpose:
 * - **Phone**: a "+" that is always on screen (there is no hover on a phone),
 *   44px, that opens the quick-add sheet.
 * - **Desktop**: an "Agregar rápido" bar that rises over the photo on hover.
 *   For a single piece in one color it opens the sizes right inside the card
 *   (one click on a size and it's in the cart); a set (a size per piece) or a
 *   piece in several colors opens the full dialog instead.
 */
export function ProductCard({
  product,
  large = false,
}: {
  product: Product;
  /** One-column grid on a phone: the photo is big, so the text grows with it. */
  large?: boolean;
}) {
  const [primary, secondary] = product.images;
  const { open: openQuickAdd } = useQuickAdd();
  const { addItem, openDrawer } = useCart();
  const { isAuthenticated } = useAuth();
  const { open: openAuthModal } = useAuthModal();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const soldOut = isSoldOut(product);
  const discount = discountPercent(product);
  const inline = canPickSizeInline(product);
  const sizes = inlineSizeOptions(product);
  const isSet = product.category.type === "SET";

  const [picking, setPicking] = useState(false);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function stop(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleToggleWishlist(e: React.MouseEvent) {
    stop(e);
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    toggle(product).catch(() => {});
  }

  function handleQuickBar(e: React.MouseEvent) {
    stop(e);
    if (inline) setPicking(true);
    else openQuickAdd(product);
  }

  function handlePickSize(e: React.MouseEvent, size: Size) {
    stop(e);
    addItem(product, { size, color: sizes.color });
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => {
      setAdded(false);
      setPicking(false);
    }, 3200);
  }

  function handleMouseLeave() {
    if (!added) setPicking(false);
  }

  const barShown = picking || added;

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group block"
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? `Quitar de favoritos: ${product.name}` : `Agregar a favoritos: ${product.name}`}
          aria-pressed={wishlisted}
          className="absolute right-1 top-1 z-10 flex h-11 w-11 items-center justify-center rounded-full text-ink transition-transform duration-300 active:scale-90"
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-paper/85 transition-colors duration-200 ${
              wishlisted ? "bg-paper" : "group-hover:bg-paper"
            }`}
          >
            <HeartIcon filled={wishlisted} />
          </span>
        </button>

        <motion.div
          className={`relative h-full w-full ${soldOut ? "opacity-80 grayscale-[0.55]" : ""}`}
          whileHover={{ scale: 1.045 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className={`object-cover transition-opacity duration-500 ${
              secondary ? "group-hover:opacity-0" : ""
            }`}
          />
          {secondary && (
            <Image
              src={secondary.src}
              alt={secondary.alt}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </motion.div>

        {soldOut ? (
          <span className="absolute left-2.5 top-2.5 bg-ink px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream-soft">
            Agotado
          </span>
        ) : discount ? (
          <DiscountBadge percent={discount} className="absolute left-2.5 top-2.5" />
        ) : (
          product.isNew && (
            <span className="absolute left-2.5 top-2.5 bg-velvet px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream-soft">
              Nuevo
            </span>
          )
        )}

        {!soldOut && (
          <>
            {/* Phone: always-visible "+" */}
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                openQuickAdd(product);
              }}
              aria-label={`Agregar rápido: ${product.name}`}
              className="absolute bottom-2 right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-paper/95 text-ink shadow-[0_8px_18px_-8px_rgba(42,31,28,0.55)] transition-transform duration-300 active:scale-90 lg:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className="h-[18px] w-[18px]" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>

            {/* Desktop: bar that rises on hover */}
            <div
              onClick={barShown ? stop : undefined}
              className={`absolute inset-x-0 bottom-0 z-10 hidden bg-paper/95 backdrop-blur transition-transform duration-500 ease-[var(--ease-soft)] lg:block ${
                barShown ? "translate-y-0" : "translate-y-full group-hover:translate-y-0"
              }`}
            >
              {added ? (
                <div className="flex h-[88px] items-center justify-center gap-2.5 px-4 text-[12.5px] font-bold text-ink">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#2f6f4a" strokeWidth={2.4} className="h-5 w-5 shrink-0" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  <span>
                    Agregado a tu carrito ·{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        stop(e);
                        openDrawer();
                      }}
                      className="underline underline-offset-2"
                    >
                      Ver carrito
                    </button>
                  </span>
                </div>
              ) : picking ? (
                <div className="px-3.5 pb-3 pt-2.5">
                  <div className="flex items-center justify-between text-[10.5px] font-bold uppercase tracking-[0.18em] text-ink">
                    <span>Elige tu talla</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        stop(e);
                        setPicking(false);
                      }}
                      aria-label="Cerrar"
                      className="flex h-6 w-6 items-center justify-center"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    {sizes.options.map((option) => (
                      <button
                        key={option.size}
                        type="button"
                        disabled={!option.available}
                        onClick={(e) => handlePickSize(e, option.size)}
                        className={`h-[38px] border text-xs font-semibold transition-all duration-200 ${
                          option.available
                            ? "border-sand bg-white text-ink hover:-translate-y-0.5 hover:border-ink"
                            : "cursor-not-allowed border-sand text-ink-muted/40 line-through"
                        }`}
                      >
                        {option.size}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-ink-muted">
                    Hecho sobre pedido · {formatLeadTime(getLeadTime())}
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleQuickBar}
                  className="flex h-11 w-full items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink transition-colors duration-300 hover:bg-velvet hover:text-cream-soft"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  {isSet ? "Elegir prendas" : "Agregar rápido"}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-3 px-0.5 pt-3">
        <p
          className={`font-semibold uppercase leading-tight tracking-[0.05em] text-ink ${
            large ? "text-[15px]" : "text-[13px] sm:text-[13.5px]"
          }`}
        >
          {product.name}
        </p>
        <p
          className={`shrink-0 font-extrabold tracking-[0.01em] ${
            large ? "text-base" : "text-sm"
          } ${soldOut ? "text-ink-muted/70 line-through" : discount ? "text-velvet" : "text-ink"}`}
        >
          {product.compareAtPrice && (
            <span className="mr-1.5 text-xs font-medium text-ink-muted line-through opacity-70">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
          {formatCurrency(product.price)}
        </p>
      </div>
    </Link>
  );
}
