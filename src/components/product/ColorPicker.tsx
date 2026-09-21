"use client";

/**
 * Color swatches for a SIMPLE product that offers more than one — same
 * pill style as `ComponentSelector`'s own color row (a SET's per-component
 * picker), reused here as a standalone piece since a top-level product has
 * no "prenda" name to hang the rest of that component's layout off of.
 * Renders nothing when there's nothing to pick (0 or 1 color) — callers
 * gate on `product.colors.length > 1` themselves before showing a "Color"
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
  if (colors.length < 2) return null;

  return (
    <div className="mt-2.5 flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          aria-pressed={value === color}
          className={`h-9 border px-3 text-xs font-medium uppercase tracking-wide transition-colors ${
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
