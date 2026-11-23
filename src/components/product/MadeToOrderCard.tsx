"use client";

import { motion } from "framer-motion";
import { formatLeadTime, getLeadTime } from "@/lib/lead-time";

const STEPS = ["Pagas", "Elaboramos", "Enviamos"];

/**
 * "Hecho sobre pedido" used to be one gray line of small text under the size
 * buttons. Every piece here is made after it is bought, which is the thing a
 * first-time shopper most needs to understand before paying, so it gets its
 * own card, with the three steps drawn.
 */
export function MadeToOrderCard() {
  return (
    <div className="flex items-start gap-3.5 border border-sand bg-cream-soft p-4">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="mt-0.5 h-[26px] w-[26px] shrink-0 text-velvet"
        aria-hidden="true"
      >
        <circle cx="6" cy="7" r="2.6" />
        <circle cx="6" cy="17" r="2.6" />
        <path d="M8.3 8.5L20 15M8.3 15.5L20 9" />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-bold">Hecho sobre pedido, solo para ti</p>
        <p className="mt-0.5 text-[13px] text-ink-muted">
          Cada pieza se elabora después de tu compra. Tiempo de elaboración: {formatLeadTime(getLeadTime())}.
        </p>
        <ol className="mt-3.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
          {STEPS.map((step, i) => (
            <li key={step} className="contents">
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.35 }}
              >
                {step}
              </motion.span>
              {i < STEPS.length - 1 && (
                <motion.i
                  aria-hidden="true"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.35, ease: [0.22, 0.8, 0.22, 1] }}
                  className="h-px flex-1 origin-left bg-velvet-light"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
