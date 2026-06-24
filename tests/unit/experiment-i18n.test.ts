import { describe, expect, it } from "vitest";

import {
  applyExperimentI18nDictionary,
  extractExperimentI18nDictionary,
  hasExperimentI18nMarkers,
  unwrapExperimentI18nBraces,
} from "@/features/content/lib/experiment-i18n";

describe("experiment-i18n", () => {
  const html = `
    <section>
      <h1 class="hero" data-i18n="hero.title">{Welcome &amp; hello}</h1>
      <p data-i18n='hero.body'><strong>{This text is translated}</strong></p>
      <span>No marker</span>
    </section>
  `;

  it("extracts only explicitly marked brace-wrapped text", () => {
    expect(extractExperimentI18nDictionary(html)).toEqual({
      "hero.title": "Welcome & hello",
      "hero.body": "This text is translated",
    });
    expect(hasExperimentI18nMarkers(html)).toBe(true);
    expect(hasExperimentI18nMarkers("<h1>{No key}</h1>")).toBe(false);
  });

  it("applies translations without changing attributes or unmarked content", () => {
    const translated = applyExperimentI18nDictionary(html, {
      "hero.title": "Bem-vindo",
      "hero.body": "Texto traduzido",
    });

    expect(translated).toContain('class="hero" data-i18n="hero.title"');
    expect(translated).toContain(">Bem-vindo<");
    expect(translated).toContain(">Texto traduzido<");
    expect(translated).toContain("<span>No marker</span>");
  });

  it("escapes translated HTML and leaves missing keys untouched", () => {
    const translated = applyExperimentI18nDictionary(html, {
      "hero.title": "<script>alert(1)</script>",
    });

    expect(translated).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(translated).toContain("{This text is translated}");
  });

  it("unwraps authoring braces for display", () => {
    const displayHtml = unwrapExperimentI18nBraces(html);

    expect(displayHtml).toContain(">Welcome &amp; hello<");
    expect(displayHtml).toContain(">This text is translated<");
    expect(displayHtml).not.toContain("{Welcome");
  });

  it("leaves marked elements without brace-wrapped text unchanged", () => {
    const htmlWithoutBraces = `<h2 data-i18n="title">Plain title</h2>`;

    expect(extractExperimentI18nDictionary(htmlWithoutBraces)).toEqual({});
    expect(unwrapExperimentI18nBraces(htmlWithoutBraces)).toBe(htmlWithoutBraces);
    expect(applyExperimentI18nDictionary(htmlWithoutBraces, { title: "Translated" })).toContain(
      ">Translated<",
    );
  });
});
