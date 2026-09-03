// "Mar 8 · 3:05 p.m." — weekday + day carries more at a glance than a plain
// dd/mm/yyyy, and the 12-hour clock matches how the rest of the site reads.
export function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  const day = date.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" });
  const time = date.toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${day.charAt(0).toUpperCase()}${day.slice(1)} · ${time}`;
}
