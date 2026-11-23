"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Testimonial } from "@/types/testimonial";
import { Reveal } from "@/components/ui/Reveal";
import { useDragScroll } from "@/lib/use-drag-scroll";

const EASE = [0.22, 0.8, 0.22, 1] as const;
// How long a review stays before the next one slides in (4+ reviews).
const AUTOPLAY_MS = 7000;

function StarIcon({ filled, className }: { filled: boolean; className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.4}
      className={className}
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

const starsContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const starItem = {
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: EASE } },
};

/**
 * Five stars that fill in one after another when they scroll into view. The
 * trigger is the row as a whole (not each star): a star near the edge of a
 * horizontally scrolling card would otherwise never count as "in view".
 */
function Stars({ rating, size = "h-4 w-4", centered = false }: { rating: number; size?: string; centered?: boolean }) {
  return (
    <motion.div
      className={`flex gap-1 text-velvet ${centered ? "justify-center" : ""}`}
      role="img"
      aria-label={`${rating} de 5 estrellas`}
      variants={starsContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.span key={n} variants={starItem} className="flex">
          <StarIcon filled={n <= rating} className={size} />
        </motion.span>
      ))}
    </motion.div>
  );
}

/**
 * Customer reviews. The layout depends on how many there are, so a single
 * review never sits in a small, mostly empty card and twenty never become a
 * rail nobody scrolls to the end of:
 *
 * - **1**: one large, centered quote.
 * - **2 to 3**: cards (a swipeable row on a phone, side by side on desktop).
 * - **4 or more**: one at a time, large, with arrows, a counter and a slow
 *   automatic advance that pauses while the shopper is interacting.
 */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  if (testimonials.length === 1) return <SingleReview review={testimonials[0]} />;
  if (testimonials.length <= 3) return <ReviewCards reviews={testimonials} />;
  return <ReviewCarousel reviews={testimonials} />;
}

function SingleReview({ review }: { review: Testimonial }) {
  return (
    <section className="bg-paper px-6 py-16 text-center sm:px-10 sm:py-28">
      <Reveal className="mx-auto max-w-[640px] sm:max-w-3xl">
        <Stars rating={review.rating} size="h-5 w-5" centered />
        <blockquote className="mt-5 text-2xl font-extrabold leading-[1.18] tracking-tight text-ink sm:text-[40px]">
          <span className="mb-2 block text-6xl leading-[0.6] text-velvet-light" aria-hidden="true">
            &ldquo;
          </span>
          {review.comment}
        </blockquote>
        <p className="mt-5 text-[11.5px] font-bold uppercase tracking-[0.2em] text-ink-muted">
          {review.customerName}
        </p>
      </Reveal>
    </section>
  );
}

function ReviewCards({ reviews }: { reviews: Testimonial[] }) {
  const { trackRef, dragHandlers } = useDragScroll<HTMLDivElement>();
  return (
    <section className="bg-paper py-14 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <h2 className="mb-7 text-center text-2xl font-black uppercase tracking-tight text-ink sm:mb-10 sm:text-3xl">
            Lo que dicen de nosotras
          </h2>
        </Reveal>
        <div
          ref={trackRef}
          {...dragHandlers}
          className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:snap-none sm:justify-center sm:gap-5 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {reviews.map((review, i) => (
            <Reveal
              key={review.id}
              delay={i * 0.08}
              className="w-[82%] shrink-0 snap-center sm:w-auto sm:max-w-sm sm:flex-1"
            >
              <figure className="flex h-full flex-col gap-3 border border-sand bg-cream-soft p-[22px] sm:p-7">
                <Stars rating={review.rating} size="h-[15px] w-[15px]" />
                <blockquote className="flex-1 text-[14.5px] leading-relaxed text-ink-muted">
                  &ldquo;{review.comment}&rdquo;
                </blockquote>
                <figcaption className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink">
                  {review.customerName}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCarousel({ reviews }: { reviews: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = reviews.length;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, count, index]);

  function go(next: number) {
    setIndex((next + count) % count);
  }

  return (
    <section
      className="bg-paper py-14 sm:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carrusel"
      aria-label="Lo que dicen de nosotras"
    >
      <div className="mx-auto max-w-4xl px-6 text-center sm:px-10">
        <Reveal>
          <h2 className="mb-8 text-2xl font-black uppercase tracking-tight text-ink sm:mb-12 sm:text-3xl">
            Lo que dicen de nosotras
          </h2>
        </Reveal>

        {/* Every review sits in the same grid cell so the section is always as
            tall as the longest one — the page never jumps when it changes. */}
        <div className="grid" aria-live={paused ? "polite" : "off"}>
          {reviews.map((review, i) => (
            <figure
              key={review.id}
              aria-hidden={i !== index}
              inert={i !== index}
              className={`col-start-1 row-start-1 flex flex-col items-center transition-all duration-700 ease-[var(--ease-soft)] ${
                i === index
                  ? "translate-x-0 opacity-100"
                  : i < index || (index === 0 && i === count - 1)
                    ? "-translate-x-6 opacity-0"
                    : "translate-x-6 opacity-0"
              }`}
            >
              <div className="flex gap-1 text-velvet" role="img" aria-label={`${review.rating} de 5 estrellas`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarIcon key={n} filled={n <= review.rating} className="h-[15px] w-[15px]" />
                ))}
              </div>
              <blockquote className="mt-5 text-[22px] font-extrabold leading-[1.2] tracking-tight text-ink sm:text-4xl">
                <span className="mb-2 block text-[54px] leading-[0.6] text-velvet-light" aria-hidden="true">
                  &ldquo;
                </span>
                {review.comment}
              </blockquote>
              <figcaption className="mt-4 text-[11.5px] font-bold uppercase tracking-[0.2em] text-ink-muted">
                {review.customerName}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-5">
          <ArrowButton direction="prev" onClick={() => go(index - 1)} />
          <span className="min-w-[56px] text-xs font-semibold tabular-nums tracking-[0.14em] text-ink-muted">
            {index + 1} / {count}
          </span>
          <ArrowButton direction="next" onClick={() => go(index + 1)} />
        </div>
      </div>
    </section>
  );
}

export function ArrowButton({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Anterior" : "Siguiente"}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-sand bg-white text-ink transition-all duration-300 hover:border-velvet hover:bg-velvet hover:text-paper active:scale-90"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className={`h-[18px] w-[18px] ${direction === "prev" ? "-scale-x-100" : ""}`}
        aria-hidden="true"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}
