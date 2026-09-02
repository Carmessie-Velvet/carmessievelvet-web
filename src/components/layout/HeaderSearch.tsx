"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { productService } from "@/services/product-service";
import { formatCurrency } from "@/lib/format-currency";
import { SlideOver } from "@/components/ui/SlideOver";
import type { Product } from "@/types/product";

export function HeaderSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const trimmed = query.trim();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (trimmed.length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      productService
        .getAll({ search: trimmed })
        .then((products) => setResults(products.slice(0, 6)))
        .catch(() => setResults([]))
        .finally(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [trimmed]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function goToResults() {
    if (!trimmed) return;
    router.push(`/tienda?q=${encodeURIComponent(trimmed)}`);
    close();
  }

  return (
    <>
      <button
        type="button"
        aria-label="Buscar"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center"
      >
        <SearchIcon />
      </button>

      <SlideOver isOpen={open} onClose={close} side="right" labelledBy="search-heading">
        <h2 id="search-heading" className="sr-only">
          Buscar productos
        </h2>
        <div className="flex items-center gap-3 border-b border-sand px-5 py-4">
          <span className="text-ink-muted">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goToResults()}
            placeholder="Buscar…"
            className="flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted"
          />
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar búsqueda"
            className="flex h-8 w-8 items-center justify-center text-ink transition-transform duration-300 ease-out hover:rotate-90"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {trimmed.length < 2 && (
            <p className="text-sm text-ink-muted">Escribe al menos 2 letras para buscar.</p>
          )}
          {trimmed.length >= 2 && isSearching && (
            <p className="text-sm text-ink-muted">Buscando…</p>
          )}
          {trimmed.length >= 2 && !isSearching && results.length === 0 && (
            <p className="text-sm text-ink-muted">Sin resultados para &ldquo;{trimmed}&rdquo;.</p>
          )}
          {results.length > 0 && (
            <>
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
                Resultados
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/producto/${product.slug}`}
                    onClick={close}
                    className="group block"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                      <Image
                        src={product.images[0].src}
                        alt={product.images[0].alt}
                        fill
                        sizes="160px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-2 line-clamp-1 text-xs text-ink">{product.name}</p>
                    <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
                      {formatCurrency(product.price)}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {results.length > 0 && (
          <button
            type="button"
            onClick={goToResults}
            className="border-t border-sand px-5 py-4 text-left text-xs font-medium uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-velvet"
          >
            Buscar &ldquo;{trimmed}&rdquo; →
          </button>
        )}
      </SlideOver>
    </>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-[19px] w-[19px]"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
