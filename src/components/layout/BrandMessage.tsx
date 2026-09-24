import { Reveal } from "@/components/ui/Reveal";

// Static marketing copy from the client (not admin-editable — same
// "hardcoded because nobody asked for a CMS field" reasoning as the rest
// of the homepage's non-catalog sections). Sits directly under the hero,
// same placement as the reference the client shared (a "message from the
// founders" block right below the banner, before the product grid).
export function BrandMessage() {
  return (
    <section className="bg-paper py-16 sm:py-20">
      <Reveal className="mx-auto max-w-2xl px-6 text-center sm:px-10">
        <h2 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
          De Carmessie para ti ♡
        </h2>
        <p className="mt-6 text-sm leading-relaxed text-ink-muted sm:text-base">
          Somos una marca mexicana que diseña y produce sus propios corsets y
          conjuntos desde cero. Como trabajamos bajo pre-order, nuestro tiempo
          de elaboración es de 3 a 4 semanas.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">
          Carmessie ha crecido junto con ustedes y, desde 2020, nuestra
          intención sigue siendo la misma: crear prendas que te hagan sentir
          más bonita y especial cada vez que te las pongas.
        </p>
        <p className="mt-6 text-sm font-semibold text-ink sm:text-base">
          No es solo moda. Es feminidad, es confianza, es arte.
        </p>
        <p className="mt-4 text-sm text-ink-muted sm:text-base">
          Bienvenida a nuestro mundo. ♡
        </p>
      </Reveal>
    </section>
  );
}
