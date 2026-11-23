"use client";

import { useEffect, useState, type RefObject } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/lib/format-currency";

/** True once the element has scrolled up and out of the top of the screen. */
function useScrolledPast(ref: RefObject<HTMLElement | null>): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPast(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return past;
}

/**
 * On a phone, the main "add to cart" button is far above once you have read
 * down the page. This bar appears when it scrolls out of view, so buying is
 * always one thumb-tap away. Phone only: on desktop the form is already in
 * view next to the photos.
 */
export function StickyBuyBar({
  product,
  anchorRef,
  label,
  ready,
  onPress,
}: {
  product: Product;
  /** The main button (or its wrapper) — the bar shows once it is scrolled past. */
  anchorRef: RefObject<HTMLElement | null>;
  label: string;
  ready: boolean;
  onPress: () => void;
}) {
  const visible = useScrolledPast(anchorRef);

  return (
    <motion.div
      initial={false}
      animate={{ y: visible ? 0 : "110%" }}
      transition={{ duration: 0.5, ease: [0.22, 0.8, 0.22, 1] }}
      inert={!visible}
      className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3.5 border-t border-sand bg-paper/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold uppercase tracking-[0.06em] text-ink">{product.name}</p>
        <p className="text-[15px] font-extrabold text-ink">{formatCurrency(product.price)}</p>
      </div>
      <button
        type="button"
        onClick={onPress}
        className={`h-12 shrink-0 basis-[52%] px-3 text-[11.5px] font-bold uppercase tracking-[0.16em] transition-colors duration-300 ${
          ready ? "bg-ink text-cream-soft hover:bg-velvet" : "bg-ink/40 text-cream-soft"
        }`}
      >
        {label}
      </button>
    </motion.div>
  );
}
