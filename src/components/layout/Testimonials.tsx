"use client";

import type { Testimonial } from "@/types/testimonial";
import { Reveal } from "@/components/ui/Reveal";
import { useDragScroll } from "@/lib/use-drag-scroll";

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.4}
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5l2.6 5.4 5.9.7-4.3 4.1 1.1 5.8L12 16.6l-5.3 2.9 1.1-5.8-4.3-4.1 5.9-.7L12 3.5z"
      />
    </svg>
  );
}

/**
 * Reseñas de clientes, en carrusel horizontal después de "Recién llegado" —
 * pedido explícito de la clienta. Mismo patrón de scroll (`useDragScroll`,
 * sin scrollbar visible, click-y-arrastra o swipe) que `VideoShowcase`, para
 * que el sitio no termine con dos formas distintas de hacer lo mismo.
 */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const { trackRef, dragHandlers } = useDragScroll<HTMLDivElement>();

  if (testimonials.length === 0) return null;

  return (
    <section className="bg-paper py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <h2 className="mb-8 text-2xl font-black uppercase tracking-tight text-ink sm:text-3xl">
            Lo que dicen de nosotras
          </h2>
        </Reveal>
        <div
          ref={trackRef}
          {...dragHandlers}
          className="flex cursor-grab gap-4 overflow-x-auto [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        >
          {testimonials.map((t, i) => (
            <Reveal
              key={t.id}
              delay={i * 0.06}
              className="w-[78%] shrink-0 sm:w-[42%] lg:w-[30%]"
            >
              <div className="flex h-full flex-col gap-3 border border-sand bg-cream-soft p-6">
                <div className="flex gap-0.5 text-velvet">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <StarIcon key={n} filled={n <= t.rating} />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-ink-muted">
                  &ldquo;{t.comment}&rdquo;
                </p>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink">
                  {t.customerName}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
