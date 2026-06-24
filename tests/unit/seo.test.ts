import { afterEach, describe, expect, it, vi } from "vitest";

import type { ContentEntry } from "@/features/content/lib/sections";
import {
  createCanonicalUrl,
  createEntryMetadata,
  createPageMetadata,
  createSectionMetadata,
  getLocalizedPathname,
} from "@/shared/lib/seo";

describe("seo", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds canonical URLs from configured site URLs without duplicate slashes", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://journal.test/");

    expect(createCanonicalUrl("/journal")).toBe("https://journal.test/journal");
  });

  it("localizes paths except for the default locale", () => {
    expect(getLocalizedPathname("/journal", "en")).toBe("/journal");
    expect(getLocalizedPathname("/", "pt")).toBe("/pt");
    expect(getLocalizedPathname("/journal", "ru")).toBe("/ru/journal");
  });

  it("creates localized page metadata with default OG image dimensions", () => {
    vi.stubEnv("SITE_URL", "https://site.test");

    const metadata = createPageMetadata({
      title: "Journal",
      description: "Field notes",
      pathname: "/journal",
      locale: "pt",
    });

    expect(metadata.alternates?.canonical).toBe("https://site.test/pt/journal");
    expect(metadata.alternates?.languages).toMatchObject({
      en: "https://site.test/journal",
      pt: "https://site.test/pt/journal",
      "x-default": "https://site.test/journal",
    });
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      url: "https://site.test/pt/journal",
      locale: "pt",
      title: "Journal",
    });
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "https://site.test/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Journal",
      },
    ]);
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: ["https://site.test/opengraph-image"],
    });
  });

  it("keeps absolute non-local canonicals untouched when locale is provided", () => {
    vi.stubEnv("SITE_URL", "https://site.test");

    const metadata = createPageMetadata({
      title: "External",
      description: "External canonical",
      pathname: "https://elsewhere.test/story",
      image: "https://cdn.test/cover.webp",
      locale: "pl",
    });

    expect(metadata.alternates?.canonical).toBe("https://elsewhere.test/story");
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "https://cdn.test/cover.webp",
        width: undefined,
        height: undefined,
        alt: "External",
      },
    ]);
  });

  it("creates section and article metadata from content entries", () => {
    vi.stubEnv("SITE_URL", "https://site.test");

    const sectionMetadata = createSectionMetadata("experiments", "es");
    expect(sectionMetadata.title).toBe("Experiments");
    expect(sectionMetadata.alternates?.canonical).toBe("https://site.test/es/experiments");

    const entry = {
      id: "entry-1",
      slug: "seed-lab",
      title: "Seed Lab",
      kicker: "Experiment",
      excerpt: "Testing growth",
      content: "Body",
      coverImage: "/covers/seed.webp",
      publishedAt: new Date("2026-06-01T10:00:00.000Z"),
      updatedAt: new Date("2026-06-02T10:00:00.000Z"),
      section: "EXPERIMENTS",
      customCss: null,
      createdAt: new Date("2026-05-01T10:00:00.000Z"),
    } satisfies ContentEntry;

    const metadata = createEntryMetadata("experiments", entry, "ru");

    expect(metadata.title).toBe("Seed Lab");
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      url: "https://site.test/ru/experiments/seed-lab",
      publishedTime: "2026-06-01T10:00:00.000Z",
      modifiedTime: "2026-06-02T10:00:00.000Z",
      section: "Experiments",
    });
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "https://site.test/covers/seed.webp",
        alt: "Seed Lab",
      },
    ]);
  });
});
