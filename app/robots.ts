import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login"],
        disallow: ["/dashboard/", "/admin/", "/api/", "/onboarding", "/verify"],
      },
    ],
    sitemap: "https://invoice-wemaad.vercel.app/sitemap.xml",
  };
}
