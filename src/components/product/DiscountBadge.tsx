// Two separate stacked cards (not one box with two lines) — "Off" on its
// own card, the percentage on another right below it. Same typographic
// weight/tracking as the "Nuevo"/"Agotado" labels it sits alongside
// (font-semibold, not bold).
export function DiscountBadge({ percent, className = "" }: { percent: number; className?: string }) {
  return (
    <span className={`inline-flex flex-col gap-1 ${className}`}>
      <span className="bg-velvet px-2.5 py-1 text-center text-[9px] font-semibold uppercase tracking-[0.14em] text-cream-soft">
        Off
      </span>
      <span className="bg-velvet px-2.5 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-cream-soft">
        -{percent}%
      </span>
    </span>
  );
}
