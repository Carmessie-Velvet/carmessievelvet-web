"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { categories } from "@/mocks/categories";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, openDrawer } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-sand bg-cream/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 flex-col items-start justify-center gap-1.5 lg:hidden"
          >
            <span className="h-px w-6 bg-ink" />
            <span className="h-px w-6 bg-ink" />
          </button>

          <nav className="hidden items-center gap-6 lg:flex">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/tienda?categoria=${cat.slug}`}
                className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-velvet"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          <Link href="/" aria-label="Carmessie Velvet — inicio" className="shrink-0">
            <Image
              src="/brand/carmessie-mark-ink.png"
              alt="Carmessie Velvet"
              width={186}
              height={32}
              className="h-6 w-auto sm:h-7"
              priority
            />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/tienda"
              className="hidden text-xs font-medium uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-velvet lg:block"
            >
              Ver todo
            </Link>
            <button
              type="button"
              onClick={openDrawer}
              aria-label={`Carrito, ${itemCount} artículo${itemCount === 1 ? "" : "s"}`}
              className="relative flex h-9 w-9 items-center justify-center"
            >
              <BagIcon />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-velvet px-1 text-[10px] font-semibold text-cream-soft">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function BagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      className="h-5 w-5 text-ink"
      aria-hidden="true"
    >
      <path d="M6 8h12l-1 12.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
