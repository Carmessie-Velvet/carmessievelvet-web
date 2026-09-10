import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Carmessie Velvet",
    short_name: "Carmessie Velvet",
    description:
      "Corsets y sets de tiraje corto para vestir con actitud.",
    start_url: "/",
    display: "standalone",
    background_color: "#f1e9df",
    theme_color: "#4b1530",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
