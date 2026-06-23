import Anthropic from "@anthropic-ai/sdk";

import type { ContentEntry } from "@/features/content/lib/sections";
import { prisma } from "@/lib/prisma";

export const CORE_TARGET_LOCALES = ["ru", "pt", "pl", "es"] as const;

const LOCALE_NAMES: Record<string, string> = {
  ru: "Russian",
  pt: "Portuguese",
  pl: "Polish",
  es: "Spanish",
};

const TRANSLATION_MODEL = "claude-sonnet-4-6";

let anthropicClient: Anthropic | null = null;

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  anthropicClient ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropicClient;
}

type TranslatedFields = {
  title: string;
  kicker: string;
  excerpt: string;
  content: string;
};

async function translateFields(
  fields: TranslatedFields,
  targetLocale: string,
): Promise<TranslatedFields> {
  const client = getAnthropicClient();
  const languageName = LOCALE_NAMES[targetLocale] ?? targetLocale;

  const response = await client.messages.create({
    model: TRANSLATION_MODEL,
    max_tokens: 4096,
    system:
      `You are a professional literary translator working on a personal exploration journal ` +
      `called "Explorer's Journal". Translate the given article fields into ${languageName}. ` +
      `Preserve tone, paragraph breaks (separated by blank lines), and any emphasis. Do not ` +
      `summarize, shorten, or add commentary — translate faithfully and idiomatically, as a ` +
      `native ${languageName} speaker would write it.`,
    messages: [
      {
        role: "user",
        content: JSON.stringify(fields),
      },
    ],
    tools: [
      {
        name: "submit_translation",
        description: "Submit the translated article fields.",
        input_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            kicker: { type: "string" },
            excerpt: { type: "string" },
            content: { type: "string" },
          },
          required: ["title", "kicker", "excerpt", "content"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_translation" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");

  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Translation response did not include the expected tool call.");
  }

  return toolUse.input as TranslatedFields;
}

export async function translateEntryToLocale(
  entry: Pick<ContentEntry, "id" | "title" | "kicker" | "excerpt" | "content">,
  locale: string,
) {
  try {
    await prisma.entryTranslation.upsert({
      where: { entryId_locale: { entryId: entry.id, locale } },
      create: {
        entryId: entry.id,
        locale,
        title: entry.title,
        kicker: entry.kicker,
        excerpt: entry.excerpt,
        content: entry.content,
        status: "PENDING",
      },
      update: { status: "PENDING" },
    });

    const translated = await translateFields(
      {
        title: entry.title,
        kicker: entry.kicker,
        excerpt: entry.excerpt,
        content: entry.content,
      },
      locale,
    );

    return await prisma.entryTranslation.upsert({
      where: { entryId_locale: { entryId: entry.id, locale } },
      create: { entryId: entry.id, locale, ...translated, status: "READY" },
      update: { ...translated, status: "READY" },
    });
  } catch (error) {
    console.error(`Failed to translate entry ${entry.id} into ${locale}.`, error);

    return prisma.entryTranslation.upsert({
      where: { entryId_locale: { entryId: entry.id, locale } },
      create: {
        entryId: entry.id,
        locale,
        title: entry.title,
        kicker: entry.kicker,
        excerpt: entry.excerpt,
        content: entry.content,
        status: "FAILED",
      },
      update: { status: "FAILED" },
    });
  }
}

export async function translateEntryToLocales(
  entry: Pick<ContentEntry, "id" | "title" | "kicker" | "excerpt" | "content">,
  locales: readonly string[],
) {
  for (const locale of locales) {
    await translateEntryToLocale(entry, locale);
  }
}
