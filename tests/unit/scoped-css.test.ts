import { describe, expect, it } from "vitest";

import {
  buildScopedCustomCss,
  sanitizeCustomCss,
} from "@/features/content/lib/scoped-css";

describe("scoped-css", () => {
  it("removes unsafe CSS patterns and fixed positioning", () => {
    const css = `
      @import url("https://evil.example/x.css");
      .panel { position: fixed; color: red; background: url(javascript:alert(1)); }
      /* remove me */
    `;

    const sanitized = sanitizeCustomCss(css);

    expect(sanitized).not.toContain("@import");
    expect(sanitized).not.toMatch(/position\s*:\s*fixed/i);
    expect(sanitized).not.toContain("javascript:");
    expect(sanitized).not.toContain("remove me");
    expect(sanitized).toContain("color: red");
  });

  it("scopes normal selectors and rewrites global selectors", () => {
    const scoped = buildScopedCustomCss(
      `body { color: white; } .hero, .card[data-x="a,b"] { display: grid; }`,
      ".experiment-scope",
    );

    expect(scoped).toContain(".experiment-scope{color: white;}");
    expect(scoped).toContain(".experiment-scope .hero");
    expect(scoped).toContain('.experiment-scope .card[data-x="a,b"]');
  });

  it("scopes nested media rules and preserves keyframes", () => {
    const scoped = buildScopedCustomCss(
      `@media (min-width: 800px) { .hero { display: grid; } } @keyframes wave { from { opacity: 0; } to { opacity: 1; } }`,
      ".scope",
    );

    expect(scoped).toContain("@media (min-width: 800px){.scope .hero{display: grid;}");
    expect(scoped).toContain("@keyframes wave");
  });

  it("handles empty, already scoped, unsupported, and malformed rules safely", () => {
    expect(buildScopedCustomCss("", ".scope")).toBe("");
    expect(buildScopedCustomCss(".scope .hero { color: blue; }", ".scope")).toContain(
      ".scope .hero{color: blue;}",
    );
    expect(buildScopedCustomCss("@font-face { font-family: Evil; } .hero { color: red; }", ".scope")).toContain(
      ".scope .hero{color: red;}",
    );
    expect(buildScopedCustomCss(".broken { color: red;", ".scope")).toBe("");
  });

  it("matches braces while inside quoted strings", () => {
    const scoped = buildScopedCustomCss(
      `.card::before { content: "{ not a block }"; color: white; }`,
      ".scope",
    );

    expect(scoped).toContain('.scope .card::before{content: "{ not a block }"; color: white;}');
  });
});
