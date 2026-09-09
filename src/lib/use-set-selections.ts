"use client";

import { useMemo, useState } from "react";
import type { CartSelection } from "@/types/cart";
import type { ProductComponent, Size } from "@/types/product";

export interface ComponentSelection {
  size: Size | null;
  color?: string;
}

/**
 * Shared talla/color picking state for a `category.type: "SET"` product —
 * used by both the PDP (`AddToCartForm`) and the quick-add modal so the two
 * don't drift into separate (and separately buggy) implementations.
 */
export function useSetSelections(components: ProductComponent[]) {
  const sortedComponents = useMemo(
    () => [...components].sort((a, b) => a.position - b.position),
    [components]
  );
  const [selections, setSelections] = useState<Record<string, ComponentSelection>>({});

  const complete = sortedComponents.every((c) => selections[c.id]?.size);

  function setSelection(componentId: string, next: ComponentSelection) {
    setSelections((prev) => ({ ...prev, [componentId]: next }));
  }

  function buildCartSelections(): CartSelection[] {
    return sortedComponents.map((c) => ({
      componentId: c.id,
      componentName: c.name,
      size: selections[c.id]!.size!,
      color: selections[c.id]!.color,
    }));
  }

  return { components: sortedComponents, selections, setSelection, complete, buildCartSelections };
}
