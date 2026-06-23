import type { MetadataRoute } from "next";

import { getAdminEntries } from "@/features/content/lib/content-repository";
import { sectionSlugs } from "@/features/content/lib/sections";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/shared/config/site";

export const dynamic = "force-dynamic";

function getLocalizedPathname(pathname: string, locale: string) {
  if (locale === routing.defaultLocale) {
    return pathname;
  }

  return `/${locale}${pathname === "/" ? "" : pathname}`;
}

function withLocaleAlternates(siteUrl: string, pathname: string) {
  return Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      `${siteUrl}${getLocalizedPathname(pathname, locale)}`,
    ]),
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/journal",
    "/realms",
    "/experiments",
    "/privacy",
    "/terms",
  ].flatMap((pathname) =>
    routing.locales.map((locale) => ({
      url: `${siteUrl}${getLocalizedPathname(pathname, locale)}`,
      lastModified: new Date(),
      alternates: { languages: withLocaleAlternates(siteUrl, pathname) },
    })),
  );

  let entryRoutes: MetadataRoute.Sitemap = [];
  try {
    const entries = await getAdminEntries();
    entryRoutes = entries
      .filter((entry) => entry.status === "PUBLISHED")
      .flatMap((entry) => {
        const section = sectionSlugs.find(
          (value) => value.toUpperCase() === entry.section,
        );
        if (!section) return [];

        const pathname = `/${section}/${entry.slug}`;
        return routing.locales.map((locale) => ({
          url: `${siteUrl}${getLocalizedPathname(pathname, locale)}`,
          lastModified: entry.updatedAt,
          alternates: { languages: withLocaleAlternates(siteUrl, pathname) },
        }));
      });
  } catch {
    // DB not available at build time — sitemap will include only static routes
  }

  return [...staticRoutes, ...entryRoutes];
}