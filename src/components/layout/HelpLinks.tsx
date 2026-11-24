"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { helpLinks } from "@/lib/nav-links";

/**
 * "¿Necesitas algo más?" — the way out of a help or legal page. Those pages
 * used to end in a dead stop; this offers the other help pages (never the one
 * the shopper is already on) from the same list the footer and menus use.
 */
export function HelpLinks({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const links = helpLinks.filter((link) => link.href !== pathname).slice(0, 4);

  return (
    <nav aria-labelledby="help-links-heading" className={`border-t border-sand pt-8 ${className}`}>
      <h2
        id="help-links-heading"
        className="text-xs font-medium uppercase tracking-[0.2em] text-ink"
      >
        ¿Necesitas algo más?
      </h2>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex h-12 items-center justify-between border border-sand bg-paper px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink"
            >
              {link.label}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                className="h-4 w-4 shrink-0 text-ink-muted"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
