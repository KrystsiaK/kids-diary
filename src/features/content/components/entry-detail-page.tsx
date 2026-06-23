import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { EntryGalleryCarousel } from "@/features/content/components/entry-gallery-carousel";
import { EntryTranslationProvider } from "@/features/content/components/entry-translation-context";
import { SectionEntryGrid } from "@/features/content/components/section-entry-grid";
import { TranslatePrompt } from "@/features/content/components/translate-prompt";
import { TranslatedArticleBody, TranslatedField } from "@/features/content/components/translatable-text";
import { formatLongDate } from "@/features/content/lib/formatters";
import type { ContentEntry, SectionSlug } from "@/features/content/lib/sections";
import { PublicLayout } from "@/features/marketing/components/public-layout";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { SiteShell } from "@/shared/ui/site-shell";
import { createCanonicalUrl } from "@/shared/lib/seo";

type EntryDetailPageProps = {
  entry: ContentEntry;
  relatedEntries: ContentEntry[];
  section: SectionSlug;
};

export async function EntryDetailPage({
  entry,
  relatedEntries,
  section,
}: EntryDetailPageProps) {
  const t = await getTranslations();
  const locale = await getLocale();
  const sectionTitle = t(`nav.${section}`);
  const galleryImages = entry.galleryImages;
  const articlePathname = `/${section}/${entry.slug}`;
  const sectionPathname = `/${section}`;
  const localizedArticlePathname =
    locale === routing.defaultLocale ? articlePathname : `/${locale}${articlePathname}`;
  const localizedSectionPathname =
    locale === routing.defaultLocale ? sectionPathname : `/${locale}${sectionPathname}`;
  const articleUrl = createCanonicalUrl(localizedArticlePathname);
  const sectionUrl = createCanonicalUrl(localizedSectionPathname);
  const wordCount = entry.content.trim().split(/\s+/).filter(Boolean).length;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: entry.title,
    description: entry.excerpt,
    image: [createCanonicalUrl(entry.coverImage)],
    datePublished: entry.publishedAt?.toISOString(),
    dateModified: entry.updatedAt.toISOString(),
    inLanguage: locale,
    isAccessibleForFree: true,
    url: articleUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    articleSection: sectionTitle,
    wordCount,
    timeRequired: `PT${entry.readMinutes}M`,
    author: {
      "@type": "Person",
      name: "Arthur",
    },
    publisher: {
      "@type": "Organization",
      name: "Explorer's Journal",
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t("entryDetail.home"),
        item: createCanonicalUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: sectionTitle,
        item: sectionUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: entry.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <PublicLayout>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
        type="application/ld+json"
      />
      <SiteShell className="pb-20 pt-16 sm:pt-20">
        <EntryTranslationProvider
          entryId={entry.id}
          initial={{
            title: entry.title,
            kicker: entry.kicker,
            excerpt: entry.excerpt,
            content: entry.content,
          }}
          locale={locale}
        >
          <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <Link className="transition hover:text-[var(--foreground)]" href="/">
              {t("entryDetail.home")}
            </Link>
            <span>/</span>
            <Link className="transition hover:text-[var(--foreground)]" href={`/${section}`}>
              {sectionTitle}
            </Link>
            <span>/</span>
            <span className="text-[var(--muted)]">
              <TranslatedField field="title" />
            </span>
          </div>
          <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-6">
              <Link
                className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--surface-strong)]"
                href={`/${section}`}
              >
                {t("entryDetail.backTo", { section: sectionTitle })}
              </Link>
              <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                <TranslatedField field="kicker" />
              </div>
              <h1 className="font-display text-[clamp(3rem,7vw,5.5rem)] leading-none text-[var(--foreground)]">
                <TranslatedField field="title" />
              </h1>
              <p className="text-lg leading-8 text-[var(--muted)]">
                <TranslatedField field="excerpt" />
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                <span>{t("entryDetail.minRead", { count: entry.readMinutes })}</span>
                <span>{formatLongDate(entry.publishedAt)}</span>
              </div>
              <TranslatePrompt />
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-[var(--border)]">
              <Image
                alt={entry.title}
                className="aspect-[5/4] h-full w-full object-cover"
                height={1200}
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                src={entry.coverImage}
                width={1600}
              />
            </div>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                {t("entryDetail.readingNoteBadge")}
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                {t("entryDetail.readingNoteBody", { section: sectionTitle.toLowerCase() })}
              </p>
            </aside>

            <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <TranslatedArticleBody />
            </article>
          </div>
        </EntryTranslationProvider>

        {galleryImages.length > 0 && (
          <div className="mt-12">
            <EntryGalleryCarousel images={galleryImages} title={entry.title} />
          </div>
        )}

        <div className="mt-16">
          <div className="mb-8">
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              {t("entryDetail.continueExploring")}
            </div>
            <h2 className="mt-3 font-display text-4xl text-[var(--foreground)]">
              {t("entryDetail.moreFrom", { section: sectionTitle })}
            </h2>
          </div>
          <SectionEntryGrid
            entries={relatedEntries}
            section={section}
            variant={section === "journal" ? "list" : "compact"}
          />
        </div>
      </SiteShell>
    </PublicLayout>
  );
}
