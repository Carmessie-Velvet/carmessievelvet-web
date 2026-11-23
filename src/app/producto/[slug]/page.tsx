import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { productService } from "@/services/product-service";
import { formatCurrency } from "@/lib/format-currency";
import { discountPercent } from "@/lib/discount";
import { SITE_URL } from "@/lib/site-url";
import { AddToCartForm } from "@/components/product/AddToCartForm";
import { WishlistButton } from "@/components/product/WishlistButton";
import { DiscountBadge } from "@/components/product/DiscountBadge";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductCard } from "@/components/product/ProductCard";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
import { LeadTimeText } from "@/components/layout/LeadTimeText";
import { isSoldOut } from "@/lib/product-stock";

// Catalog data (price, stock) is live in the real API — render on demand
// with a short cache instead of pre-generating every product at build time.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await productService.getBySlug(slug);
  if (!product) return {};

  const image = product.images[0]?.src;
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.description,
      url: `/producto/${product.slug}`,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: image ? [image] : undefined,
    },
  };
}

// Product schema — price/availability/image straight from the same
// `product` the page already fetched, so this can never disagree with
// what's rendered. `availability` reads `variants` (or, for a SET, whether
// any component has an available option) the same way the storefront
// itself decides "in stock", not a separate guess.
function ProductJsonLd({ product }: { product: NonNullable<Awaited<ReturnType<typeof productService.getBySlug>>> }) {
  const inStock =
    product.madeToOrder ||
    product.variants.some((v) => v.inStock) ||
    product.components.some((c) => c.inStock);

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    image: product.images.map((img) => img.src),
    brand: { "@type": "Brand", name: "Carmessie Velvet" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/producto/${product.slug}`,
      priceCurrency: product.currency,
      price: product.price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await productService.getBySlug(slug);
  if (!product) notFound();
  const discount = discountPercent(product);

  // "Completa tu look": other pieces that can still be bought, the other
  // category first (a corset suggests a set and vice versa). Best-effort — a
  // failure here must never take the product page down.
  const others = await productService
    .getPage({ limit: 12 })
    .then((page) => page.items)
    .catch(() => []);
  const look = others
    .filter((other) => other.id !== product.id && !isSoldOut(other))
    .sort(
      (a, b) =>
        Number(a.category.slug === product.category.slug) -
        Number(b.category.slug === product.category.slug)
    )
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-0 sm:px-6 sm:py-12">
      <ProductJsonLd product={product} />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery product={product} />

        <div className="lg:sticky lg:top-[calc(var(--sticky-top)+2rem)] lg:self-start">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
            {product.category.name}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">
            {product.name}
          </h1>
          {discount && <DiscountBadge percent={discount} className="mt-3" />}
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.1em] text-ink-muted">
            {product.compareAtPrice && (
              <span className="mr-2 line-through opacity-60">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
            <span className={discount ? "text-base font-bold normal-case tracking-normal text-velvet" : ""}>
              {formatCurrency(product.price)}
            </span>
          </p>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-muted">
            {product.description}
          </p>

          <WishlistButton product={product} />

          <div className="mt-8 border-t border-sand pt-8">
            <AddToCartForm product={product} />
          </div>

          <div className="mt-8">
            <Accordion
              defaultOpenIndex={0}
              items={[
                {
                  question: "Envíos",
                  answer: (
                    <p>
                      Enviamos a todo México. Tu pieza se elabora después de tu compra (tiempo de
                      elaboración: <LeadTimeText />) y el tiempo de envío empieza a contar hasta que
                      está lista.
                    </p>
                  ),
                },
                {
                  question: "Cambios y devoluciones",
                  answer: (
                    <p>
                      Tienes 15 días naturales a partir de que recibes tu pedido para solicitar un
                      cambio o reembolso. La prenda no debe haber sido usada y se regresa en su
                      empaque original; el envío de la devolución corre por tu cuenta.{" "}
                      <Link
                        href="/devoluciones"
                        className="text-ink underline underline-offset-2 hover:text-velvet"
                      >
                        Ver política de devoluciones
                      </Link>
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {look.length > 0 && (
        <section className="mt-16 border-t border-sand pt-12 sm:mt-24 sm:pt-16">
          <Reveal>
            <div className="mb-6 flex items-end justify-between gap-3 sm:mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tight text-ink sm:text-3xl">
                Completa tu look
              </h2>
              <Link
                href="/tienda"
                className="flex min-h-11 shrink-0 items-center whitespace-nowrap text-xs font-medium uppercase tracking-[0.16em] text-ink-muted hover:text-velvet"
              >
                Ver todo →
              </Link>
            </div>
          </Reveal>
          <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-6 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
            {look.map((other) => (
              <div key={other.id} className="w-[62%] shrink-0 snap-start sm:w-auto">
                <ProductCard product={other} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
