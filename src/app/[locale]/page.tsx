import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { MarketingPage } from "@/features/marketing/components/marketing-page";
import { createPageMetadata } from "@/shared/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Home",
  description:
    "Explore the latest stories, visual realms, and experiments collected in Explorer's Journal.",
  pathname: "/",
  image: "/media/ImageWithFallback.png",
});

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MarketingPage />;
}
