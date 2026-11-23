import { useSyncExternalStore } from "react";

// How many product columns a phone shows on the shop page: 2 (the default) or
// 1 — a single column where each photo is almost twice as large. The choice is
// remembered across visits and shared between the toggle (in the filter bar)
// and the grid, which live in different parts of the page.
const STORAGE_KEY = "carmessie-grid-columns";

export type GridColumns = 1 | 2;

const listeners = new Set<() => void>();

function read(): GridColumns {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1" ? 1 : 2;
  } catch {
    return 2;
  }
}

export function setGridColumns(columns: GridColumns) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(columns));
  } catch {
    // Private mode / blocked storage: the choice just won't survive a reload.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Always `2` on the server and on the first client render (no hydration mismatch). */
export function useGridColumns(): GridColumns {
  return useSyncExternalStore(subscribe, read, () => 2);
}
