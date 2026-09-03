"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";

const TABS = [
  { href: "/cuenta", label: "Resumen" },
  { href: "/cuenta/pedidos", label: "Pedidos" },
  { href: "/cuenta/favoritos", label: "Favoritos" },
];

// Wraps every /cuenta/* route in one persistent header + tab nav, so a
// shopper three levels deep (a single order's detail page, say) always has
// a way back to any other account section — not just a "← Mis pedidos"
// link tied to that one page.
export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Navigate away first, then clear the session — otherwise the /cuenta/*
  // page still mounted for that instant re-renders unauthenticated and pops
  // the login modal right as the shopper is leaving, which reads as broken.
  async function handleLogout() {
    setIsLoggingOut(true);
    router.push("/");
    await logout();
  }

  // `children` stays at the exact same position in this tree whether or not
  // the header/nav renders — switching between `<>{children}</>` and a
  // wrapping `<div>` here previously changed children's structural position,
  // which makes React remount the page underneath instead of re-rendering
  // it. That remount was itself the bug: it reset the child page's "was I
  // ever authenticated" guard, so logging out re-triggered the very modal
  // this component exists to avoid popping.
  return (
    <div>
      {isAuthenticated && user && (
        <div className="border-b border-sand bg-cream-soft">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-cream-soft">
                {user.email.charAt(0).toUpperCase()}
              </span>
              <p className="truncate text-sm text-ink-muted">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="shrink-0 text-xs font-medium uppercase tracking-[0.1em] text-ink-muted underline-offset-2 hover:text-velvet hover:underline"
            >
              {isLoggingOut ? "Cerrando…" : "Cerrar sesión"}
            </button>
          </div>
          <nav className="mx-auto flex max-w-7xl gap-6 px-4 sm:px-6">
            {TABS.map((tab) => {
              const active =
                tab.href === "/cuenta" ? pathname === "/cuenta" : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`border-b-2 py-3 text-xs font-medium uppercase tracking-[0.14em] transition-colors ${
                    active
                      ? "border-ink text-ink"
                      : "border-transparent text-ink-muted hover:text-ink"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
      {children}
    </div>
  );
}
