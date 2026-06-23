import type { Metadata } from "next";

import type { ContentEntry, SectionSlug } from "@/features/content/lib/sections";
import { getSectionConfig } from "@/features/content/lib/sections";
import { routing } from "@/i18n/routing";
import { siteConfig, getSiteUrl } from "@/shared/config/site";

export function createCanonicalUrl(pathname: string) {
  return new URL(pathname, getSiteUrl()).toString();
}

export function getLocalizedPathname(pathname: string, locale: string) {
  if (locale === routing.defaultLocale) {
    return pathname;
  }

  return `/${locale}${pathname === "/" ? "" : pathname}`;
}

function isLocalPathname(pathname: string) {
  return pathname.startsWith("/");
}

function createLocalizedCanonicalUrl(pathname: string, locale?: string) {
  const localizedPathname =
    locale && isLocalPathname(pathname)
      ? getLocalizedPathname(pathname, locale)
      : pathname;

  return createCanonicalUrl(localizedPathname);
}

export function createPageMetadata({
  title,
  description,
  pathname,
  image,
  locale,
}: {
  title: string;
  description: string;
  pathname: string;
  image?: string;
  locale?: string;
}): Metadata {
  const canonical = createLocalizedCanonicalUrl(pathname, locale);
  const imageUrl = new URL(image ?? siteConfig.ogImage, getSiteUrl()).toString();
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      createLocalizedCanonicalUrl(pathname, locale),
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
      locale,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: image ? undefined : 1200,
          height: image ? undefined : 630,
          alt: title,
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

export function createSectionMetadata(section: SectionSlug, locale?: string): Metadata {
  const config = getSectionConfig(section);

  return createPageMetadata({
    title: config.title,
    description: `${config.headline}. ${config.description}`,
    pathname: `/${section}`,
    locale,
  });
}

export function createEntryMetadata(
  section: SectionSlug,
  entry: ContentEntry,
  locale?: string,
): Metadata {
  const sectionConfig = getSectionConfig(section);
  const pathname = `/${section}/${entry.slug}`;
  const canonical = createLocalizedCanonicalUrl(pathname, locale);
  const imageUrl = new URL(entry.coverImage, getSiteUrl()).toString();

  return {
    ...createPageMetadata({
      title: entry.title,
      description: entry.excerpt,
      pathname,
      image: entry.coverImage,
      locale,
    }),
    openGraph: {
      type: "article",
      url: canonical,
      locale,
      siteName: siteConfig.name,
      title: entry.title,
      description: entry.excerpt,
      publishedTime: entry.publishedAt?.toISOString(),
      modifiedTime: entry.updatedAt.toISOString(),
      section: sectionConfig.title,
      images: [
        {
          url: imageUrl,
          alt: entry.title,
        },
      ],
    },
  };
}
