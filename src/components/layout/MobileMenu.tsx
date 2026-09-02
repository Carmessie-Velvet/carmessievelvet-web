"use client";

import Image from "next/image";
import Link from "next/link";
import { categories } from "@/mocks/categories";
import { SlideOver } from "@/components/ui/SlideOver";
import { useAuth } from "@/context/auth-context";

export function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { isAuthenticated } = useAuth();

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      side="left"
      labelledBy="mobile-menu-heading"
    >
      <div className="flex items-center justify-between border-b border-sand px-5 py-4">
        <Image
          id="mobile-menu-heading"
          src="/brand/carmessie-mark-ink.png"
          alt="Carmessie Velvet"
          width={186}
          height={32}
          className="h-6 w-auto"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="flex h-8 w-8 items-center justify-center text-ink transition-transform duration-300 ease-out hover:rotate-90"
        >
          <CloseIcon />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-5 py-6">
        <ul className="flex flex-col gap-5">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/tienda?categoria=${cat.slug}`}
                onClick={onClose}
                className="text-sm font-medium uppercase tracking-[0.16em] text-ink"
              >
                {cat.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/tienda"
              onClick={onClose}
              className="text-sm font-medium uppercase tracking-[0.16em] text-velvet"
            >
              Ver todo
            </Link>
          </li>
        </ul>
      </nav>

      <div className="flex items-center justify-between border-t border-sand px-5 py-4">
        <Link
          href="/cuenta"
          onClick={onClose}
          className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-velvet"
        >
          {isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}
        </Link>
        <Link
          href="/cuenta/favoritos"
          onClick={onClose}
          className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-velvet"
        >
          Favoritos
        </Link>
      </div>
    </SlideOver>
  );
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
