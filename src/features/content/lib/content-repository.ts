import { cache } from "react";

import {
  ensureSeedContent,
  getStarterEntries,
} from "@/features/content/lib/bootstrap-content";
import {
  type ContentEntry,
  type EntrySectionValue,
  type SectionSlug,
  getSectionConfig,
} from "@/features/content/lib/sections";
import { CORE_TARGET_LOCALES } from "@/features/content/lib/translate-entry";
import { prisma } from "@/lib/prisma";

function isDatabaseUnavailableError(error: unknown) {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  if (typeof error !== "object" || error === null) {
    return false;
  }

  const prismaError = error as {
    code?: string;
    message?: string;
  };

  if (prismaError.code === "ECONNREFUSED") {
    return true;
  }

  if (typeof prismaError.message !== "string") {
    return false;
  }

  return (
    prismaError.message.includes("ECONNREFUSED") ||
    prismaError.message.includes("Can't reach database server") ||
    prismaError.message.includes("Invalid `")
  );
}

function getFallbackPublishedEntriesByDbSection(
  section: EntrySectionValue,
  limit?: number,
) {
  const entries = getStarterEntries()
    .filter((entry) => entry.section === section && entry.status === "PUBLISHED")
    .sort((a, b) => {
      const left = a.publishedAt?.getTime() ?? a.createdAt.getTime();
      const right = b.publishedAt?.getTime() ?? b.createdAt.getTime();
      return right - left;
    });

  return typeof limit === "number" ? entries.slice(0, limit) : entries;
}

function getFallbackAdminEntries() {
  return getStarterEntries().sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );
}

function parseGalleryImages(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function normalizeEntry(entry: {
  id: string;
  slug: string;
  title: string;
  kicker: string;
  excerpt: string;
  content: string;
  coverImage: string;
  galleryImages: string;
  readMinutes: number;
  featured: boolean;
  section: string;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): ContentEntry {
  return {
    ...entry,
    section: entry.section as EntrySectionValue,
    status: entry.status as ContentEntry["status"],
    galleryImages: parseGalleryImages(entry.galleryImages),
  };
}

async function applyLocale<T extends ContentEntry>(
  entries: T[],
  locale: string | undefined,
): Promise<T[]> {
  if (!locale || locale === "en" || entries.length === 0) {
    return entries;
  }

  let translations: Array<{
    entryId: string;
    title: string;
    kicker: string;
    excerpt: string;
    content: string;
  }>;

  try {
    translations = await prisma.entryTranslation.findMany({
      where: {
        entryId: { in: entries.map((entry) => entry.id) },
        locale,
        status: "READY",
      },
      select: { entryId: true, title: true, kicker: true, excerpt: true, content: true },
    });
  } catch {
    return entries;
  }

  const translationByEntryId = new Map(
    translations.map((translation) => [translation.entryId, translation]),
  );

  return entries.map((entry) => {
    const translation = translationByEntryId.get(entry.id);
    return translation ? { ...entry, ...translation } : entry;
  });
}

async function getPublishedEntriesByDbSection(
  section: EntrySectionValue,
  limit?: number,
) {
  try {
    await ensureSeedContent();

    const entries = await prisma.entry.findMany({
      where: {
        section,
        status: "PUBLISHED",
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      ...(limit ? { take: limit } : {}),
    });

    return entries.map(normalizeEntry);
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return getFallbackPublishedEntriesByDbSection(section, limit);
    }

    throw error;
  }
}

export const getHomeContent = cache(async (locale?: string) => {
  const [journalEntries, realmEntries, experimentEntries] = await Promise.all([
    getPublishedEntriesByDbSection("JOURNAL", 3).then((entries) => applyLocale(entries, locale)),
    getPublishedEntriesByDbSection("REALMS", 4).then((entries) => applyLocale(entries, locale)),
    getPublishedEntriesByDbSection("EXPERIMENTS", 3).then((entries) =>
      applyLocale(entries, locale),
    ),
  ]);

  return { journalEntries, realmEntries, experimentEntries };
});

export const getHeroStats = cache(async () => {
  try {
    await ensureSeedContent();

    const [realmsMapped, entriesGathered, questionsOpen] = await Promise.all([
      prisma.entry.count({ where: { section: "REALMS", status: "PUBLISHED" } }),
      prisma.entry.count({ where: { status: "PUBLISHED" } }),
      prisma.entry.count({ where: { section: "EXPERIMENTS", status: "PUBLISHED" } }),
    ]);

    return { realmsMapped, entriesGathered, questionsOpen };
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      const publishedEntries = getStarterEntries().filter(
        (entry) => entry.status === "PUBLISHED",
      );

      return {
        realmsMapped: publishedEntries.filter((entry) => entry.section === "REALMS").length,
        entriesGathered: publishedEntries.length,
        questionsOpen: publishedEntries.filter((entry) => entry.section === "EXPERIMENTS").length,
      };
    }

    throw error;
  }
});

export const getAllPublishedEntries = cache(async (locale?: string) => {
  try {
    await ensureSeedContent();

    const entries = await prisma.entry.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });

    return applyLocale(entries.map(normalizeEntry), locale);
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return applyLocale(
        getStarterEntries().filter((entry) => entry.status === "PUBLISHED"),
        locale,
      );
    }

    throw error;
  }
});

export const getEntriesForSection = cache(async (section: SectionSlug, locale?: string) => {
  const dbSection = getSectionConfig(section).dbValue;
  const entries = await getPublishedEntriesByDbSection(dbSection);
  return applyLocale(entries, locale);
});

export const getEntryBySectionAndSlug = cache(
  async (section: SectionSlug, slug: string, locale?: string) => {
    let entry: ContentEntry | null;

    try {
      await ensureSeedContent();

      const found = await prisma.entry.findFirst({
        where: {
          slug,
          section: getSectionConfig(section).dbValue,
          status: "PUBLISHED",
        },
      });

      entry = found ? normalizeEntry(found) : null;
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        entry =
          getStarterEntries().find(
            (item) =>
              item.slug === slug &&
              item.section === getSectionConfig(section).dbValue &&
              item.status === "PUBLISHED",
          ) ?? null;
      } else {
        throw error;
      }
    }

    if (!entry) {
      return null;
    }

    const [localized] = await applyLocale([entry], locale);
    return localized;
  },
);

export const getRelatedEntries = cache(
  async (section: SectionSlug, currentId: string, locale?: string) => {
    let entries: ContentEntry[];

    try {
      await ensureSeedContent();

      const found = await prisma.entry.findMany({
        where: {
          id: { not: currentId },
          section: getSectionConfig(section).dbValue,
          status: "PUBLISHED",
        },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        take: 3,
      });

      entries = found.map(normalizeEntry);
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        entries = getFallbackPublishedEntriesByDbSection(getSectionConfig(section).dbValue)
          .filter((item) => item.id !== currentId)
          .sort((a, b) => Number(b.featured) - Number(a.featured))
          .slice(0, 3);
      } else {
        throw error;
      }
    }

    return applyLocale(entries, locale);
  },
);

export async function getEntryTranslationStatuses(entryId: string) {
  try {
    const translations = await prisma.entryTranslation.findMany({
      where: { entryId, locale: { in: [...CORE_TARGET_LOCALES] } },
      select: { locale: true, status: true },
    });

    const statusByLocale = new Map(translations.map((t) => [t.locale, t.status]));
    return CORE_TARGET_LOCALES.map((locale) => ({
      locale,
      status: statusByLocale.get(locale) ?? "PENDING",
    }));
  } catch {
    return CORE_TARGET_LOCALES.map((locale) => ({ locale, status: "PENDING" as const }));
  }
}

export async function getAdminEntries() {
  try {
    await ensureSeedContent();

    const entries = await prisma.entry.findMany({
      orderBy: [{ updatedAt: "desc" }],
    });

    return entries.map(normalizeEntry);
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return getFallbackAdminEntries();
    }

    throw error;
  }
}

export async function getAdminMetrics() {
  try {
    await ensureSeedContent();

    const [total, published, drafts, featured, latestUpdated] = await Promise.all([
      prisma.entry.count(),
      prisma.entry.count({ where: { status: "PUBLISHED" } }),
      prisma.entry.count({ where: { status: "DRAFT" } }),
      prisma.entry.count({ where: { featured: true } }),
      prisma.entry.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
    ]);

    return {
      total,
      published,
      drafts,
      featured,
      latestUpdated: latestUpdated?.updatedAt ?? null,
    };
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      const entries = getFallbackAdminEntries();

      return {
        total: entries.length,
        published: entries.filter((entry) => entry.status === "PUBLISHED").length,
        drafts: entries.filter((entry) => entry.status === "DRAFT").length,
        featured: entries.filter((entry) => entry.featured).length,
        latestUpdated: entries[0]?.updatedAt ?? null,
      };
    }

    throw error;
  }
}
