import Image from "next/image";
import Link from "next/link";

import { EmptySectionState } from "@/features/content/components/empty-section-state";
import { SectionEntryGrid } from "@/features/content/components/section-entry-grid";
import type { ContentEntry } from "@/features/content/lib/sections";
import { OrbitIcon } from "@/shared/icons/site-icons";
import { Reveal, RevealGroup, RevealItem } from "@/shared/ui/reveal";
import { SectionHeading } from "@/shared/ui/section-heading";
import { SiteShell } from "@/shared/ui/site-shell";

export function ExperimentsSection({ entries }: { entries: ContentEntry[] }) {
  const featured = entries[0];
  const compactEntries = featured ? entries.slice(1) : entries;

  return (
    <section id="laboratory" className="py-20">
      <SiteShell>
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <RevealGroup className="space-y-8">
            <RevealItem>
              <SectionHeading
                accent={<OrbitIcon className="size-4 text-[var(--sand)]" />}
                description="Interactive prompts, sideways questions, and playful systems that train a sharper eye."
                eyebrow="Laboratory"
                title="Experiments in wonder"
              />
            </RevealItem>
            <RevealItem>
              {entries.length > 0 ? (
                <SectionEntryGrid
                  entries={compactEntries.length > 0 ? compactEntries : entries}
                  section="experiments"
                  variant="compact"
                />
              ) : (
                <EmptySectionState section="experiments" />
              )}
            </RevealItem>
            <RevealItem>
              <div className="flex justify-end">
                <Link
                  className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/10"
                  href="/experiments"
                >
                  Browse all experiments
                </Link>
              </div>
            </RevealItem>
          </RevealGroup>

          <Reveal className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_20%_20%,rgba(201,125,107,0.14),transparent_26%),radial-gradient(circle_at_80%_70%,rgba(74,124,157,0.18),transparent_32%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_0.78fr]">
                <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
                  <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
                    Active prompt
                  </div>
                  <h3 className="font-display text-3xl text-white">
                    {featured?.title ?? "What changes when the map is also the diary?"}
                  </h3>
                  <p className="text-sm leading-7 text-stone-400">
                    {featured?.excerpt ??
                      "Use the lab to prototype narrative systems, visual motifs, and curiosity-driven interactions before they become entries."}
                  </p>
                </div>
                <div className="overflow-hidden rounded-[1.5rem]">
                  <Image
                    alt={featured?.title ?? "Abstract exploratory image"}
                    className="h-full w-full object-cover"
                    height={960}
                    src={featured?.coverImage ?? "/media/realms-image-4.png"}
                    width={720}
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </SiteShell>
    </section>
  );
}
