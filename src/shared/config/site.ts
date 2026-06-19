export const siteConfig = {
  name: "Explorer's Journal",
  shortName: "Explorer's Journal",
  description:
    "A richly crafted explorer archive of journals, realms, and experiments, with an editorial control room for publishing new stories.",
  ogImage: "/media/ImageWithFallback.png",
};

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "http://localhost:3000";

  return configuredUrl.endsWith("/")
    ? configuredUrl.slice(0, -1)
    : configuredUrl;
}
