import type { Metadata } from "next";

import type { ContentEntry, SectionSlug } from "@/features/content/lib/sections";
import { getSectionConfig } from "@/features/content/lib/sections";
import { routing } from "@/i18n/routing";
import { siteConfig, getSiteUrl } from "@/shared/config/site";

export function createCanonicalUrl(pathname: string) {
  return new URL(pathname, getSiteUrl()).toString();
}

function getLocalizedPathname(pathname: string, locale: string) {
  if (locale === routing.defaultLocale) {
    return pathname;
  }

  return `/${locale}${pathname === "/" ? "" : pathname}`;
}

export function createPageMetadata({
  title,
  description,
  pathname,
  image,
}: {
  title: string;
  description: string;
  pathname: string;
  image?: string;
}): Metadata {
  const canonical = createCanonicalUrl(pathname);
  const imageUrl = new URL(image ?? siteConfig.ogImage, getSiteUrl()).toString();
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      createCanonicalUrl(getLocalizedPathname(pathname, locale)),
    ]),
  );

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": createCanonicalUrl(pathname),
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: imageUrl,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function createSectionMetadata(section: SectionSlug): Metadata {
  const config = getSectionConfig(section);

  return createPageMetadata({
    title: config.title,
    description: `${config.headline}. ${config.description}`,
    pathname: `/${section}`,
  });
}

export function createEntryMetadata(section: SectionSlug, entry: ContentEntry): Metadata {
  const sectionConfig = getSectionConfig(section);
  const pathname = `/${section}/${entry.slug}`;

  return {
    ...createPageMetadata({
      title: entry.title,
      description: entry.excerpt,
      pathname,
      image: entry.coverImage,
    }),
    openGraph: {
      type: "article",
      url: createCanonicalUrl(pathname),
      siteName: siteConfig.name,
      title: entry.title,
      description: entry.excerpt,
      publishedTime: entry.publishedAt?.toISOString(),
      modifiedTime: entry.updatedAt.toISOString(),
      section: sectionConfig.title,
      images: [
        {
          url: new URL(entry.coverImage, getSiteUrl()).toString(),
        },
      ],
    },
  };
}
