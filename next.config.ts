import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Product photos uploaded via the admin — carmessie-images-dev.s3.us-east-1.amazonaws.com
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        // Placeholder the API returns for a product with no images uploaded yet.
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },
};

export default nextConfig;
