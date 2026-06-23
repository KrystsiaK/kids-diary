import { CORE_TARGET_LOCALES, translateEntryToLocale } from "@/features/content/lib/translate-entry";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
  const origin = request.headers.get("origin");
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
  const requestHost = forwardedHost || request.headers.get("host");
  const originHost = origin ? new URL(origin).host : null;

  if (originHost && (!requestHost || originHost !== requestHost)) {
    return Response.json({ error: "Request origin was rejected." }, { status: 403 });
  }

  let body: { entryId?: unknown; locale?: unknown };

  try {
    body = await request.json();
  } catch {
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
