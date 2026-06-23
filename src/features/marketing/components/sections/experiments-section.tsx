import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { EmptySectionState } from "@/features/content/components/empty-section-state";
import { SectionEntryGrid } from "@/features/content/components/section-entry-grid";
import type { ContentEntry } from "@/features/content/lib/sections";
import { Link } from "@/i18n/navigation";
import { OrbitIcon } from "@/shared/icons/site-icons";
import { Reveal, RevealGroup, RevealItem } from "@/shared/ui/reveal";
import { SectionHeading } from "@/shared/ui/section-heading";
import { SiteShell } from "@/shared/ui/site-shell";

export async function ExperimentsSection({ entries }: { entries: ContentEntry[] }) {
  const t = await getTranslations("sectionsHome.experiments");
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
                description={t("description")}
                eyebrow={t("eyebrow")}
                title={t("title")}
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
                  className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-strong)]"
                  href="/experiments"
                >
                  {t("cta")}
                </Link>
              </div>
            </RevealItem>
          </RevealGroup>

          <Reveal className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_20%_20%,rgba(201,125,107,0.14),transparent_26%),radial-gradient(circle_at_80%_70%,rgba(74,124,157,0.18),transparent_32%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_0.78fr]">
                <div className="space-y-4 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-strong)] p-6">
                  <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                    {t("activePrompt")}
                  </div>
                  <h3 className="font-display text-3xl text-[var(--foreground)]">
                    {featured?.title ?? t("fallbackTitle")}
                  </h3>
                  <p className="text-sm leading-7 text-[var(--muted)]">
                    {featured?.excerpt ?? t("fallbackExcerpt")}
                  </p>
                </div>
                <div className="overflow-hidden rounded-[1.5rem]">
                  <Image
                    alt={featured?.title ?? t("imageAlt")}
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