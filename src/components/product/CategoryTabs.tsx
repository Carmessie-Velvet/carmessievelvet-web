"use client";

import Link from "next/link";
import { motion } from "framer-motion";

/**
 * The "Todo / Corsets / Sets" tabs on the shop page. The underline slides
 * from one tab to the next (shared `layoutId`) instead of jumping.
 */
export function CategoryTabs({
  categories,
  activeSlug,
}: {
  categories: { slug: string; name: string }[];
  activeSlug: string | undefined;
}) {
  const tabs: { slug: string | undefined; name: string; href: string }[] = [
    { slug: undefined, name: "Todo", href: "/tienda" },
    ...categories.map((cat) => ({
      slug: cat.slug,
      name: cat.name,
      href: `/tienda?categoria=${cat.slug}`,
    })),
  ];

  return (
    <nav aria-label="Categorías" className="flex gap-7 border-b border-sand">
      {tabs.map((tab) => {
        const active = tab.slug === activeSlug;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-h-12 items-center text-xs font-semibold uppercase tracking-[0.17em] transition-colors ${
              active ? "text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            {tab.name}
            {active && (
              <motion.span
                layoutId="shop-tab-underline"
                className="absolute inset-x-0 -bottom-px h-0.5 bg-velvet"
                transition={{ duration: 0.5, ease: [0.22, 0.8, 0.22, 1] }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
