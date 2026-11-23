import { useSyncExternalStore } from "react";

/**
 * Live `matchMedia` match. Always `false` on the server and on the first
 * client render, so it never causes a hydration mismatch — only use it for
 * things that mount after the page is interactive (overlays, sheets).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** Tailwind's `lg` breakpoint — where the site switches to its desktop layout. */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
