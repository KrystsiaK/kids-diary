import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { SectionArchivePage } from "@/features/content/components/section-archive-page";
import { getEntriesForSection } from "@/features/content/lib/content-repository";
import { createSectionMetadata } from "@/shared/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createSectionMetadata("realms");

export default async function RealmsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const entries = await getEntriesForSection("realms", locale);
  return <SectionArchivePage entries={entries} section="realms" />;
}
