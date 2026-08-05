import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/urls";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login"],
        disallow: ["/dashboard/", "/admin/", "/api/", "/onboarding", "/verify"],
      },
    ],
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
