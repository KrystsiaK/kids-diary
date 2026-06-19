import Link from "next/link";

import { getHomeContent } from "@/features/content/lib/content-repository";
import { getEntryHref } from "@/features/content/lib/sections";
import { PublicLayout } from "@/features/marketing/components/public-layout";
import { ExperimentsSection } from "@/features/marketing/components/sections/experiments-section";
import { HeroSection } from "@/features/marketing/components/sections/hero-section";
import { JournalSection } from "@/features/marketing/components/sections/journal-section";
import { RealmsSection } from "@/features/marketing/components/sections/realms-section";
import { CompassIcon } from "@/shared/icons/site-icons";
import { getSiteUrl } from "@/shared/config/site";
import { RevealGroup, RevealItem } from "@/shared/ui/reveal";
import { SiteShell } from "@/shared/ui/site-shell";

export async function MarketingPage() {
  const { journalEntries, realmEntries, experimentEntries } =
    await getHomeContent();
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Explorer's Journal",
    url: getSiteUrl(),
    logo: `${getSiteUrl()}/favicon.ico`,
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Explorer's Journal",
    url: getSiteUrl(),
    description:
      "A richly crafted explorer archive of journals, realms, and experiments.",
  };
  const latestAcrossSite = [
    ...journalEntries.map((entry) => ({ ...entry, href: getEntryHref("journal", entry.slug) })),
    ...realmEntries.map((entry) => ({ ...entry, href: getEntryHref("realms", entry.slug) })),
    ...experimentEntries.map((entry) => ({
      ...entry,
      href: getEntryHref("experiments", entry.slug),
    })),
  ]
    .sort((a, b) => {
      const left = a.publishedAt?.getTime() ?? 0;
      const right = b.publishedAt?.getTime() ?? 0;
      return right - left;
    })
    .slice(0, 4);

  return (
    <PublicLayout>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd),
        }}
        type="application/ld+json"
      />
      <HeroSection />
      <section className="py-8">
        <SiteShell>
          <RevealGroup className="grid gap-4 rounded-[2rem] border border-white/8 bg-white/[0.03] p-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <RevealItem>
              <div className="max-w-sm">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.72rem] uppercase tracking-[0.24em] text-stone-300">
                  <CompassIcon className="size-4 text-[var(--sand)]" />
                  Fresh on the map
                </div>
                <h2 className="mt-4 font-display text-4xl text-white">
                  Start with what was published most recently
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-400">
                  This rail is the quickest way into the archive if you want
                  to jump straight to a story instead of browsing by section.
                </p>
              </div>
            </RevealItem>
            <div className="grid gap-3 md:grid-cols-2">
              {latestAcrossSite.map((entry) => (
                <RevealItem key={entry.id}>
                  <Link
                    className="block rounded-[1.4rem] border border-white/8 bg-black/20 p-4 transition hover:-translate-y-0.5 hover:bg-white/[0.05]"
                    href={entry.href}
                  >
                    <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
                      {entry.section.toLowerCase()} · {entry.kicker}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-white">
                      {entry.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-stone-400">
                      {entry.excerpt}
                    </p>
                  </Link>
                </RevealItem>
              ))}
            </div>
          </RevealGroup>
        </SiteShell>
      </section>
      <JournalSection entries={journalEntries} />
      <RealmsSection entries={realmEntries} />
      <ExperimentsSection entries={experimentEntries} />
    </PublicLayout>
  );
}
