"use client";

import Link from "next/link";
import { useAuthModal } from "@/context/auth-modal-context";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useWishlist } from "@/context/wishlist-context";
import { ProductGrid } from "@/components/product/ProductGrid";
import { buttonClasses } from "@/components/ui/Button";

export default function FavoritosPage() {
  const { open: openAuthModal } = useAuthModal();
  const isAuthenticated = useRequireAuth();
  const { items } = useWishlist();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-ink">
          Mis favoritos
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Inicia sesión para ver tus productos guardados.
        </p>
        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className={`${buttonClasses("solid")} mt-8`}
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-black uppercase tracking-tight text-ink">
        Mis favoritos
      </h1>

      {items.length === 0 && (
        <div className="mt-10 text-center">
          <p className="text-sm text-ink-muted">Todavía no guardaste ningún producto.</p>
          <Link href="/tienda" className={`${buttonClasses("solid")} mt-6`}>
            Ir a la tienda
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-10">
          <ProductGrid products={items.map((item) => item.product)} />
        </div>
      )}
    </div>
  );
}
