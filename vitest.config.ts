import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary", "lcov"],
      reportsDirectory: "./coverage",
      include: [
        "src/features/content/lib/experiment-i18n.ts",
        "src/features/content/lib/rich-content.ts",
        "src/features/content/lib/scoped-css.ts",
        "src/features/content/lib/sections.ts",
        "src/features/content/lib/formatters.ts",
        "src/lib/request-security.ts",
        "src/lib/storage.ts",
        "src/lib/uploads.ts",
        "src/shared/config/site.ts",
        "src/shared/lib/motion.ts",
        "src/shared/lib/seo.ts",
        "src/features/content/lib/translate-entry.ts",
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
    alias: {
      "@": path.resolve(__dirname, "src"),
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
});
