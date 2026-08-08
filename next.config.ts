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
    // NOTE: hardcoded to the current *.vercel.app domain. If a custom domain
    // is added later, update this rule to that domain's www/apex pair —
    // it can't be derived from an env var here since next.config.ts runs at
    // build time, before request-time env vars like the deployment's real
    // production host are meaningful for this purpose.
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
