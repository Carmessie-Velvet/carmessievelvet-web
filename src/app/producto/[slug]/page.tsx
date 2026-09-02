import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { productService } from "@/services/product-service";
import { formatCurrency } from "@/lib/format-currency";
import { AddToCartForm } from "@/components/product/AddToCartForm";
import { WishlistButton } from "@/components/product/WishlistButton";

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
  return { title: `${product.name} — Carmessie Velvet` };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await productService.getBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {product.images.map((image) => (
            <div
              key={image.src}
              className="relative aspect-[4/5] overflow-hidden bg-sand first:col-span-2 lg:first:col-span-1"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
            {product.category.name}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.1em] text-ink-muted">
            {product.compareAtPrice && (
              <span className="mr-2 line-through opacity-60">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
            {formatCurrency(product.price)}
          </p>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-muted">
            {product.description}
          </p>

          <WishlistButton product={product} />

          <div className="mt-8 border-t border-sand pt-8">
            <AddToCartForm product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
