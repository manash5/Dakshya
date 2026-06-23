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
      {
        protocol: "https",
        hostname: "images.unsplash.com" // domain
      },
      // {..}
    ]
  }
};

export default nextConfig;