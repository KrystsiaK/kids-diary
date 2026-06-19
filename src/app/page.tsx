import type { Metadata } from "next";

import { MarketingPage } from "@/features/marketing/components/marketing-page";
import { createPageMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Home",
  description:
    "Explore the latest stories, visual realms, and experiments collected in Explorer's Journal.",
  pathname: "/",
  image: "/media/ImageWithFallback.png",
});

export default async function Home() {
  return <MarketingPage />;
}
