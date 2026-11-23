import { Reveal } from "@/components/ui/Reveal";
import { formatLeadTime, getLeadTime } from "@/lib/lead-time";

// Static marketing copy from the client (not admin-editable — same
// "hardcoded because nobody asked for a CMS field" reasoning as the rest
// of the homepage's non-catalog sections). Sits directly under the hero,
// same placement as the reference the client shared (a "message from the
// founders" block right below the banner, before the product grid).
//
// The strongest line of the copy is the headline now: it used to be the
// last small gray paragraph, and it is the sentence people remember.
export function BrandMessage() {
  return (
    <section className="bg-paper px-6 pb-14 pt-16 text-center sm:px-10 sm:pb-24 sm:pt-28">
      <Reveal className="mx-auto max-w-[560px] sm:max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          De Carmessie para ti
        </p>
        <h2 className="mx-auto mt-4 max-w-[560px] text-[27px] font-extrabold leading-[1.12] tracking-tight text-ink sm:max-w-3xl sm:text-[46px]">
          No es solo moda. Es feminidad, es confianza,{" "}
          <em className="not-italic text-velvet">es arte.</em>
        </h2>
        <p className="mx-auto mt-6 max-w-[520px] text-[15px] leading-relaxed text-ink-muted sm:max-w-xl sm:text-[16.5px]">
          Somos una marca mexicana que diseña y produce sus propios corsets y
          conjuntos desde cero. Como trabajamos bajo pre-order, nuestro tiempo
          de elaboración es de {formatLeadTime(getLeadTime())}.
        </p>
        <p className="mx-auto mt-3.5 max-w-[520px] text-[15px] leading-relaxed text-ink-muted sm:max-w-xl sm:text-[16.5px]">
          Carmessie ha crecido junto con ustedes y, desde 2020, nuestra
          intención sigue siendo la misma: crear prendas que te hagan sentir
          más bonita y especial cada vez que te las pongas.
        </p>
        <p className="mt-5 text-[15px] font-bold tracking-wide text-ink">
          Bienvenida a nuestro mundo.
        </p>
      </Reveal>
    </section>
  );
}
