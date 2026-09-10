import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// The real logo (`public/brand/carmessie-logo.svg`) is only a full
// wordmark ("CARMESSIE VELVET") traced as text-shaped paths — there's no
// separate icon-only mark, and a wordmark doesn't read at 16-32px. This is
// a plain monogram instead, generated at build time so no extra asset file
// is needed. Uses a system sans stack (not Archivo, the site's real font)
// on purpose: at this size a "C" in any bold geometric grotesque is
// visually indistinguishable from Archivo Black, and fetching the actual
// font file into `next/og`'s ImageResponse would add a build-time network
// dependency for no visible gain.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4b1530",
          color: "#fffdfb",
          fontSize: 22,
          fontWeight: 900,
          fontFamily: "system-ui, -apple-system, Helvetica, Arial, sans-serif",
        }}
      >
        C
      </div>
    ),
    { ...size }
  );
}
