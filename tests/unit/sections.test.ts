import { describe, expect, it } from "vitest";

import {
  formatSectionLabel,
  getEntryHref,
  getSectionConfig,
  isSectionSlug,
  sectionSlugs,
} from "@/features/content/lib/sections";

describe("sections", () => {
  it("identifies supported section slugs", () => {
    expect(sectionSlugs).toEqual(["journal", "experiments", "realms"]);
    expect(isSectionSlug("journal")).toBe(true);
    expect(isSectionSlug("unknown")).toBe(false);
  });

  it("returns section config and entry hrefs", () => {
    expect(getSectionConfig("experiments")).toMatchObject({
      dbValue: "EXPERIMENTS",
      title: "Experiments",
    });
    expect(getEntryHref("journal", "my-story")).toBe("/journal/my-story");
  });

  it("formats database section labels", () => {
    expect(formatSectionLabel("JOURNAL")).toBe("Journal");
    expect(formatSectionLabel("EXPERIMENTS")).toBe("Experiments");
  });
});
