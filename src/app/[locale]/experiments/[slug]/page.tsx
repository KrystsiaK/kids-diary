import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { EntryDetailPage } from "@/features/content/components/entry-detail-page";
import {
  getEntryBySectionAndSlug,
  getRelatedEntries,
} from "@/features/content/lib/content-repository";
import { createEntryMetadata } from "@/shared/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryBySectionAndSlug("experiments", slug);

  if (!entry) {
    return {
      title: "Entry not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return createEntryMetadata("experiments", entry);
}

export default async function ExperimentEntryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const entry = await getEntryBySectionAndSlug("experiments", slug, locale);

  if (!entry) {
    notFound();
  }

  const relatedEntries = await getRelatedEntries("experiments", entry.id, locale);

  return (
    <EntryDetailPage
      entry={entry}
      relatedEntries={relatedEntries}
      section="experiments"
    />
  );
}
