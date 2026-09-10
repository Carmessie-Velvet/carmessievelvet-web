import Link from "next/link";

// Plain <Link>-based (no "use client") so pagination works without JS and
// crawlers can follow it — everything it needs (current filters, current
// page) is already known server-side by the time /tienda renders.
function buildHref(
  currentParams: Record<string, string | undefined>,
  page: number
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(currentParams)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("pagina", String(page));
  const qs = params.toString();
  return qs ? `/tienda?${qs}` : "/tienda";
}

// Always show the first and last page, the current page and its immediate
// neighbors, collapsing everything else into a single "…" so the strip
// stays a fixed, scannable width regardless of how many pages exist.
function buildPageList(currentPage: number, totalPages: number): (number | "…")[] {
  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…");
    result.push(sorted[i]);
  }
  return result;
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav aria-label="Paginación" className="mt-14 flex items-center justify-center gap-1.5">
      <ArrowLink
        href={hasPrev ? buildHref(searchParams, currentPage - 1) : undefined}
        ariaLabel="Página anterior"
      >
        <ChevronIcon direction="left" />
      </ArrowLink>

      {buildPageList(currentPage, totalPages).map((page, i) =>
        page === "…" ? (
          <span key={`gap-${i}`} className="px-1.5 text-xs text-ink-muted">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(searchParams, page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`flex h-9 w-9 items-center justify-center text-xs font-medium transition-colors duration-200 ${
              page === currentPage
                ? "bg-ink text-cream-soft"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {page}
          </Link>
        )
      )}

      <ArrowLink
        href={hasNext ? buildHref(searchParams, currentPage + 1) : undefined}
        ariaLabel="Página siguiente"
      >
        <ChevronIcon direction="right" />
      </ArrowLink>
    </nav>
  );
}

function ArrowLink({
  href,
  ariaLabel,
  children,
}: {
  href: string | undefined;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const className = "flex h-9 w-9 items-center justify-center text-ink-muted transition-colors duration-200";
  if (!href) {
    return (
      <span aria-disabled="true" className={`${className} opacity-30`}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={ariaLabel} className={`${className} hover:text-ink`}>
      {children}
    </Link>
  );
}
