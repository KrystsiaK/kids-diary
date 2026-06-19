import Link from "next/link";

import { EmptySectionState } from "@/features/content/components/empty-section-state";
import { SectionEntryGrid } from "@/features/content/components/section-entry-grid";
import type { ContentEntry } from "@/features/content/lib/sections";
import { SparkIcon } from "@/shared/icons/site-icons";
import { RevealGroup, RevealItem } from "@/shared/ui/reveal";
import { SectionHeading } from "@/shared/ui/section-heading";
import { SiteShell } from "@/shared/ui/site-shell";

export function RealmsSection({ entries }: { entries: ContentEntry[] }) {
  return (
    <section id="realms" className="py-20">
      <SiteShell>
        <RevealGroup className="space-y-10">
          <RevealItem>
            <SectionHeading
              accent={<SparkIcon className="size-4 text-[var(--accent)]" />}
              description="Every terrain carries a different language. These cards catalogue the places where wonder behaves differently."
              eyebrow="Field Notes"
              title="Realms and discoveries"
            />
          </RevealItem>
          <RevealItem>
            {entries.length > 0 ? (
              <SectionEntryGrid entries={entries} section="realms" variant="cards" />
            ) : (
              <EmptySectionState section="realms" />
            )}
          </RevealItem>
          <RevealItem>
            <div className="flex justify-end">
              <Link
                className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/10"
                href="/realms"
              >
                Open the realms archive
              </Link>
            </div>
          </RevealItem>
        </RevealGroup>
      </SiteShell>
    </section>
  );
}
