import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const anthropicCreate = vi.fn();
  const upsert = vi.fn();

  class MockAnthropic {
    messages = {
      create: anthropicCreate,
    };
  }

  return { MockAnthropic, anthropicCreate, upsert };
});

vi.mock("@anthropic-ai/sdk", () => ({
  default: mocks.MockAnthropic,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    entryTranslation: {
      upsert: mocks.upsert,
    },
  },
}));

describe("translate-entry integration", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = "test-key";
    mocks.upsert.mockImplementation((args) => Promise.resolve(args.update ?? args.create));
  });

  it("translates normal entry fields and stores READY status", async () => {
    mocks.anthropicCreate.mockResolvedValueOnce({
      content: [
        {
          type: "tool_use",
          input: {
            title: "Título",
            kicker: "Capítulo",
            excerpt: "Resumo",
            content: "Conteúdo",
          },
        },
      ],
    });

    const { translateEntryToLocale } = await import("@/features/content/lib/translate-entry");

    const result = await translateEntryToLocale(
      {
        id: "entry-1",
        title: "Title",
        kicker: "Chapter",
        excerpt: "Summary",
        content: "Content",
        customCss: "",
        section: "JOURNAL",
      },
      "pt",
    );

    expect(mocks.anthropicCreate).toHaveBeenCalledTimes(1);
    expect(mocks.upsert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        create: expect.objectContaining({ status: "PENDING" }),
      }),
    );
    expect(mocks.upsert).toHaveBeenLastCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          title: "Título",
          status: "READY",
        }),
      }),
    );
    expect(result).toMatchObject({ title: "Título", status: "READY" });
  });

  it("translates custom experiment text markers without asking the model to rewrite HTML", async () => {
    mocks.anthropicCreate.mockResolvedValueOnce({
      content: [
        {
          type: "tool_use",
          input: {
            title: "Experimento",
            kicker: "Capítulo",
            excerpt: "Resumo",
            contentTranslations: {
              "hero.title": "Olá mundo",
              "hero.body": "Texto do experimento",
            },
          },
        },
      ],
    });

    const { translateEntryToLocale } = await import("@/features/content/lib/translate-entry");

    await translateEntryToLocale(
      {
        id: "entry-2",
        title: "Experiment",
        kicker: "Chapter",
        excerpt: "Summary",
        content: `
          <section class="hero">
            <h1 data-i18n="hero.title">{Hello world}</h1>
            <p data-i18n="hero.body">{Experiment text}</p>
          </section>
        `,
        customCss: ".hero { display: grid; }",
        section: "EXPERIMENTS",
      },
      "pt",
    );

    const request = mocks.anthropicCreate.mock.calls[0]?.[0];
    expect(request.messages[0].content).toContain("contentTranslations");
    expect(request.messages[0].content).not.toContain("<section");

    expect(mocks.upsert).toHaveBeenLastCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          content: expect.stringContaining(">Olá mundo<"),
          status: "READY",
        }),
      }),
    );
  });

  it("marks translation as FAILED when the provider response is invalid", async () => {
    mocks.anthropicCreate.mockResolvedValueOnce({ content: [] });

    const { translateEntryToLocale } = await import("@/features/content/lib/translate-entry");

    const result = await translateEntryToLocale(
      {
        id: "entry-3",
        title: "Title",
        kicker: "Chapter",
        excerpt: "Summary",
        content: "Content",
        customCss: "",
        section: "JOURNAL",
      },
      "ru",
    );

    expect(result).toMatchObject({ status: "FAILED" });
    expect(mocks.upsert).toHaveBeenLastCalledWith(
      expect.objectContaining({
        update: { status: "FAILED" },
      }),
    );
  });

  it("marks custom experiment translation as FAILED when a data-i18n key is missed", async () => {
    mocks.anthropicCreate.mockResolvedValueOnce({
      content: [
        {
          type: "tool_use",
          input: {
            title: "Experimento",
            kicker: "Capítulo",
            excerpt: "Resumo",
            contentTranslations: {
              "hero.title": "Olá mundo",
            },
          },
        },
      ],
    });

    const { translateEntryToLocale } = await import("@/features/content/lib/translate-entry");

    const result = await translateEntryToLocale(
      {
        id: "entry-4",
        title: "Experiment",
        kicker: "Chapter",
        excerpt: "Summary",
        content: `
          <h1 data-i18n="hero.title">{Hello world}</h1>
          <p data-i18n="hero.body">{Missing body}</p>
        `,
        customCss: ".hero { color: red; }",
        section: "EXPERIMENTS",
      },
      "pt",
    );

    expect(result).toMatchObject({ status: "FAILED" });
  });

  it("marks translation as FAILED when ANTHROPIC_API_KEY is missing", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const { translateEntryToLocale } = await import("@/features/content/lib/translate-entry");

    const result = await translateEntryToLocale(
      {
        id: "entry-5",
        title: "Title",
        kicker: "Chapter",
        excerpt: "Summary",
        content: "Content",
        customCss: "",
        section: "JOURNAL",
      },
      "es",
    );

    expect(result).toMatchObject({ status: "FAILED" });
  });

  it("translates multiple locales sequentially", async () => {
    mocks.anthropicCreate
      .mockResolvedValueOnce({
        content: [
          {
            type: "tool_use",
            input: {
              title: "Título",
              kicker: "Capítulo",
              excerpt: "Resumo",
              content: "Conteúdo",
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        content: [
          {
            type: "tool_use",
            input: {
              title: "Tytuł",
              kicker: "Rozdział",
              excerpt: "Opis",
              content: "Treść",
            },
          },
        ],
      });

    const { translateEntryToLocales } = await import("@/features/content/lib/translate-entry");

    await translateEntryToLocales(
      {
        id: "entry-6",
        title: "Title",
        kicker: "Chapter",
        excerpt: "Summary",
        content: "Content",
        customCss: "",
        section: "JOURNAL",
      },
      ["pt", "pl"],
    );

    expect(mocks.anthropicCreate).toHaveBeenCalledTimes(2);
    expect(mocks.upsert).toHaveBeenCalledTimes(4);
  });
});
