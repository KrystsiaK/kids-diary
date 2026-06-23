import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { MarketingPage } from "@/features/marketing/components/marketing-page";
import { createPageMetadata } from "@/shared/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return createPageMetadata({
    title: "Home",
    description:
      "Explore the latest stories, visual realms, and experiments collected in Explorer's Journal.",
    pathname: "/",
    locale,
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MarketingPage />;
}
