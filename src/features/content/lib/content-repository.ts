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

export const getHomeContent = cache(async () => {
  const [journalEntries, realmEntries, experimentEntries] = await Promise.all([
    getPublishedEntriesByDbSection("JOURNAL", 3),
    getPublishedEntriesByDbSection("REALMS", 4),
    getPublishedEntriesByDbSection("EXPERIMENTS", 3),
  ]);

  return { journalEntries, realmEntries, experimentEntries };
});

export const getEntriesForSection = cache(async (section: SectionSlug) => {
  const dbSection = getSectionConfig(section).dbValue;
  return getPublishedEntriesByDbSection(dbSection);
});

export const getEntryBySectionAndSlug = cache(
  async (section: SectionSlug, slug: string) => {
    try {
      await ensureSeedContent();

      const entry = await prisma.entry.findFirst({
        where: {
          slug,
          section: getSectionConfig(section).dbValue,
          status: "PUBLISHED",
        },
      });

      return entry ? normalizeEntry(entry) : null;
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        return (
          getStarterEntries().find(
            (entry) =>
              entry.slug === slug &&
              entry.section === getSectionConfig(section).dbValue &&
              entry.status === "PUBLISHED",
          ) ?? null
        );
      }

      throw error;
    }
  },
);

export const getRelatedEntries = cache(
  async (section: SectionSlug, currentId: string) => {
    try {
      await ensureSeedContent();

      const entries = await prisma.entry.findMany({
        where: {
          id: { not: currentId },
          section: getSectionConfig(section).dbValue,
          status: "PUBLISHED",
        },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        take: 3,
      });

      return entries.map(normalizeEntry);
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        return getFallbackPublishedEntriesByDbSection(
          getSectionConfig(section).dbValue,
        )
          .filter((entry) => entry.id !== currentId)
          .sort((a, b) => Number(b.featured) - Number(a.featured))
          .slice(0, 3);
      }

      throw error;
    }
  },
);

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
