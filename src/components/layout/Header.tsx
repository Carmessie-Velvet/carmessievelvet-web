"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useAuth } from "@/context/auth-context";
import { useAuthModal } from "@/context/auth-modal-context";
import { categories } from "@/mocks/categories";
import { categoryImages, quickHelpLinks } from "@/lib/nav-links";
import { useScrolled } from "@/lib/use-scrolled";
import { MobileMenu } from "./MobileMenu";
import { HeaderSearch } from "./HeaderSearch";
import { HeartIcon } from "@/components/icons/HeartIcon";

// Every control in the header is at least 44px — the minimum Apple and
// Google recommend for something a thumb has to hit.
const ICON_BUTTON = "flex h-11 w-11 items-center justify-center";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  // The pathname the mega menu was opened on — a page change leaves it
  // pointing at the old one, which closes the menu without an effect.
  const [megaPath, setMegaPath] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { itemCount, openDrawer } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { open: openAuthModal } = useAuthModal();
  const pathname = usePathname();
  const scrolled = useScrolled();

  // Only the homepage opens on a full-bleed hero, so only there does the
  // header start transparent. An open mega menu needs a solid header behind
  // it, so it opts out too.
  const megaOpen = megaPath === pathname;
  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !megaOpen;

  function setMegaOpen(next: boolean) {
    setMegaPath(next ? pathname : null);
  }
  function openMega() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  }
  function scheduleCloseMega() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 170);
  }

  useEffect(() => {
    if (!megaOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMegaOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [megaOpen]);

  const navLinkClass = transparent
    ? "text-xs font-medium uppercase tracking-[0.16em] text-cream-soft/80 transition-colors hover:text-cream-soft"
    : "text-xs font-medium uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-velvet";

  return (
    <>
      <header
        onMouseLeave={scheduleCloseMega}
        className={`relative border-b transition-colors duration-300 ${
          transparent
            ? "border-transparent bg-transparent"
            : "border-sand bg-cream/95 backdrop-blur"
        }`}
      >
        <div
          className={`mx-auto grid max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center px-2 transition-[height,color] duration-300 ease-[var(--ease-soft)] sm:px-4 lg:px-10 ${
            transparent ? "text-cream-soft" : "text-ink"
          } ${scrolled ? "h-[var(--header-h-compact)]" : "h-[var(--header-h)]"}`}
        >
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setMenuOpen(true)}
              className={`${ICON_BUTTON} flex-col items-start justify-center gap-1.5 pl-2.5 lg:hidden`}
            >
              <span className="h-px w-6 bg-current" />
              <span className="h-px w-4 bg-current" />
            </button>

            <nav className="hidden items-center gap-7 lg:flex">
              <Link href="/tienda" onMouseEnter={openMega} onFocus={openMega} className={navLinkClass}>
                Todo
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/tienda?categoria=${cat.slug}`}
                  onMouseEnter={openMega}
                  onFocus={openMega}
                  className={navLinkClass}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" aria-label="Carmessie Velvet — inicio" className="shrink-0">
            <Image
              src={
                transparent
                  ? "/brand/carmessie-mark-white.png"
                  : "/brand/carmessie-mark-ink.png"
              }
              alt="Carmessie Velvet"
              width={186}
              height={32}
              className={`w-auto transition-[height] duration-300 ${
                scrolled ? "h-[21px] lg:h-6" : "h-6 lg:h-[30px]"
              }`}
              priority
            />
          </Link>

          <div className="flex items-center justify-end">
            <HeaderSearch />
            {isAuthenticated ? (
              <Link href="/cuenta" aria-label="Mi cuenta" className={`${ICON_BUTTON} hidden lg:flex`}>
                <UserIcon />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                aria-label="Iniciar sesión"
                className={`${ICON_BUTTON} hidden lg:flex`}
              >
                <UserIcon />
              </button>
            )}
            {isAuthenticated ? (
              <Link
                href="/cuenta/favoritos"
                aria-label={`Favoritos, ${wishlistItems.length} producto${wishlistItems.length === 1 ? "" : "s"}`}
                className={`${ICON_BUTTON} relative hidden lg:flex`}
              >
                <HeartIcon filled={false} className="h-5 w-5" />
                {wishlistItems.length > 0 && <Badge count={wishlistItems.length} />}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                aria-label="Favoritos"
                className={`${ICON_BUTTON} hidden lg:flex`}
              >
                <HeartIcon filled={false} className="h-5 w-5" />
              </button>
            )}
            <button
              type="button"
              onClick={openDrawer}
              aria-label={`Carrito, ${itemCount} artículo${itemCount === 1 ? "" : "s"}`}
              className={`${ICON_BUTTON} relative`}
            >
              <BagIcon />
              {itemCount > 0 && <Badge count={itemCount} />}
            </button>
          </div>
        </div>

        {/* Desktop mega menu: opens under the header while the pointer is on a
            category link or on the panel itself. */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.22, 0.8, 0.22, 1] }}
              onMouseEnter={openMega}
              className="absolute inset-x-0 top-full hidden border-t border-sand bg-paper text-ink shadow-[0_30px_50px_-30px_rgba(42,31,28,0.45)] lg:block"
            >
              <div className="mx-auto grid max-w-[1240px] grid-cols-[1fr_1fr_240px] gap-6 px-10 pb-9 pt-7">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/tienda?categoria=${cat.slug}`}
                    onClick={() => setMegaOpen(false)}
                    className="group relative block h-52 overflow-hidden bg-sand"
                  >
                    <Image
                      src={categoryImages[cat.slug]}
                      alt=""
                      fill
                      sizes="400px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                    <span className="absolute inset-x-5 bottom-4 flex items-end justify-between text-cream-soft">
                      <span className="text-2xl font-black uppercase leading-none tracking-tight">
                        {cat.name}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Ver →</span>
                    </span>
                  </Link>
                ))}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                    Ayuda
                  </p>
                  <ul className="mt-2">
                    {quickHelpLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setMegaOpen(false)}
                          className="block border-b border-sand/60 py-3 text-[14.5px] transition-[padding,color] duration-300 hover:pl-1.5 hover:text-velvet"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <span className="absolute right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-velvet px-1 text-[10px] font-semibold text-cream-soft">
      {count}
    </span>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5 20c0-3.6 3.13-6 7-6s7 2.4 7 6" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M6 8h12l-1 12.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
