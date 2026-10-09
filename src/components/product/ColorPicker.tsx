"use client";

/**
 * Color swatches for a SIMPLE product — same pill style as
 * `ComponentSelector`'s own color row (a SET's per-component picker),
 * reused here as a standalone piece since a top-level product has no
 * "prenda" name to hang the rest of that component's layout off of.
 * A product with a single color still shows it, already selected and not
 * clickable, so the buyer knows which color the piece is (reported from
 * production). Renders nothing only when there's no color at all — callers
 * gate on `product.colors.length > 0` themselves before showing a "Color"
 * label above this, so an empty render here would otherwise leave a
 * dangling label with no swatches under it.
 */
export function ColorPicker({
  colors,
  value,
  onChange,
}: {
  colors: string[];
  value: string | null;
  onChange: (color: string) => void;
}) {
  if (colors.length === 0) return null;
  // Nothing to choose between — keep the pill visible but inert, so tapping
  // it can't reset the size the buyer already picked.
  const onlyOne = colors.length === 1;

  return (
    <div className="mt-2.5 flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          disabled={onlyOne}
          onClick={() => onChange(color)}
          aria-pressed={value === color}
          className={`h-9 border px-3 text-xs font-medium uppercase tracking-wide transition-colors disabled:cursor-default ${
            value === color
              ? "border-ink bg-ink text-cream-soft"
              : "border-sand text-ink hover:border-ink"
          }`}
        >
          {color}
        </button>
      ))}
    </div>
  );
}
