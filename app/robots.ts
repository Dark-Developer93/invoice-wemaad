import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/urls";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/privacy", "/terms"],
        disallow: ["/dashboard/", "/admin/", "/api/", "/onboarding", "/verify"],
      },
    ],
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
