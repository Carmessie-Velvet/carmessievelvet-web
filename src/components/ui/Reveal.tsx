"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Same custom bezier already used for the header search/filter popovers
// (TiendaFilters' popoverMotion) — reused here so the site's motion language
// stays consistent instead of introducing a second "feel".
const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  delay = 0,
  className,
  immediate = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Animate on mount instead of on scroll-into-view — for above-the-fold content. */
  immediate?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      {...(immediate
        ? { animate: { opacity: 1, y: 0 } }
        : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" } })}
    >
      {children}
    </motion.div>
  );
}
