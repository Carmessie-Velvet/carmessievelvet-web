"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CartItem } from "@/types/cart";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/format-currency";

export function CartLineItem({
  item,
  onNavigate,
}: {
  item: CartItem;
  onNavigate?: () => void;
}) {
  const { removeItem, setQuantity } = useCart();

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="flex gap-4 py-5"
    >
      <Link
        href={`/producto/${item.product.slug}`}
        onClick={onNavigate}
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
        <div className="flex justify-between gap-3">
          <div>
            <Link
              href={`/producto/${item.product.slug}`}
              onClick={onNavigate}
              className="text-sm text-ink"
            >
              {item.product.name}
            </Link>
            <p className="mt-1 text-xs uppercase tracking-[0.1em] text-ink-muted">
              Talla {item.size}
            </p>
          </div>
          <p className="text-sm font-medium text-ink">
            {formatCurrency(item.product.price * item.quantity)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center border border-sand">
            <button
              type="button"
              aria-label="Disminuir cantidad"
              onClick={() =>
                setQuantity(item.product.id, item.size, item.quantity - 1)
              }
              className="flex h-7 w-7 items-center justify-center text-ink hover:bg-cream-soft"
            >
              −
            </button>
            <span className="w-7 text-center text-sm">{item.quantity}</span>
            <button
              type="button"
              aria-label="Aumentar cantidad"
              onClick={() =>
                setQuantity(item.product.id, item.size, item.quantity + 1)
              }
              className="flex h-7 w-7 items-center justify-center text-ink hover:bg-cream-soft"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.product.id, item.size)}
            className="text-xs uppercase tracking-[0.1em] text-ink-muted underline-offset-2 hover:text-velvet hover:underline"
          >
            Quitar
          </button>
        </div>
      </div>
    </motion.li>
  );
}
