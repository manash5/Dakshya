import type { NextConfig } from "next";

const backendURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8088";
const IsDEV = backendURL.startsWith("http://localhost");

const nextConfig: NextConfig = {

  /* config options here */
  images: {
    dangerouslyAllowLocalIP: IsDEV,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8088',
        pathname: '/uploads/**',
      },
      // Derived from the actual deployed backend URL (not hardcoded) so this
      // keeps working automatically if the backend ever moves to a custom
      // domain -- next/image's optimizer 400s on any host not listed here.
      new URL(`${backendURL}/uploads/**`),
      {
        protocol: "https",
        hostname: "images.unsplash.com" // domain
      },
      // {..}
    ]
  }
};

export default nextConfig;