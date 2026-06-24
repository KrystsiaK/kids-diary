import { describe, expect, it } from "vitest";

import {
  prepareRichHtml,
  sanitizeRichHtml,
  stripDocumentShell,
} from "@/features/content/lib/rich-content";

describe("rich-content", () => {
  it("removes document shell and dangerous tags", () => {
    const html = `<!doctype html>
      <html><head><script>alert(1)</script></head>
      <body><h1>Title</h1><script>alert(2)</script></body></html>`;

    expect(stripDocumentShell(html)).toContain("<h1>Title</h1>");
    expect(prepareRichHtml(html)).toBe("<h1>Title</h1>");
  });

  it("keeps safe rich HTML and normalizes links", () => {
    const sanitized = sanitizeRichHtml(
      `<p class="lead">Hello <a href="https://example.com">site</a></p>`,
    );

    expect(sanitized).toContain('class="lead"');
    expect(sanitized).toContain('href="https://example.com"');
    expect(sanitized).toContain('rel="noopener noreferrer"');
    expect(sanitized).toContain('target="_blank"');
  });

  it("blocks unsafe image schemes and event attributes", () => {
    const sanitized = sanitizeRichHtml(
      `<img src="javascript:alert(1)" onerror="alert(2)" alt="x"><p onclick="x()">Text</p>`,
    );

    expect(sanitized).not.toContain("javascript:");
    expect(sanitized).not.toContain("onerror");
    expect(sanitized).not.toContain("onclick");
    expect(sanitized).toContain("<p>Text</p>");
  });
});
