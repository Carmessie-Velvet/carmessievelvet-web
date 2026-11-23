"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { productService } from "@/services/product-service";
import { formatCurrency } from "@/lib/format-currency";
import { categories } from "@/mocks/categories";
import { useLockBodyScroll, useEscapeKey } from "@/lib/use-lock-body-scroll";
import type { Product } from "@/types/product";

const EASE = [0.22, 0.8, 0.22, 1] as const;

/**
 * Search overlay. Full screen on a phone, a panel dropping from the top of
 * the page on desktop. Before the shopper types anything it already offers
 * something to tap (the categories and what just arrived) instead of an
 * empty "write at least 2 letters" line.
 */
export function HeaderSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[] | null>(null);

  const trimmed = query.trim();

  useLockBodyScroll(open);
  useEscapeKey(close, open);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (open) {
      // After the open animation has started, so the keyboard doesn't fight it.
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  // What just arrived — fetched the first time the overlay opens, not on
  // every page load.
  useEffect(() => {
    if (!open || suggestions) return;
    let cancelled = false;
    productService
      .getNewArrivals(6)
      .then((items) => {
        if (!cancelled) setSuggestions(items);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, suggestions]);

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
        className="flex h-11 w-11 items-center justify-center"
      >
        <SearchIcon />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div
                className="fixed inset-0 z-50"
                role="dialog"
                aria-modal="true"
                aria-labelledby="search-heading"
              >
                <motion.div
                  className="absolute inset-0 hidden bg-ink/45 lg:block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={close}
                  aria-hidden="true"
                />
                <motion.div
                  className="absolute inset-0 flex flex-col overflow-hidden bg-paper lg:inset-x-0 lg:bottom-auto lg:max-h-[84vh]"
                  initial={{ opacity: 0, y: -24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <h2 id="search-heading" className="sr-only">
                    Buscar productos
                  </h2>
                  <div className="relative flex shrink-0 items-center gap-3 border-b border-sand px-4 py-3 lg:px-10 lg:py-5">
                    <div className="mx-auto flex h-12 w-full max-w-3xl items-center gap-3 rounded-full border border-sand bg-cream-soft px-4 transition-colors focus-within:border-ink">
                      <span className="text-ink-muted">
                        <SearchIcon />
                      </span>
                      <input
                        ref={inputRef}
                        type="search"
                        enterKeyHint="search"
                        autoComplete="off"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && goToResults()}
                        placeholder="Buscar corsets, sets…"
                        className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={close}
                      className="flex h-11 shrink-0 items-center px-1 text-xs font-bold uppercase tracking-[0.14em] text-ink lg:absolute lg:right-9"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-4 pb-8 lg:px-10">
                    {trimmed.length < 2 ? (
                      <>
                        <p className="mb-3 mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                          Categorías
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((cat) => (
                            <Link
                              key={cat.slug}
                              href={`/tienda?categoria=${cat.slug}`}
                              onClick={close}
                              className="flex h-11 items-center border border-sand bg-paper px-5 text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink"
                            >
                              {cat.name}
                            </Link>
                          ))}
                          <Link
                            href="/tienda"
                            onClick={close}
                            className="flex h-11 items-center border border-sand bg-paper px-5 text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink"
                          >
                            Todo
                          </Link>
                        </div>

                        {suggestions && suggestions.length > 0 && (
                          <>
                            <p className="mb-3 mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                              Recién llegado
                            </p>
                            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:gap-5 lg:px-0 [&::-webkit-scrollbar]:hidden">
                              {suggestions.map((product) => (
                                <Link
                                  key={product.id}
                                  href={`/producto/${product.slug}`}
                                  onClick={close}
                                  className="group block w-[124px] shrink-0 lg:w-[150px]"
                                >
                                  <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                                    <Image
                                      src={product.images[0].src}
                                      alt={product.images[0].alt}
                                      fill
                                      sizes="150px"
                                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                  </div>
                                  <p className="mt-2 line-clamp-1 text-xs text-ink">{product.name}</p>
                                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
                                    {formatCurrency(product.price)}
                                  </p>
                                </Link>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : isSearching ? (
                      <p className="mt-6 text-sm text-ink-muted">Buscando…</p>
                    ) : results.length === 0 ? (
                      <p className="mt-6 text-sm text-ink-muted">
                        Sin resultados para &ldquo;{trimmed}&rdquo;.
                      </p>
                    ) : (
                      <>
                        <p className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                          {results.length} resultado{results.length === 1 ? "" : "s"}
                        </p>
                        <div className="lg:grid lg:grid-cols-3 lg:gap-x-6">
                          {results.map((product) => (
                            <Link
                              key={product.id}
                              href={`/producto/${product.slug}`}
                              onClick={close}
                              className="flex items-center gap-4 border-b border-sand/60 py-3"
                            >
                              <span className="relative h-[70px] w-14 shrink-0 overflow-hidden bg-sand">
                                <Image
                                  src={product.images[0].src}
                                  alt=""
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm text-ink">{product.name}</span>
                                <span className="block text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
                                  {formatCurrency(product.price)}
                                </span>
                              </span>
                            </Link>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={goToResults}
                          className="mt-4 flex min-h-11 items-center text-xs font-bold uppercase tracking-[0.12em] text-velvet"
                        >
                          Ver todos los resultados de &ldquo;{trimmed}&rdquo; →
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
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
