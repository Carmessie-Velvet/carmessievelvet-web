"use client";

import { useState } from "react";

export function Accordion({
  items,
  defaultOpenIndex = null,
}: {
  items: { question: string; answer: React.ReactNode }[];
  /** Which item starts open (none by default). */
  defaultOpenIndex?: number | null;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  return (
    <div className="flex flex-col divide-y divide-sand border-y border-sand">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium uppercase tracking-[0.08em] text-ink"
            >
              {item.question}
              <span
                className={`shrink-0 text-lg leading-none text-ink-muted transition-transform duration-500 ease-[var(--ease-soft)] ${
                  isOpen ? "rotate-45" : ""
                }`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            {/* Height animates through the grid-rows trick: 0fr -> 1fr. */}
            <div
              className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-soft)] ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <div className="pb-4 text-sm leading-relaxed text-ink-muted">{item.answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
