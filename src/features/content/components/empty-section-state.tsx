import { getTranslations } from "next-intl/server";
import NextLink from "next/link";

import type { SectionSlug } from "@/features/content/lib/sections";

export async function EmptySectionState({ section }: { section: SectionSlug }) {
  const t = await getTranslations();
  const sectionTitle = t(`nav.${section}`);
  const archive = await getTranslations(`sectionsArchive.${section}`);
  const emptyTitle = archive("emptyTitle");

  return (
    <div className="rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center">
      <h3 className="font-display text-3xl text-[var(--foreground)]">{emptyTitle}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
        {t("emptyState.description", { section: sectionTitle.toLowerCase() })}
      </p>
      <NextLink
        className="mt-6 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-strong)]"
        href="/admin"
      >
        {t("emptyState.cta")}
      </NextLink>
    </div>
  );
}