import type { MetadataRoute } from "next";
import { getAllTracks } from "@/lib/content";

/**
 * Sitemap — plan §23 Phase 7.
 * All static + content-driven routes. Auth-protected pages (admin, profile,
 * progress) are excluded. URL root comes from NEXT_PUBLIC_SITE_URL, falling
 * back to localhost for local dev.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/widgets`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/gallery`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${base}/login`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/register`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Content-driven routes — tracks, then each topic under each lesson.
  for (const track of getAllTracks()) {
    entries.push({
      url: `${base}/lessons/${track.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
    for (const lesson of track.lessons) {
      for (const topic of lesson.topics) {
        entries.push({
          url: `${base}/lessons/${track.slug}/${lesson.slug}/${topic.slug}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  }

  return entries;
}
