import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // For Static Export

  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
    // Additional Sass options can go here
  },
};

export default nextConfig;
