import Image from "next/image";
import Link from "next/link";

import { EmptySectionState } from "@/features/content/components/empty-section-state";
import { SectionEntryGrid } from "@/features/content/components/section-entry-grid";
import { formatLongDate } from "@/features/content/lib/formatters";
import type { ContentEntry, SectionSlug } from "@/features/content/lib/sections";
import { getEntryHref, getSectionConfig } from "@/features/content/lib/sections";
import { PublicLayout } from "@/features/marketing/components/public-layout";
import { CompassIcon } from "@/shared/icons/site-icons";
import { RevealGroup, RevealItem } from "@/shared/ui/reveal";
import { SiteShell } from "@/shared/ui/site-shell";

type SectionArchivePageProps = {
  section: SectionSlug;
  entries: ContentEntry[];
};

export function SectionArchivePage({
  section,
  entries,
}: SectionArchivePageProps) {
  const config = getSectionConfig(section);
  const featured = entries[0];
  const rest = entries.slice(1);

  return (
    <PublicLayout>
      <SiteShell className="relative pb-20 pt-16 sm:pt-20">
        <RevealGroup className="space-y-10">
          <RevealItem className="max-w-3xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.72rem] uppercase tracking-[0.24em] text-stone-300">
              <CompassIcon className="size-4 text-[var(--secondary)]" />
              Section archive
            </div>
            <h1 className="mt-6 font-display text-[clamp(3.2rem,8vw,6rem)] leading-none text-white">
              {config.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-400">
              {config.headline}. {config.description}
            </p>
          </RevealItem>

          {featured ? (
            <>
              <RevealItem>
                <div className="grid gap-6 rounded-[2rem] border border-white/8 bg-white/[0.03] p-5 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="overflow-hidden rounded-[1.6rem] border border-white/10">
                    <Image
                      alt={featured.title}
                      className="aspect-[16/10] h-full w-full object-cover"
                      height={900}
                      src={featured.coverImage}
                      width={1400}
                    />
                  </div>
                  <div className="flex flex-col justify-center rounded-[1.6rem] border border-white/8 bg-black/20 p-6">
                    <div className="text-xs uppercase tracking-[0.22em] text-stone-500">
                      Featured {config.title.toLowerCase()} entry
                    </div>
                    <h2 className="mt-4 font-display text-5xl leading-none text-white">
                      {featured.title}
                    </h2>
                    <p className="mt-4 text-base leading-7 text-stone-400">
                      {featured.excerpt}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4 text-sm text-stone-500">
                      <span>{featured.kicker}</span>
                      <span>{formatLongDate(featured.publishedAt)}</span>
                    </div>
                    <Link
                      className="mt-8 inline-flex w-fit rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color-mix(in_oklab,var(--accent)_82%,white)]"
                      href={getEntryHref(section, featured.slug)}
                    >
                      Read featured entry
                    </Link>
                  </div>
                </div>
              </RevealItem>

              <RevealItem>
                {section === "journal" ? (
                  <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                    <aside className="rounded-[2rem] border border-white/8 bg-black/20 p-6">
                      <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
                        Reading path
                      </div>
                      <h3 className="mt-3 font-display text-3xl text-white">
                        Move through the journal like a field notebook
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-stone-400">
                        Each entry reads as a chapter rather than a card in a feed.
                        Start at the top or jump directly into any note below.
                      </p>
                    </aside>
                    <SectionEntryGrid entries={rest} section={section} variant="list" />
                  </div>
                ) : section === "realms" ? (
                  <div className="space-y-6">
                    <div className="max-w-2xl">
                      <h3 className="font-display text-4xl text-white">
                        A visual atlas of terrains
                      </h3>
                      <p className="mt-3 text-base leading-7 text-stone-400">
                        Realms are browsed like destinations. Each card leads to its
                        own detailed record with image, context, and related entries.
                      </p>
                    </div>
                    <SectionEntryGrid entries={rest} section={section} variant="cards" />
                  </div>
                ) : (
                  <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
                    <aside className="rounded-[2rem] border border-white/8 bg-black/20 p-6">
                      <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
                        Lab protocol
                      </div>
                      <h3 className="mt-3 font-display text-3xl text-white">
                        Browse experiments as prompts, not blog posts
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-stone-400">
                        The experiments archive is intentionally tighter and faster:
                        short prompts, clear entry points, and direct jumps into the idea.
                      </p>
                    </aside>
                    <SectionEntryGrid entries={rest} section={section} variant="compact" />
                  </div>
                )}
              </RevealItem>
            </>
          ) : (
            <RevealItem>
              <EmptySectionState section={section} />
            </RevealItem>
          )}
        </RevealGroup>
      </SiteShell>
    </PublicLayout>
  );
}
