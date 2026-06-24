import { describe, expect, it, vi } from "vitest";

describe("uploads", () => {
  it("normalizes upload subdirectories into safe public paths", async () => {
    vi.stubEnv("UPLOADS_SUBDIR", " //Kid Photos///2026!!/ ");

    const { getUploadsConfig } = await import("@/lib/uploads");
    const config = getUploadsConfig();

    expect(config.publicBasePath).toBe("/KidPhotos/2026");
    expect(config.uploadsDir).toContain("/public/KidPhotos/2026");

    vi.unstubAllEnvs();
  });

  it("falls back to /uploads when no upload subdirectory is configured", async () => {
    vi.unstubAllEnvs();
    vi.resetModules();

    const { getUploadsConfig } = await import("@/lib/uploads");

    expect(getUploadsConfig().publicBasePath).toBe("/uploads");
  });
});
