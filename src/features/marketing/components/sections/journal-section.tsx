import Link from "next/link";

import { EmptySectionState } from "@/features/content/components/empty-section-state";
import { SectionEntryGrid } from "@/features/content/components/section-entry-grid";
import type { ContentEntry } from "@/features/content/lib/sections";
import { MoonIcon } from "@/shared/icons/site-icons";
import { RevealGroup, RevealItem } from "@/shared/ui/reveal";
import { SectionHeading } from "@/shared/ui/section-heading";
import { SiteShell } from "@/shared/ui/site-shell";

export function JournalSection({ entries }: { entries: ContentEntry[] }) {
  return (
    <section id="journal" className="py-20">
      <SiteShell>
        <RevealGroup className="space-y-10">
          <RevealItem>
            <SectionHeading
              accent={<MoonIcon className="size-4 text-[var(--sand)]" />}
              description="A running log of encounters, sketches, and remembered details from the field."
              eyebrow="The Journal"
              title="Chronicles of wonder"
            />
          </RevealItem>
          <RevealItem>
            {entries.length > 0 ? (
              <SectionEntryGrid entries={entries} section="journal" variant="list" />
            ) : (
              <EmptySectionState section="journal" />
            )}
          </RevealItem>
          <RevealItem>
            <div className="flex justify-end">
              <Link
                className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/10"
                href="/journal"
              >
                View all journal entries
              </Link>
            </div>
          </RevealItem>
        </RevealGroup>
      </SiteShell>
    </section>
  );
}
