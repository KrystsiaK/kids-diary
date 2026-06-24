import { describe, expect, it } from "vitest";

import {
  formatLongDate,
  formatRelativeAdminDate,
  formatShortDate,
} from "@/features/content/lib/formatters";

describe("formatters", () => {
  const date = new Date("2026-06-24T12:00:00.000Z");

  it("formats public dates with stable English labels", () => {
    expect(formatLongDate(date)).toBe("June 24, 2026");
    expect(formatShortDate(date)).toBe("Jun 24");
  });

  it("uses admin and publishing fallback labels for missing dates", () => {
    expect(formatLongDate(null)).toBe("Unpublished");
    expect(formatShortDate(null)).toBe("Draft");
    expect(formatRelativeAdminDate(null)).toBe("No updates yet");
  });

  it("formats admin dates with the year included", () => {
    expect(formatRelativeAdminDate(date)).toBe("Jun 24, 2026");
  });
});
