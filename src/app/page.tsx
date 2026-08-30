import Image from "next/image";
import Link from "next/link";
import { productService } from "@/services/product-service";
import { ProductGrid } from "@/components/product/ProductGrid";
import { VelvetDivider } from "@/components/layout/VelvetDivider";
import { buttonClasses } from "@/components/ui/Button";

const categoryPreview: Record<string, string> = {
  corsets: "/products/corset-brocade.jpeg",
  sets: "/products/set-black-fur.jpeg",
};

export default async function HomePage() {
  const [newArrivals, categories] = await Promise.all([
    productService.getNewArrivals(4),
    productService.getCategories(),
  ]);

  return (
    <div>
      <section className="relative h-[88svh] min-h-[520px] w-full overflow-hidden bg-ink">
        <Image
          src="/products/corset-brocade.jpeg"
          alt="Corset Alado Brocado de la colección Carmessie Velvet"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-12 sm:px-10 sm:pb-16">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-cream-soft/80">
            Nueva colección
          </p>
          <h1 className="mt-3 max-w-md text-4xl font-black leading-[1.05] tracking-tight text-cream-soft sm:text-6xl">
            Vestir con la textura de lo memorable.
          </h1>
          <div className="mt-7">
            <Link href="/tienda" className={buttonClasses("outline-light")}>
              Ver colección
            </Link>
          </div>
        </div>
      </section>

      <VelvetDivider label="Tiraje corto · Piezas que no se repiten" />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
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
      </section>

      <section className="bg-cream-soft py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-8 text-2xl font-black uppercase tracking-tight text-ink sm:text-3xl">
            Explora por categoría
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/tienda?categoria=${cat.slug}`}
                className="group relative aspect-[4/3] overflow-hidden bg-sand sm:aspect-[3/4]"
              >
                <Image
                  src={categoryPreview[cat.slug]}
                  alt={cat.name}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-ink/25 transition-colors group-hover:bg-ink/35" />
                <span className="absolute bottom-5 left-5 text-lg font-black uppercase tracking-tight text-cream-soft">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
