import Image from "next/image";
import Link from "next/link";

import { EntryGalleryCarousel } from "@/features/content/components/entry-gallery-carousel";
import { SectionEntryGrid } from "@/features/content/components/section-entry-grid";
import { formatLongDate } from "@/features/content/lib/formatters";
import type { ContentEntry, SectionSlug } from "@/features/content/lib/sections";
import { getSectionConfig } from "@/features/content/lib/sections";
import { PublicLayout } from "@/features/marketing/components/public-layout";
import { SiteShell } from "@/shared/ui/site-shell";
import { createCanonicalUrl } from "@/shared/lib/seo";

type EntryDetailPageProps = {
  entry: ContentEntry;
  relatedEntries: ContentEntry[];
  section: SectionSlug;
};

export function EntryDetailPage({
  entry,
  relatedEntries,
  section,
}: EntryDetailPageProps) {
  const config = getSectionConfig(section);
  const paragraphs = entry.content.split(/\n{2,}/).filter(Boolean);
  const galleryImages = entry.galleryImages;
  const articleUrl = createCanonicalUrl(`/${section}/${entry.slug}`);
  const sectionUrl = createCanonicalUrl(`/${section}`);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.excerpt,
    image: [createCanonicalUrl(entry.coverImage)],
    datePublished: entry.publishedAt?.toISOString(),
    dateModified: entry.updatedAt.toISOString(),
    mainEntityOfPage: articleUrl,
    articleSection: config.title,
    author: {
      "@type": "Organization",
      name: "Explorer's Journal",
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
        name: "Home",
        item: createCanonicalUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: config.title,
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
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-stone-500">
          <Link className="transition hover:text-white" href="/">
            Home
          </Link>
          <span>/</span>
          <Link className="transition hover:text-white" href={`/${section}`}>
            {config.title}
          </Link>
          <span>/</span>
          <span className="text-stone-300">{entry.title}</span>
        </div>
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <Link
              className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-300 transition hover:bg-white/10"
              href={`/${section}`}
            >
              Back to {config.title}
            </Link>
            <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
              {entry.kicker}
            </div>
            <h1 className="font-display text-[clamp(3rem,7vw,5.5rem)] leading-none text-white">
              {entry.title}
            </h1>
            <p className="text-lg leading-8 text-stone-400">{entry.excerpt}</p>
            <div className="flex flex-wrap gap-4 text-sm text-stone-500">
              <span>{entry.readMinutes} min read</span>
              <span>{formatLongDate(entry.publishedAt)}</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10">
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
          <aside className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6">
            <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
              Reading note
            </div>
            <p className="mt-4 text-sm leading-7 text-stone-400">
              This entry belongs to the {config.title.toLowerCase()} archive and
              is managed from the admin control room. New posts for this section
              automatically appear on the homepage and archive page once published.
            </p>
          </aside>

          <article className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 sm:p-8">
            <div className="space-y-6 text-base leading-8 text-stone-300 sm:text-lg">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>

        {galleryImages.length > 0 && (
          <div className="mt-12">
            <EntryGalleryCarousel images={galleryImages} title={entry.title} />
          </div>
        )}

        <div className="mt-16">
          <div className="mb-8">
            <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
              Continue exploring
            </div>
            <h2 className="mt-3 font-display text-4xl text-white">
              More from {config.title}
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
