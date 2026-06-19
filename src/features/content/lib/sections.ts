export const sectionSlugs = ["journal", "experiments", "realms"] as const;

export type SectionSlug = (typeof sectionSlugs)[number];
export type EntrySectionValue = "JOURNAL" | "EXPERIMENTS" | "REALMS";
export type EntryStatusValue = "DRAFT" | "PUBLISHED";

export type ContentEntry = {
  id: string;
  slug: string;
  title: string;
  kicker: string;
  excerpt: string;
  content: string;
  coverImage: string;
  galleryImages: string[];
  readMinutes: number;
  featured: boolean;
  section: EntrySectionValue;
  status: EntryStatusValue;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export const sectionConfig = {
  journal: {
    dbValue: "JOURNAL",
    title: "Journal",
    headline: "Field notes from the expedition",
    description:
      "Essays, sketches, and remembered details from the quiet part of discovery.",
    emptyTitle: "No journal entries yet",
  },
  experiments: {
    dbValue: "EXPERIMENTS",
    title: "Experiments",
    headline: "Prompts, systems, and curiosity tests",
    description:
      "A laboratory for ideas that need to be played with before they become doctrine.",
    emptyTitle: "No experiments yet",
  },
  realms: {
    dbValue: "REALMS",
    title: "Realms",
    headline: "Catalogues of strange terrains",
    description:
      "A visual archive of places, climates, and symbolic ecosystems worth returning to.",
    emptyTitle: "No realms yet",
  },
} as const satisfies Record<
  SectionSlug,
  {
    dbValue: EntrySectionValue;
    title: string;
    headline: string;
    description: string;
    emptyTitle: string;
  }
>;

export function getSectionConfig(section: SectionSlug) {
  return sectionConfig[section];
}

export function isSectionSlug(value: string): value is SectionSlug {
  return sectionSlugs.includes(value as SectionSlug);
}

export function getEntryHref(section: SectionSlug, slug: string) {
  return `/${section}/${slug}`;
}

export function formatSectionLabel(section: EntrySectionValue) {
  return section.charAt(0) + section.slice(1).toLowerCase();
}
