import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ywsvdgzfmvecaoejtlxo.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "s2.glbimg.com",
      },
      {
        protocol: "https",
        hostname: "*.glbimg.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  // Proxy nativo para imagens bloqueadas por CORS
  async rewrites() {
    return [
      {
        source: "/api/img-proxy",
        destination: "/api/img-proxy",
      },
    ];
  },
};

export default nextConfig;
