// Shown while a product page loads: the photo at its real 4:5 size (edge to
// edge on a phone, like the gallery) and the title, price and size grid as
// grey blocks.
const PULSE = "animate-pulse bg-sand/70 motion-reduce:animate-none";

export default function Loading() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 pb-8 pt-0 sm:px-6 sm:py-12"
      aria-busy="true"
      aria-label="Cargando la pieza"
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className={`-mx-4 aspect-[4/5] sm:mx-0 ${PULSE}`} />

        <div>
          <div className={`h-3 w-24 ${PULSE}`} />
          <div className={`mt-4 h-9 w-3/4 ${PULSE}`} />
          <div className={`mt-4 h-4 w-20 ${PULSE}`} />
          <div className={`mt-7 h-3 w-12 ${PULSE}`} />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`h-12 ${PULSE}`} />
            ))}
          </div>
          <div className={`mt-6 h-[52px] w-full ${PULSE}`} />
        </div>
      </div>
    </div>
  );
}
