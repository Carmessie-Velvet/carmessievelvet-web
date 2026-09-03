"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuickAdd } from "@/context/quick-add-context";
import { useCart } from "@/context/cart-context";
import { useLockBodyScroll, useEscapeKey } from "@/lib/use-lock-body-scroll";
import { formatCurrency } from "@/lib/format-currency";
import { isSoldOut } from "@/lib/product-stock";
import type { Size } from "@/types/product";

export function QuickAddModal() {
  const { product, isOpen, close } = useQuickAdd();
  const { addItem, openDrawer } = useCart();
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);

  useLockBodyScroll(isOpen);
  useEscapeKey(close, isOpen);

  function handleClose() {
    close();
    setSelectedSize(null);
  }

  function handleAdd() {
    if (!product || !selectedSize) return;
    addItem(product, selectedSize);
    handleClose();
    openDrawer();
  }

  return (
    <AnimatePresence>
      {isOpen && product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-[2px]"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-add-heading"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-lg overflow-hidden bg-paper shadow-[0_30px_70px_-20px_rgba(42,31,28,0.45)]"
          >
            <div className="relative hidden w-[42%] shrink-0 bg-sand sm:block">
              <Image
                src={product.images[0].src}
                alt={product.images[0].alt}
                fill
                sizes="220px"
                className="object-cover"
              />
            </div>

            <div className="relative flex-1 p-6">
              <button
                type="button"
                onClick={handleClose}
                aria-label="Cerrar"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center text-ink-muted transition-all duration-300 ease-out hover:rotate-90 hover:text-ink"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>

              <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
                {product.category.name}
              </p>
              <h2 id="quick-add-heading" className="mt-1.5 text-xl font-black tracking-tight text-ink">
                {product.name}
              </h2>
              <p className="mt-1 text-sm font-medium uppercase tracking-[0.08em] text-ink-muted">
                {product.compareAtPrice && (
                  <span className="mr-2 line-through opacity-60">
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                )}
                {formatCurrency(product.price)}
              </p>

              <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
                Talla
              </p>
              <div className="mt-2.5 grid grid-cols-4 gap-1.5">
                {product.variants.map((variant) => (
                  <button
                    key={variant.size}
                    type="button"
                    disabled={!variant.inStock}
                    onClick={() => setSelectedSize(variant.size)}
                    aria-pressed={selectedSize === variant.size}
                    className={`h-10 border text-xs font-medium uppercase tracking-wide transition-colors ${
                      !variant.inStock
                        ? "cursor-not-allowed border-sand text-ink-muted/40 line-through"
                        : selectedSize === variant.size
                          ? "border-ink bg-ink text-cream-soft"
                          : "border-sand text-ink hover:border-ink"
                    }`}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={!selectedSize}
                className="mt-6 flex w-full items-center justify-center gap-2 bg-ink px-6 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-cream-soft transition-colors duration-200 hover:bg-velvet disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSoldOut(product) ? "Agotado" : selectedSize ? "Agregar al carrito" : "Elige una talla"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
