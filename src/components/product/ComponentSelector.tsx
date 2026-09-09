"use client";

import type { ProductComponent } from "@/types/product";
import type { ComponentSelection } from "@/lib/use-set-selections";

/** Talla/color picker for one piece of a SET product — one per component. */
export function ComponentSelector({
  component,
  selection,
  onChange,
}: {
  component: ProductComponent;
  selection: ComponentSelection;
  onChange: (next: ComponentSelection) => void;
}) {
  const hasColorChoice = component.colors.length > 1;
  // A piece with no color of its own comes back as `colors: []` and every
  // option's `color: null` (not `undefined`) — comparing against `undefined`
  // there would never match (`null !== undefined`) and silently filter out
  // every size. Skip the color filter entirely when there's nothing to pick.
  const activeColor = component.colors.length > 0 ? (selection.color ?? component.colors[0]) : undefined;
  const sizeOptions =
    component.colors.length > 0
      ? component.options.filter((option) => option.color === activeColor)
      : component.options;

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
        {component.name}
      </p>

      {hasColorChoice && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {component.colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ size: null, color })}
              aria-pressed={activeColor === color}
              className={`h-9 border px-3 text-xs font-medium uppercase tracking-wide transition-colors ${
                activeColor === color
                  ? "border-ink bg-ink text-cream-soft"
                  : "border-sand text-ink hover:border-ink"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2.5 flex flex-wrap gap-2">
        {sizeOptions.map((option) => (
          <button
            key={option.size}
            type="button"
            disabled={!option.available}
            onClick={() => onChange({ size: option.size, color: activeColor })}
            aria-pressed={selection.size === option.size}
            className={`flex h-11 w-11 items-center justify-center border text-xs font-medium uppercase tracking-wide transition-colors ${
              !option.available
                ? "cursor-not-allowed border-sand text-ink-muted/40 line-through"
                : selection.size === option.size
                  ? "border-ink bg-ink text-cream-soft"
                  : "border-sand text-ink hover:border-ink"
            }`}
          >
            {option.size}
          </button>
        ))}
      </div>
    </div>
  );
}
