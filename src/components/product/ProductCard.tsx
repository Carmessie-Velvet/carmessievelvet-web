"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/lib/format-currency";

export function ProductCard({ product }: { product: Product }) {
  const [primary, secondary] = product.images;

  return (
    <Link href={`/producto/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        <motion.div
          className="relative h-full w-full"
          whileHover={{ scale: 1.045 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
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
        {product.isNew && (
          <span className="absolute left-3 top-3 bg-velvet px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream-soft">
            Nuevo
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <p className="text-sm text-ink">{product.name}</p>
      </div>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-ink-muted">
        {product.compareAtPrice && (
          <span className="mr-2 line-through opacity-60">
            {formatCurrency(product.compareAtPrice)}
          </span>
        )}
        {formatCurrency(product.price)}
      </p>
    </Link>
  );
}
