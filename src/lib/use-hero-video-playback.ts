import { useSyncExternalStore } from "react";

/** Mismo breakpoint (`sm` de Tailwind) que el `<source media>` de la imagen del hero/banner. */
const DESKTOP_QUERY = "(min-width: 640px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const queries = [DESKTOP_QUERY, REDUCED_MOTION_QUERY].map((query) => window.matchMedia(query));
  queries.forEach((mql) => mql.addEventListener("change", callback));
  return () => queries.forEach((mql) => mql.removeEventListener("change", callback));
}

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

// `navigator.connection` no está en el tipo `Navigator` de TS (solo Chromium lo
// expone) — en un navegador sin él, simplemente no hay señal de ahorro de datos.
function shouldSaveData(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  if (!connection) return false;
  return connection.saveData === true || /(^|-)2g$/.test(connection.effectiveType ?? "");
}

export type HeroVideoPlayback = "desktop" | "mobile" | "none";

function getSnapshot(): HeroVideoPlayback {
  // Movimiento reducido o ahorro de datos: nunca se pide el video, solo se
  // ve la imagen — para eso existe el respaldo.
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches || shouldSaveData()) return "none";
  return window.matchMedia(DESKTOP_QUERY).matches ? "desktop" : "mobile";
}

/**
 * Cuál video del hero/banner toca reproducir en este navegador — `"desktop"`
 * o `"mobile"` según el viewport (se actualiza al rotar/redimensionar), o
 * `"none"` si no debe reproducirse ninguno. En el servidor (y en la primera
 * pasada de hidratación) siempre es `"none"`: la imagen es lo único que viene
 * en el HTML, y el video es una mejora que se suma ya con JS.
 *
 * No se puede resolver con `<source media>` como las imágenes: en un `<video>`
 * los navegadores ignoran `media`, así que hay que elegir el archivo a mano.
 */
export function useHeroVideoPlayback(): HeroVideoPlayback {
  return useSyncExternalStore(subscribe, getSnapshot, () => "none");
}
