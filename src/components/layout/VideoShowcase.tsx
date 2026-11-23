"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/types/product";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowButton } from "@/components/layout/Testimonials";
import { formatCurrency } from "@/lib/format-currency";
import { useDragScroll } from "@/lib/use-drag-scroll";
import { useHeroVideoPlayback } from "@/lib/use-hero-video-playback";

/**
 * Products that have a video (`product.videoUrl`, managed from the admin).
 * Like the reviews, the layout depends on how many there are:
 *
 * - **1**: the video is large, next to the product's name, price and a button
 *   (before, it was one narrow column with a huge empty space beside it).
 * - **2 or more**: a swipeable rail where every tile says which product it is
 *   (name and price) and the one you tap goes to its page.
 *
 * In both cases only the video that is actually on screen plays and loads: the
 * poster (the product's first photo) is always underneath, and nothing is
 * downloaded for people who asked for reduced motion or to save data. Before,
 * every video on the page played at the same time with `preload="auto"`.
 */
export function VideoShowcase({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  if (products.length === 1) return <SingleVideo product={products[0]} />;
  return <VideoRail products={products} />;
}

/**
 * A video that loads and plays only while it is at least `threshold` visible
 * on screen, and pauses when it leaves. `videoSrc` is not set until the first
 * time it is needed.
 */
function useVisiblePlayback(threshold: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activated, setActivated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const allowed = useHeroVideoPlayback() !== "none";

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !allowed) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          setActivated(true);
          video?.play().catch(() => {});
        } else {
          video?.pause();
        }
      },
      { threshold: [0, threshold] }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [allowed, threshold]);

  return { containerRef, videoRef, activated: activated && allowed, playing, setPlaying };
}

function VideoFrame({
  product,
  ratio,
  threshold,
  sizes,
  overlay,
}: {
  product: Product;
  ratio: string;
  threshold: number;
  sizes: string;
  overlay?: React.ReactNode;
}) {
  const { containerRef, videoRef, activated, playing, setPlaying } = useVisiblePlayback(threshold);
  return (
    <div ref={containerRef} className={`relative ${ratio} overflow-hidden bg-sand`}>
      <Image
        src={product.images[0].src}
        alt={product.images[0].alt}
        fill
        sizes={sizes}
        className="object-cover"
      />
      <video
        ref={videoRef}
        src={activated ? (product.videoUrl ?? undefined) : undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        draggable={false}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          playing ? "opacity-100" : "opacity-0"
        }`}
      />
      {overlay}
    </div>
  );
}

function SingleVideo({ product }: { product: Product }) {
  return (
    <section className="bg-cream py-14 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,440px)_minmax(0,480px)] lg:justify-center lg:gap-20">
        <Reveal>
          <Link href={`/producto/${product.slug}`} draggable={false} className="block">
            <VideoFrame
              product={product}
              ratio="aspect-[4/5]"
              threshold={0.4}
              sizes="(min-width: 1024px) 440px, 100vw"
              overlay={
                <span className="absolute left-3 top-3 z-10 flex items-center gap-2 bg-ink/55 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                  <i className="h-1.5 w-1.5 rounded-full bg-[#ff6b6b] motion-safe:animate-[soft-pulse_2s_ease-in-out_infinite]" />
                  En movimiento
                </span>
              }
            />
          </Link>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Míralo en movimiento
          </p>
          <h2 className="mt-3 text-4xl font-black uppercase leading-none tracking-tight text-ink sm:text-5xl lg:text-[58px]">
            {product.name}
          </h2>
          <p className="mt-3 text-ink-muted">{product.category.name}</p>
          <p className="mt-1 text-xl font-extrabold text-ink lg:text-[26px]">
            {formatCurrency(product.price)}
          </p>
          <Link
            href={`/producto/${product.slug}`}
            className="mt-6 inline-flex h-12 items-center gap-2.5 bg-velvet px-7 text-xs font-bold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-wine"
          >
            Ver {product.category.type === "SET" ? "el set" : "la pieza"}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function VideoRail({ products }: { products: Product[] }) {
  const { trackRef, dragHandlers } = useDragScroll<HTMLDivElement>();
  const few = products.length <= 3;

  function scrollBy(direction: 1 | -1) {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: direction * track.clientWidth * 0.7, behavior: "smooth" });
  }

  return (
    <section className="bg-cream py-14 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-6 flex items-end justify-between gap-3 sm:mb-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                Míralo en movimiento
              </p>
              <h2 className="mt-2.5 text-2xl font-black uppercase tracking-tight text-ink sm:text-3xl">
                En video
              </h2>
            </div>
            {!few && (
              <div className="hidden gap-2 sm:flex">
                <ArrowButton direction="prev" onClick={() => scrollBy(-1)} />
                <ArrowButton direction="next" onClick={() => scrollBy(1)} />
              </div>
            )}
          </div>
        </Reveal>

        <div
          ref={trackRef}
          {...dragHandlers}
          className={`-mx-4 flex cursor-grab snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] active:cursor-grabbing sm:mx-0 sm:snap-none sm:gap-5 sm:px-0 [&::-webkit-scrollbar]:hidden ${
            few ? "sm:justify-center" : ""
          }`}
        >
          {products.map((product, i) => (
            <Reveal
              key={product.id}
              delay={i * 0.06}
              // The next tile always peeks in at the edge — that is the hint
              // that there is more, there is no scrollbar.
              className={`w-[62%] shrink-0 snap-start sm:w-[30%] ${
                few ? "lg:w-[28%]" : "lg:w-[23.5%]"
              }`}
            >
              <Link href={`/producto/${product.slug}`} draggable={false} className="block">
                <VideoFrame
                  product={product}
                  ratio="aspect-[9/14]"
                  threshold={0.6}
                  sizes="(min-width: 1024px) 25vw, 62vw"
                  overlay={
                    <>
                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(30,12,18,0.6)] to-transparent to-45%" />
                      <span className="absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-2 text-white">
                        <span className="text-[12.5px] font-bold uppercase leading-tight tracking-[0.07em]">
                          {product.name}
                        </span>
                        <span className="shrink-0 text-[13px] font-extrabold">
                          {formatCurrency(product.price)}
                        </span>
                      </span>
                    </>
                  }
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
