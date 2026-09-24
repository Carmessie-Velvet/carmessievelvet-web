import { Reveal } from "@/components/ui/Reveal";

// Static marketing copy from the client (not admin-editable — same
// "hardcoded because nobody asked for a CMS field" reasoning as the rest
// of the homepage's non-catalog sections). Sits directly under the hero,
// same placement as the reference the client shared (a "message from the
// founders" block right below the banner, before the product grid).
export function BrandMessage() {
  return (
    <section className="bg-paper py-10 sm:py-12">
      <Reveal className="mx-auto max-w-xl px-6 text-center sm:px-10">
        <h2 className="text-base font-black tracking-tight text-ink sm:text-lg">
          De Carmessie para ti ♡
        </h2>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted sm:text-sm">
          Somos una marca mexicana que diseña y produce sus propios corsets y
          conjuntos desde cero. Como trabajamos bajo pre-order, nuestro tiempo
          de elaboración es de 3 a 4 semanas.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted sm:text-sm">
          Carmessie ha crecido junto con ustedes y, desde 2020, nuestra
          intención sigue siendo la misma: crear prendas que te hagan sentir
          más bonita y especial cada vez que te las pongas.
        </p>
        <p className="mt-3 text-xs font-semibold text-ink sm:text-sm">
          No es solo moda. Es feminidad, es confianza, es arte.
        </p>
        <p className="mt-2 text-xs text-ink-muted sm:text-sm">
          Bienvenida a nuestro mundo. ♡
        </p>
      </Reveal>
    </section>
  );
}
