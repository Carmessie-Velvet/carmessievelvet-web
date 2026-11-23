"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { categories } from "@/mocks/categories";
import { categoryImages, INSTAGRAM_URL, quickHelpLinks } from "@/lib/nav-links";
import { useLockBodyScroll, useEscapeKey } from "@/lib/use-lock-body-scroll";
import { useAuth } from "@/context/auth-context";

const EASE = [0.22, 0.8, 0.22, 1] as const;

/**
 * Full-screen menu for phones. The old side drawer had three links and a
 * lot of empty space; this one leads with a photo of each category and puts
 * the pages shoppers look for most (tracking, contact, returns) one tap away.
 * Portaled to <body> — see `Sheet` for why.
 */
export function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { isAuthenticated } = useAuth();
  useLockBodyScroll(isOpen);
  useEscapeKey(onClose, isOpen);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-paper"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-heading"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-sand px-2 pl-5">
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
              className="flex h-11 w-11 items-center justify-center text-ink transition-transform duration-300 ease-out active:rotate-90"
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="flex flex-1 flex-col">
            <div className="grid gap-2.5 p-4">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.08 + i * 0.07 }}
                >
                  <Link
                    href={`/tienda?categoria=${cat.slug}`}
                    onClick={onClose}
                    className="group relative block h-[132px] overflow-hidden bg-sand"
                  >
                    <Image
                      src={categoryImages[cat.slug]}
                      alt=""
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                    <span className="absolute inset-x-4 bottom-3.5 flex items-end justify-between text-cream-soft">
                      <span className="text-[27px] font-black uppercase leading-none tracking-tight">
                        {cat.name}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Ver →</span>
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>

            <Link
              href="/tienda"
              onClick={onClose}
              className="mx-4 flex min-h-14 items-center justify-between border-y border-sand text-sm font-bold uppercase tracking-[0.16em] text-velvet"
            >
              Ver todo
              <span aria-hidden="true">→</span>
            </Link>

            <ul className="mt-2 px-4">
              {quickHelpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="flex min-h-[52px] items-center border-b border-sand/70 text-[15px] text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex items-center justify-between gap-2 px-4 py-4 text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
              <Link href="/cuenta" onClick={onClose} className="flex min-h-11 items-center">
                {isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}
              </Link>
              <Link href="/cuenta/favoritos" onClick={onClose} className="flex min-h-11 items-center">
                Favoritos
              </Link>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center"
              >
                Instagram
              </a>
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
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
