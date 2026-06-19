import type { MetadataRoute } from "next";

import { getAdminEntries } from "@/features/content/lib/content-repository";
import { sectionSlugs } from "@/features/content/lib/sections";
import { getSiteUrl } from "@/shared/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const entries = await getAdminEntries();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/journal",
    "/realms",
    "/experiments",
    "/privacy",
    "/terms",
  ].map((pathname) => ({
    url: `${siteUrl}${pathname}`,
    lastModified: new Date(),
  }));

  const entryRoutes: MetadataRoute.Sitemap = entries
    .filter((entry) => entry.status === "PUBLISHED")
    .map((entry) => {
      const section = sectionSlugs.find(
        (value) => value.toUpperCase() === entry.section,
      );

      if (!section) {
        return null;
      }

      return {
        url: `${siteUrl}/${section}/${entry.slug}`,
        lastModified: entry.updatedAt,
      };
    })
    .filter((item): item is { url: string; lastModified: Date } =>
      Boolean(item),
    );

  return [...staticRoutes, ...entryRoutes];
}

