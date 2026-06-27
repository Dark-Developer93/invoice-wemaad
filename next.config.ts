import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
