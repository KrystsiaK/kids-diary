import type { Metadata } from "next";

import { PublicLayout } from "@/features/marketing/components/public-layout";
import { CompassIcon } from "@/shared/icons/site-icons";
import { createPageMetadata } from "@/shared/lib/seo";
import { RevealGroup, RevealItem } from "@/shared/ui/reveal";
import { SiteShell } from "@/shared/ui/site-shell";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  updatedLabel: string;
  sections: LegalSection[];
};

export function createLegalMetadata(
  title: string,
  description: string,
  pathname: string,
): Metadata {
  return createPageMetadata({
    title,
    description,
    pathname,
  });
}

export function LegalPage({
  eyebrow,
  title,
  description,
  updatedLabel,
  sections,
}: LegalPageProps) {
  return (
    <PublicLayout>
      <SiteShell className="relative pb-20 pt-16 sm:pt-20">
        <RevealGroup className="space-y-10">
          <RevealItem className="max-w-4xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[0.72rem] uppercase tracking-[0.24em] text-[var(--muted)]">
              <CompassIcon className="size-4 text-[var(--sand)]" />
              {eyebrow}
            </div>
            <h1 className="mt-6 font-display text-[clamp(3rem,8vw,5.5rem)] leading-none text-[var(--foreground)]">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">
              {description}
            </p>
            <div className="mt-6 text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
              {updatedLabel}
            </div>
          </RevealItem>

          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <RevealItem className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface-strong)] p-6">
              <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                Overview
              </div>
              <h2 className="mt-3 font-display text-3xl text-[var(--foreground)]">
                Plain-language summary
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                These pages explain how the site is used, what content belongs to
                the project, and how visitor information is handled when someone
                browses public pages or signs into the editorial admin area.
              </p>
            </RevealItem>

            <RevealItem className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-strong)] p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    Site owner
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Explorer&apos;s Journal editorial project
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-strong)] p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    Scope
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Public reading experience, archive browsing, and protected admin use
                  </div>
                </div>
              </div>
            </RevealItem>
          </div>

          <div className="space-y-5">
            {sections.map((section) => (
              <RevealItem
                key={section.title}
                className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8"
              >
                <h2 className="font-display text-3xl text-[var(--foreground)]">{section.title}</h2>
                <div className="mt-4 space-y-4">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="max-w-4xl text-base leading-8 text-[var(--muted)]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </RevealItem>
            ))}
          </div>
        </RevealGroup>
      </SiteShell>
    </PublicLayout>
  );
}
