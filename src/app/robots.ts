import type { MetadataRoute } from "next";

/**
 * robots.txt — plan §23 Phase 7.
 * Disallows admin, API, and post-auth flows. Points to the dynamic sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/onboarding", "/profile/", "/progress/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
