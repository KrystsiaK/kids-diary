import type { Metadata } from "next";

import { SectionArchivePage } from "@/features/content/components/section-archive-page";
import { getEntriesForSection } from "@/features/content/lib/content-repository";
import { createSectionMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = createSectionMetadata("realms");

export default async function RealmsPage() {
  const entries = await getEntriesForSection("realms");
  return <SectionArchivePage entries={entries} section="realms" />;
}
