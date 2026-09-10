import Image from "next/image";
import Link from "next/link";
import { productService } from "@/services/product-service";
import { heroService } from "@/services/hero-service";
import { ProductGrid } from "@/components/product/ProductGrid";
import { VideoShowcase } from "@/components/layout/VideoShowcase";
import { buttonClasses } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { Hero } from "@/types/hero";

const categoryPreview: Record<string, string> = {
  corsets: "/products/corset-brocade.jpeg",
  sets: "/products/set-black-fur.jpeg",
};

// Shown only if the admin hasn't activated a hero yet (GET /store/hero
// returns `[]` in that case) — the site's original look, so the homepage
// never goes blank up top while the admin panel is still being set up.
const FALLBACK_HERO: Hero = {
  id: "fallback",
  title: "Nueva colección",
  content: "Vestir con la textura de lo memorable.",
  buttonLabel: "Ver colección",
  buttonPath: "/tienda",
  imageUrl: "/products/corset-brocade.jpeg",
  imageWidth: 1920,
  imageHeight: 1080,
  sortOrder: 0,
};

// Catalog data (new arrivals, categories) is live in the real API.
export const revalidate = 60;

export default async function HomePage() {
  const [newArrivals, categories, allProducts, heroes] = await Promise.all([
    productService.getNewArrivals(4),
    productService.getCategories(),
    productService.getAll(),
    heroService.getActive(),
  ]);
  const videoProducts = allProducts.filter((product) => product.videoUrl);
  // `GET /store/hero` is a catalog (several active heroes = a carousel per
  // the API's own docs) but there's no carousel UI here yet — only the
  // first one renders. Not a bug: today the admin only ever activates one.
  const hero = heroes[0] ?? FALLBACK_HERO;

  return (
    <div>
      <section className="relative -mt-[var(--header-stack-height)] h-[88svh] min-h-[520px] w-full overflow-hidden bg-ink">
        <Image
          src={hero.imageUrl}
          alt={hero.title ?? hero.content ?? "Carmessie Velvet"}
          fill
          priority
          sizes="100vw"
          // El hero es una sola imagen recortada por el admin en ~16:9 —
          // en desktop, el contenedor (`h-[88svh]`) queda cerca de esa
          // misma proporción, así que "center" ya encuadra bien. En un
          // viewport angosto y muy alto (mobile), `object-cover` en
          // "center" recorta casi todo el ancho y se queda solo con una
          // franja vertical del centro de la foto — en un flat-lay de
          // producto, la prenda casi nunca cae justo ahí. Este sesgo
          // (un poco a la izquierda, un poco arriba del centro) es un
          // punto de partida razonable para este tipo de foto, no una
          // solución exacta por imagen — si el admin sube una portada muy
          // distinta y se sigue viendo mal en mobile, la solución real es
          // un recorte específico para mobile (requiere backend, ver
          // CLAUDE.md).
          className="object-cover object-[38%_35%] opacity-90 sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-ink/70 via-ink/25 to-transparent" />
        <Reveal
          immediate
          delay={0.15}
          className="absolute inset-x-0 bottom-0 px-6 pb-12 sm:px-10 sm:pb-16"
        >
          {hero.title && (
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-cream-soft/80">
              {hero.title}
            </p>
          )}
          {hero.content && (
            <h1 className="mt-3 max-w-md text-4xl font-black leading-[1.05] tracking-tight text-cream-soft sm:text-6xl">
              {hero.content}
            </h1>
          )}
          {hero.buttonLabel && hero.buttonPath && (
            <div className="mt-7">
              <Link href={hero.buttonPath} className={buttonClasses("outline-light")}>
                {hero.buttonLabel}
              </Link>
            </div>
          )}
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tight text-ink sm:text-3xl">
              Recién llegado
            </h2>
            <Link
              href="/tienda"
              className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted hover:text-velvet"
            >
              Ver todo
            </Link>
          </div>
          <ProductGrid products={newArrivals} />
        </Reveal>
      </section>

      <section className="bg-cream py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <h2 className="mb-8 text-2xl font-black uppercase tracking-tight text-ink sm:text-3xl">
              Explora por categoría
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {categories.map((cat, i) => (
              <Reveal key={cat.slug} delay={i * 0.12}>
                <Link
                  href={`/tienda?categoria=${cat.slug}`}
                  className="group relative block aspect-[4/3] overflow-hidden bg-sand sm:aspect-[3/4]"
                >
                  <Image
                    src={categoryPreview[cat.slug]}
                    alt={cat.name}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-ink/10 to-transparent transition-colors group-hover:from-ink/60" />
                  <span className="absolute bottom-5 left-5 text-lg font-black uppercase tracking-tight text-cream-soft">
                    {cat.name}
                  </span>
                  <span className="absolute bottom-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-cream-soft/50 text-cream-soft opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-2">
                    <ArrowIcon />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <VideoShowcase products={videoProducts} />
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M6 18 18 6M9 6h9v9" />
    </svg>
  );
}
