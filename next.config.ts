import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/llms.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.invoice-wemaad.vercel.app" }],
        destination: "https://invoice-wemaad.vercel.app/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
