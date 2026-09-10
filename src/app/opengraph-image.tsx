import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Carmessie Velvet — corsets y sets de tiraje corto";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Site-wide default OG/Twitter card — any route without its own
// opengraph-image.tsx (i.e. everything except /producto/[slug], which uses
// the product's real photo instead) falls back to this. Built from the
// real logo mark (not a re-typed wordmark) so the brand's actual lettering
// shows up exactly as designed, embedded as a data URI since `ImageResponse`
// needs image bytes, not a relative `/brand/...` path.
export default async function Image() {
  const logo = await readFile(
    join(process.cwd(), "public/brand/carmessie-mark-ink.png")
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f1e9df",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={620} height={107} alt="" />
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#6b5d52",
            fontFamily: "system-ui, -apple-system, Helvetica, Arial, sans-serif",
          }}
        >
          Corsets y sets de tiraje corto
        </div>
        <div
          style={{
            marginTop: 40,
            width: 96,
            height: 6,
            background: "#4b1530",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
