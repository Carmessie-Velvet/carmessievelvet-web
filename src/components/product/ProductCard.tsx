"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/lib/format-currency";
import { useQuickAdd } from "@/context/quick-add-context";
import { useWishlist } from "@/context/wishlist-context";
import { useAuth } from "@/context/auth-context";
import { HeartIcon } from "@/components/icons/HeartIcon";

export function ProductCard({ product }: { product: Product }) {
  const [primary, secondary] = product.images;
  const { open: openQuickAdd } = useQuickAdd();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const router = useRouter();
  const wishlisted = isWishlisted(product.id);

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push("/cuenta/login");
      return;
    }
    toggle(product).catch(() => {});
  }

  return (
    <Link href={`/producto/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? `Quitar de favoritos: ${product.name}` : `Agregar a favoritos: ${product.name}`}
          aria-pressed={wishlisted}
          className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 text-ink transition-colors duration-200 hover:bg-paper"
        >
          <HeartIcon filled={wishlisted} />
        </button>
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
        {product.isNew && (
          <span className="absolute left-3 top-3 bg-velvet px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream-soft">
            Nuevo
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openQuickAdd(product);
          }}
          aria-label={`Agregar rápido: ${product.name}`}
          className="absolute bottom-2.5 right-2.5 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-paper text-ink opacity-0 shadow-[0_6px_16px_-4px_rgba(42,31,28,0.35)] transition-all duration-300 hover:bg-ink hover:text-cream-soft group-hover:translate-y-0 group-hover:opacity-100"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4" aria-hidden="true">
            <path d="M6 8h12l-1 12.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8Z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
        </button>
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
