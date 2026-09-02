"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useWishlist } from "@/context/wishlist-context";
import { HeartIcon } from "@/components/icons/HeartIcon";
import type { Product } from "@/types/product";

export function WishlistButton({ product }: { product: Product }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  function handleClick() {
    if (!isAuthenticated) {
      router.push("/cuenta/login");
      return;
    }
    toggle(product).catch(() => {});
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={wishlisted}
      className="mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-velvet"
    >
      <HeartIcon filled={wishlisted} />
      {wishlisted ? "En tu lista de favoritos" : "Agregar a favoritos"}
    </button>
  );
}
