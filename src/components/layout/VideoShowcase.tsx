import { Reveal } from "@/components/ui/Reveal";

const VIDEOS = [
  { src: "/videos/showcase-1.mp4", poster: "/videos/showcase-1-poster.jpg" },
  { src: "/videos/showcase-2.mp4", poster: "/videos/showcase-2-poster.jpg" },
  { src: "/videos/showcase-3.mp4", poster: "/videos/showcase-3-poster.jpg" },
];

// Only 3 source clips exist today — the 1st is repeated at the end (not
// adjacent to itself) to fill a clean 4-up row. Swap in a real 4th clip and
// drop the repeat once one's available.
const DISPLAY_VIDEOS = [...VIDEOS, VIDEOS[0]];

// Static, non-interactive looping clips — no fullscreen viewer, no per-video
// product links. Each file is a muted, audio-stripped, ~480px-wide re-encode
// (under 250KB) specifically so autoplaying four of them at once stays cheap
// on bandwidth; see CLAUDE.md before swapping in larger sources.
export function VideoShowcase() {
  return (
    <section className="bg-cream py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {DISPLAY_VIDEOS.map((video, i) => (
            <Reveal key={`${video.src}-${i}`} delay={i * 0.08}>
              <div className="relative aspect-[9/16] overflow-hidden bg-sand">
                <video
                  src={video.src}
                  poster={video.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
