import { getTranslations } from "next-intl/server";

import { EmptySectionState } from "@/features/content/components/empty-section-state";
import { SectionEntryGrid } from "@/features/content/components/section-entry-grid";
import type { ContentEntry } from "@/features/content/lib/sections";
import { Link } from "@/i18n/navigation";
import { MoonIcon } from "@/shared/icons/site-icons";
import { RevealGroup, RevealItem } from "@/shared/ui/reveal";
import { SectionHeading } from "@/shared/ui/section-heading";
import { SiteShell } from "@/shared/ui/site-shell";

export async function JournalSection({ entries }: { entries: ContentEntry[] }) {
  const t = await getTranslations("sectionsHome.journal");

  return (
    <section id="journal" className="py-20">
      <SiteShell>
        <RevealGroup className="space-y-10">
          <RevealItem>
            <SectionHeading
              accent={<MoonIcon className="size-4 text-[var(--sand)]" />}
              description={t("description")}
              eyebrow={t("eyebrow")}
              title={t("title")}
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
                className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-strong)]"
                href="/journal"
              >
                {t("cta")}
              </Link>
            </div>
          </RevealItem>
        </RevealGroup>
      </SiteShell>
    </section>
  );
}