"use client";

import { useState } from "react";

export function Accordion({ items }: { items: { question: string; answer: React.ReactNode }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
              className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium uppercase tracking-[0.08em] text-ink"
            >
              {item.question}
              <span
                className={`shrink-0 text-lg leading-none text-ink-muted transition-transform duration-300 ${
                  isOpen ? "rotate-45" : ""
                }`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            {isOpen && (
              <div className="pb-4 text-sm leading-relaxed text-ink-muted">{item.answer}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
