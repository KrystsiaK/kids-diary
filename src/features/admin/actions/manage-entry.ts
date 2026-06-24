"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { requireAdminSession } from "@/features/admin/lib/admin-auth";
import {
  CORE_TARGET_LOCALES,
  translateEntryToLocale,
  translateEntryToLocales,
} from "@/features/content/lib/translate-entry";
import type { CreateEntryState } from "@/features/admin/actions/create-entry";
import {
  type EntryStatusValue,
  type EntrySectionValue,
  isSectionSlug,
  sectionConfig,
} from "@/features/content/lib/sections";
import { prepareRichHtml } from "@/features/content/lib/rich-content";
import { sanitizeCustomCss } from "@/features/content/lib/scoped-css";
import { prisma } from "@/lib/prisma";

const ENTRY_STATUSES = new Set<EntryStatusValue>(["DRAFT", "PUBLISHED"]);
const MAX_GALLERY_IMAGES = 24;

function actionError(message: string): CreateEntryState {
  return { status: "error", message };
}

function revalidateEntryPaths(section: string, slug: string) {
  const sectionSlug = section.toLowerCase();

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/journal");
  revalidatePath("/realms");
  revalidatePath("/experiments");
  revalidatePath(`/${sectionSlug}/${slug}`);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function estimateReadMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.ceil(words / 180));
}

function getFallbackCoverImage(section: EntrySectionValue) {
  switch (section) {
    case "JOURNAL":
      return "/media/journal-image-1.png";
    case "REALMS":
      return "/media/realms-image-1.png";
    case "EXPERIMENTS":
      return "/media/realms-image-4.png";
  }
}

function isValidStoredImageUrl(value: string) {
  if (value.includes("..") || value.includes("\\")) return false;
  if (value.startsWith("/uploads/")) return true;
  if (value.startsWith("/api/media/")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function updateEntryStatusAction(formData: FormData) {
  await requireAdminSession();

  const entryId = String(formData.get("entryId") ?? "");
  const nextStatus = String(
    formData.get("nextStatus") ?? "",
  ) as EntryStatusValue;

  if (!ENTRY_STATUSES.has(nextStatus)) {
    redirect("/admin?error=invalid-status");
  }

  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    select: {
      id: true,
      slug: true,
      section: true,
      publishedAt: true,
      title: true,
      kicker: true,
      excerpt: true,
      content: true,
      customCss: true,
    },
  });

  if (!entry) {
    redirect("/admin?error=entry-not-found");
  }

  const wasAlreadyPublished = Boolean(entry.publishedAt);

  await prisma.entry.update({
    where: { id: entry.id },
    data: {
      status: nextStatus,
      publishedAt:
        nextStatus === "PUBLISHED" ? (entry.publishedAt ?? new Date()) : null,
    },
  });

  if (nextStatus === "PUBLISHED" && !wasAlreadyPublished) {
    after(() => translateEntryToLocales(entry, CORE_TARGET_LOCALES));
  }

  revalidateEntryPaths(entry.section, entry.slug);
  redirect("/admin?updated=1#content-pipeline");
}

export async function retryEntryTranslationAction(formData: FormData) {
  await requireAdminSession();

  const entryId = String(formData.get("entryId") ?? "");
  const locale = String(formData.get("locale") ?? "");

  if (!CORE_TARGET_LOCALES.includes(locale as (typeof CORE_TARGET_LOCALES)[number])) {
    redirect("/admin?error=invalid-locale");
  }

  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    select: {
      id: true,
      slug: true,
      section: true,
      title: true,
      kicker: true,
      excerpt: true,
      content: true,
      customCss: true,
    },
  });

  if (!entry) {
    redirect("/admin?error=entry-not-found");
  }

  await translateEntryToLocale(entry, locale);

  revalidateEntryPaths(entry.section, entry.slug);
  redirect("/admin?updated=1#content-pipeline");
}

export async function updateEntryAction(
  _previousState: CreateEntryState,
  formData: FormData,
): Promise<CreateEntryState> {
  await requireAdminSession();

  const entryId = String(formData.get("entryId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const sectionSlug = String(formData.get("section") ?? "").trim();
  const kicker = String(formData.get("kicker") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = prepareRichHtml(String(formData.get("content") ?? "").trim());
  const status = String(formData.get("status") ?? "DRAFT").trim() as EntryStatusValue;
  const featured = formData.get("featured") === "on";
  const readMinutesInput = Number(formData.get("readMinutes") ?? 0);
  const coverIndexInput = Number(formData.get("coverIndex") ?? 0);
  const savedGalleryImages = formData
    .getAll("galleryImageUrls")
    .map((item) => String(item).trim())
    .filter(Boolean);
  const slug = slugify(String(formData.get("slug") ?? "") || title);

  if (
    !entryId ||
    !title ||
    !kicker ||
    !excerpt ||
    !content ||
    !slug ||
    !isSectionSlug(sectionSlug) ||
    !ENTRY_STATUSES.has(status)
  ) {
    return actionError("Fill in every required field before saving the entry.");
  }

  if (savedGalleryImages.length > MAX_GALLERY_IMAGES) {
    return actionError(`You can upload up to ${MAX_GALLERY_IMAGES} images per entry.`);
  }

  if (!savedGalleryImages.every(isValidStoredImageUrl)) {
    return actionError("One or more uploaded image references are invalid.");
  }

  let current: {
    id: string;
    slug: string;
    section: string;
    publishedAt: Date | null;
  } | null;

  try {
    current = await prisma.entry.findUnique({
      where: { id: entryId },
      select: { id: true, slug: true, section: true, publishedAt: true },
    });
  } catch (error) {
    console.error("Failed to load entry before update.", error);
    return actionError("The database is unavailable. Wait a moment and try again.");
  }

  if (!current) {
    return actionError("That entry no longer exists. Refresh the admin page and try again.");
  }

  let existingSlug: { id: string } | null;

  try {
    existingSlug = await prisma.entry.findFirst({
      where: { slug, NOT: { id: entryId } },
      select: { id: true },
    });
  } catch (error) {
    console.error("Failed to check entry slug before update.", error);
    return actionError("The database is unavailable. Wait a moment and try again.");
  }

  if (existingSlug) {
    return actionError("That URL slug already exists. Change the title or slug.");
  }

  const section = sectionConfig[sectionSlug].dbValue;
  const customCss =
    section === "EXPERIMENTS"
      ? sanitizeCustomCss(String(formData.get("customCss") ?? ""))
      : "";
  const experimentCategory =
    section === "EXPERIMENTS"
      ? String(formData.get("experimentCategory") ?? "").trim().slice(0, 80)
      : "";
  const safeCoverIndex =
    Number.isFinite(coverIndexInput) &&
    coverIndexInput >= 0 &&
    coverIndexInput < savedGalleryImages.length
      ? coverIndexInput
      : 0;
  const resolvedCoverImage =
    savedGalleryImages[safeCoverIndex] ?? getFallbackCoverImage(section);
  const carouselImages = savedGalleryImages.filter(
    (_image, index) => index !== safeCoverIndex,
  );

  let updated;

  try {
    updated = await prisma.entry.update({
      where: { id: entryId },
      data: {
        title,
        slug,
        kicker,
        excerpt,
        content,
        customCss,
        experimentCategory,
        section,
        status,
        featured,
        coverImage: resolvedCoverImage,
        galleryImages: JSON.stringify(carouselImages),
        readMinutes:
          Number.isFinite(readMinutesInput) && readMinutesInput > 0
            ? readMinutesInput
            : estimateReadMinutes(content),
        publishedAt:
          status === "PUBLISHED" ? (current.publishedAt ?? new Date()) : null,
      },
    });
  } catch (error) {
    console.error("Failed to update an entry.", error);
    return actionError("The entry could not be saved. Nothing changed; try again.");
  }

  if (status === "PUBLISHED") {
    after(() => translateEntryToLocales(updated, CORE_TARGET_LOCALES));
  }

  revalidateEntryPaths(current.section, current.slug);
  revalidateEntryPaths(updated.section, updated.slug);
  redirect("/admin?updated=1#content-pipeline");
}

export async function deleteEntryAction(formData: FormData) {
  await requireAdminSession();

  const entryId = String(formData.get("entryId") ?? "");

  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    select: {
      id: true,
      slug: true,
      section: true,
    },
  });

  if (!entry) {
    redirect("/admin?error=entry-not-found");
  }

  await prisma.entry.delete({ where: { id: entry.id } });

  revalidateEntryPaths(entry.section, entry.slug);
  redirect("/admin?deleted=1#content-pipeline");
}
