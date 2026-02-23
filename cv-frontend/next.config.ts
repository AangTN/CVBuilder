import type { NextConfig } from "next";

const apiHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_API_URL
      ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname
      : "localhost";
  } catch {
    return "localhost";
  }
})();

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
    remotePatterns: [
      // Google profile pictures (OAuth login)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      // Backend uploads (production – HTTPS)
      {
        protocol: "https",
        hostname: apiHost,
      },
      // Backend uploads (local development – HTTP)
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
      },
    ],
  },
};

export default nextConfig;
