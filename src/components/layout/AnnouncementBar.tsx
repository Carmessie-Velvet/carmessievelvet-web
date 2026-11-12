import { getLeadTime } from "@/lib/lead-time";

export function AnnouncementBar() {
  const { weeks, campaign } = getLeadTime();
  return (
    <div className="flex h-9 items-center justify-center bg-ink px-4 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-cream-soft">
      {`${campaign ?? "Envíos a todo México"} · Tiempo de elaboración: ${weeks}`}
    </div>
  );
}
