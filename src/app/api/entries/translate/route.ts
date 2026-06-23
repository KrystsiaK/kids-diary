import { CORE_TARGET_LOCALES, translateEntryToLocale } from "@/features/content/lib/translate-entry";
import {
  consumeGlobalDailyLimit,
  consumeRateLimit,
  getClientIp,
  readJsonBodyWithLimit,
  RequestBodyError,
  requireSameOriginRequest,
} from "@/lib/request-security";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_TRANSLATE_BODY_BYTES = 4 * 1024;
const TRANSLATE_WINDOW_MS = 10 * 60 * 1000;
const TRANSLATE_WINDOW_LIMIT = 12;
const TRANSLATE_DAILY_LIMIT = 50;
const GLOBAL_DAILY_TRANSLATION_LIMIT = 250;
const LOCALE_PATTERN = /^[a-z]{2,3}(-[A-Z]{2})?$/;

function isValidLocale(locale: string) {
  if (!LOCALE_PATTERN.test(locale)) {
    return false;
  }

  try {
    Intl.getCanonicalLocales(locale);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const originCheck = requireSameOriginRequest(request);
  if (!originCheck.ok) {
    return Response.json({ error: originCheck.error }, { status: originCheck.status });
  }

  const ip = getClientIp(request);
  if (
    !consumeRateLimit(`translate:${ip}`, {
      windowMs: TRANSLATE_WINDOW_MS,
      windowLimit: TRANSLATE_WINDOW_LIMIT,
      dailyLimit: TRANSLATE_DAILY_LIMIT,
    })
  ) {
    return Response.json({ error: "Too many translation requests." }, { status: 429 });
  }

  let body: { entryId?: unknown; locale?: unknown };

  try {
    body = await readJsonBodyWithLimit(request, MAX_TRANSLATE_BODY_BYTES);
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const entryId = typeof body.entryId === "string" ? body.entryId : "";
  const locale = typeof body.locale === "string" ? body.locale : "";

  if (!entryId || !locale || !isValidLocale(locale)) {
    return Response.json({ error: "A valid entryId and locale are required." }, { status: 400 });
  }

  if (locale === "en" || (CORE_TARGET_LOCALES as readonly string[]).includes(locale)) {
    return Response.json(
      { error: "This locale is already served through the regular site routes." },
      { status: 400 },
    );
  }

  const cached = await prisma.entryTranslation.findFirst({
    where: { entryId, locale, status: "READY" },
    select: { title: true, kicker: true, excerpt: true, content: true },
  });

  if (cached) {
    return Response.json(cached);
  }

  const entry = await prisma.entry.findFirst({
    where: { id: entryId, status: "PUBLISHED" },
    select: { id: true, title: true, kicker: true, excerpt: true, content: true },
  });

  if (!entry) {
    return Response.json({ error: "Entry not found." }, { status: 404 });
  }

  if (!consumeGlobalDailyLimit("entry-translation-llm-calls", GLOBAL_DAILY_TRANSLATION_LIMIT)) {
    return Response.json(
      { error: "Translation is temporarily unavailable. Try again later." },
      { status: 429 },
    );
  }

  const translation = await translateEntryToLocale(entry, locale);

  if (translation.status !== "READY") {
    return Response.json({ error: "Translation is not available right now." }, { status: 502 });
  }

  return Response.json({
    title: translation.title,
    kicker: translation.kicker,
    excerpt: translation.excerpt,
    content: translation.content,
  });
}
