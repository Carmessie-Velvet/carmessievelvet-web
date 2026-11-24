// Shown while /tienda fetches the catalog: the same title, tabs and two-column
// grid of 4:5 photos, as grey blocks, so the page doesn't jump when the real
// products arrive.
const PULSE = "animate-pulse bg-sand/70 motion-reduce:animate-none";

export default function Loading() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14"
      aria-busy="true"
      aria-label="Cargando la colección"
    >
      <div className={`h-9 w-64 max-w-full sm:h-10 ${PULSE}`} />

      <div className="mt-7 flex gap-7">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-4 w-14 ${PULSE}`} />
        ))}
      </div>
      <div className={`mt-5 h-11 w-44 rounded-full ${PULSE}`} />

      <div className="-mx-2.5 mt-6 grid grid-cols-2 gap-x-1.5 gap-y-8 sm:mx-0 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <div className={`aspect-[4/5] ${PULSE}`} />
            <div className="flex justify-between gap-3 px-0.5 pt-3">
              <div className={`h-3.5 w-2/3 ${PULSE}`} />
              <div className={`h-3.5 w-1/5 ${PULSE}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
