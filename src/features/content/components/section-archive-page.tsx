import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { EmptySectionState } from "@/features/content/components/empty-section-state";
import { SectionEntryGrid } from "@/features/content/components/section-entry-grid";
import { formatLongDate } from "@/features/content/lib/formatters";
import type { ContentEntry, SectionSlug } from "@/features/content/lib/sections";
import { getEntryHref } from "@/features/content/lib/sections";
import { PublicLayout } from "@/features/marketing/components/public-layout";
import { Link } from "@/i18n/navigation";
import { CompassIcon } from "@/shared/icons/site-icons";
import { RevealGroup, RevealItem } from "@/shared/ui/reveal";
import { SiteShell } from "@/shared/ui/site-shell";

type SectionArchivePageProps = {
  section: SectionSlug;
  entries: ContentEntry[];
};

export async function SectionArchivePage({
  section,
  entries,
}: SectionArchivePageProps) {
  const t = await getTranslations();
  const sectionTitle = t(`nav.${section}`);
  const archive = await getTranslations(`sectionsArchive.${section}`);
  const featured = entries[0];
  const rest = entries.slice(1);

  return (
    <PublicLayout>
      <SiteShell className="relative pb-20 pt-16 sm:pt-20">
        <RevealGroup className="space-y-10">
          <RevealItem className="max-w-3xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[0.72rem] uppercase tracking-[0.24em] text-[var(--muted)]">
              <CompassIcon className="size-4 text-[var(--secondary)]" />
              {t("archive.badge")}
            </div>
            <h1 className="mt-6 font-display text-[clamp(3.2rem,8vw,6rem)] leading-none text-[var(--foreground)]">
              {sectionTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              {archive("headline")}. {archive("description")}
            </p>
          </RevealItem>

          {featured ? (
            <>
              <RevealItem>
                <div className="grid gap-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="overflow-hidden rounded-[1.6rem] border border-[var(--border)]">
                    <Image
                      alt={featured.title}
                      className="aspect-[16/10] h-full w-full object-cover"
                      height={900}
                      src={featured.coverImage}
                      width={1400}
                    />
                  </div>
                  <div className="flex flex-col justify-center rounded-[1.6rem] border border-[var(--border)] bg-[var(--surface-strong)] p-6">
                    <div className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                      {t("archive.featuredEntry", { section: sectionTitle.toLowerCase() })}
                    </div>
                    <h2 className="mt-4 font-display text-5xl leading-none text-[var(--foreground)]">
                      {featured.title}
                    </h2>
                    <p className="mt-4 text-base leading-7 text-[var(--muted)]">
                      {featured.excerpt}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                      <span>{featured.kicker}</span>
                      <span>{formatLongDate(featured.publishedAt)}</span>
                    </div>
                    <Link
                      className="mt-8 inline-flex w-fit rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[color-mix(in_oklab,var(--accent)_82%,white)]"
                      href={getEntryHref(section, featured.slug)}
                    >
                      {t("archive.readFeatured")}
                    </Link>
                  </div>
                </div>
              </RevealItem>

              <RevealItem>
                {section === "journal" ? (
                  <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                    <aside className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface-strong)] p-6">
                      <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                        {archive("readingPathBadge")}
                      </div>
                      <h3 className="mt-3 font-display text-3xl text-[var(--foreground)]">
                        {archive("readingPathTitle")}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                        {archive("readingPathDescription")}
                      </p>
                    </aside>
                    <SectionEntryGrid entries={rest} section={section} variant="list" />
                  </div>
                ) : section === "realms" ? (
                  <div className="space-y-6">
                    <div className="max-w-2xl">
                      <h3 className="font-display text-4xl text-[var(--foreground)]">
                        {archive("atlasTitle")}
                      </h3>
                      <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                        {archive("atlasDescription")}
                      </p>
                    </div>
                    <SectionEntryGrid entries={rest} section={section} variant="cards" />
                  </div>
                ) : (
                  <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
                    <aside className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface-strong)] p-6">
                      <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                        {archive("labProtocolBadge")}
                      </div>
                      <h3 className="mt-3 font-display text-3xl text-[var(--foreground)]">
                        {archive("labProtocolTitle")}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                        {archive("labProtocolDescription")}
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