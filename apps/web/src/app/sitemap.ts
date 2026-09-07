import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { absoluteUrl } from "@/lib/seo";

/**
 * Last date the site's content or structure materially changed. Bump this on a
 * real content update — a fabricated `new Date()` on every build teaches
 * crawlers to distrust our `lastmod`.
 */
const SITE_UPDATED = new Date("2026-09-07");

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/studio", "/projects", "/materials", "/about", "/contact"].map((path) => ({
    url: absoluteUrl(path),
    lastModified: SITE_UPDATED,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
  const projectRoutes = projects.map((p) => ({
    url: absoluteUrl(`/projects/${p.slug}`),
    // projects don't change after completion — anchor to the project year
    lastModified: new Date(p.year, 11, 31),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));
  return [...routes, ...projectRoutes];
}
