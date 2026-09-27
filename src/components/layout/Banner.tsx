import { getImageProps } from "next/image";
import type { Hero } from "@/types/hero";

/**
 * La sección de imagen debajo de `BrandMessage` — mismo backend/tabla que
 * el hero principal, discriminada por `section: "BANNER"` (ver "Banner
 * section" en `carmessievelvet-api`'s hero module `CLAUDE.md`). A
 * diferencia del hero, un banner nunca tiene título/contenido/botón —
 * `title`/`content`/`buttonLabel`/`buttonPath` siempre vienen `null`, así
 * que este componente ni los recibe.
 */
export function Banner({ banner }: { banner: Hero }) {
  // Mismo patrón de `<picture>`/`getImageProps` que el hero principal en
  // `page.tsx` — el navegador nunca descarga la imagen que no aplica a su
  // viewport. `imageMobileUrl` puede ser `null` (banner activado antes de
  // que existiera esa variante, o el fallback local de abajo) — cae a
  // `imageUrl` también en mobile en ese caso.
  const imageCommon = { alt: "Carmessie Velvet", fill: true, sizes: "100vw", preload: true } as const;
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...imageCommon, src: banner.imageUrl });
  const {
    props: { srcSet: mobileSrcSet, ...mobileImgProps },
  } = getImageProps({ ...imageCommon, src: banner.imageMobileUrl ?? banner.imageUrl });

  return (
    <section className="relative h-[70svh] min-h-[380px] w-full overflow-hidden bg-ink">
      <picture>
        <source media="(min-width: 640px)" srcSet={desktopSrcSet} />
        <source srcSet={mobileSrcSet} />
        <img {...mobileImgProps} alt="Carmessie Velvet" className="object-cover" />
      </picture>
    </section>
  );
}
