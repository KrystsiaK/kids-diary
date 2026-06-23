import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { createLegalMetadata, LegalPage } from "@/features/legal/components/legal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return createLegalMetadata(
    "Terms of Use",
    "Rules for using Explorer's Journal, its published content, and the protected editorial tools.",
    "/terms",
    locale,
  );
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalPage
      description="These terms describe the rules for accessing the public archive, reading published material, and using the protected editorial tools connected to the site."
      eyebrow="Terms of use"
      sections={[
        {
          title: "Acceptance of these terms",
          body: [
            "By accessing or using this website, you agree to use it lawfully and in a way that does not disrupt the reading experience, the site infrastructure, or the protected editorial environment.",
            "If you do not agree with these terms, you should stop using the site.",
          ],
        },
        {
          title: "Content ownership and rights",
          body: [
            "Unless a specific entry states otherwise, the site's written content, visual presentation, branding, editorial arrangement, and original media are part of the Explorer's Journal project and are protected by applicable intellectual property rules.",
            "Visitors may read, reference, and share links to public pages, but they should not republish, scrape, reproduce, or commercially reuse site content without permission from the project owner or the rights holder.",
          ],
        },
        {
          title: "Permitted use",
          body: [
            "You may browse the archives, read public entries, and navigate the site for personal, educational, editorial, or research-oriented use, provided that your actions remain lawful and respectful of the site and its content.",
            "You may not attempt to bypass security, interfere with admin authentication, upload malicious files, reverse engineer protected workflows, or use automated systems in a way that harms performance or availability.",
          ],
        },
        {
          title: "Admin access",
          body: [
            "The admin area is reserved for authorized editors only. Credentials, session cookies, uploaded assets, and publication tools may not be shared with unauthorized parties.",
            "Any attempt to gain access to the admin area without permission, or to misuse editorial functionality after access is granted, may result in revoked access and further action where appropriate.",
          ],
        },
        {
          title: "Accuracy and availability",
          body: [
            "The project aims to keep public content accurate and thoughtfully maintained, but the site is provided on an as-available basis. We cannot guarantee uninterrupted availability, permanent uptime, or that every page will remain unchanged over time.",
            "We may revise, remove, archive, or update entries, features, navigation, or visual systems as the editorial project evolves.",
          ],
        },
        {
          title: "Changes to these terms",
          body: [
            "These terms may be updated as the project grows, especially if new account features, commerce, submissions, community interactions, or external services are introduced.",
            "Continued use of the site after an update means the revised terms apply from the date they are published on this page.",
          ],
        },
      ]}
      title="Terms of Use"
      updatedLabel="Last updated: June 19, 2026"
    />
  );
}
