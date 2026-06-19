import type { Metadata } from "next";

import { SectionArchivePage } from "@/features/content/components/section-archive-page";
import { getEntriesForSection } from "@/features/content/lib/content-repository";
import { createSectionMetadata } from "@/shared/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createSectionMetadata("experiments");

export default async function ExperimentsPage() {
  const entries = await getEntriesForSection("experiments");
  return <SectionArchivePage entries={entries} section="experiments" />;
}
