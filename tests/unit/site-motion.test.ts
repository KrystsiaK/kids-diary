import { afterEach, describe, expect, it, vi } from "vitest";

import { getSiteUrl, siteConfig } from "@/shared/config/site";
import { fadeUp, staggerChildren, viewportOnce } from "@/shared/lib/motion";

describe("site config and motion presets", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("normalizes configured site URLs and falls back to localhost", () => {
    vi.unstubAllEnvs();
    expect(getSiteUrl()).toBe("http://localhost:3000");

    vi.stubEnv("SITE_URL", "https://site.test/");
    expect(getSiteUrl()).toBe("https://site.test");

    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://public.test/");
    expect(getSiteUrl()).toBe("https://public.test");
  });

  it("exposes the expected public site metadata", () => {
    expect(siteConfig).toMatchObject({
      name: "Explorer's Journal",
      shortName: "Explorer's Journal",
      ogImage: "/opengraph-image",
    });
    expect(siteConfig.description).toContain("explorer archive");
  });

  it("keeps shared animation presets stable", () => {
    expect(viewportOnce).toEqual({ once: true, amount: 0.2 });
    expect(fadeUp.visible).toMatchObject({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    });
    expect(staggerChildren.visible).toEqual({
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.08,
      },
    });
  });
});
