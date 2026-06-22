"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/features/admin/lib/admin-auth";
import {
  type EntrySectionValue,
  type EntryStatusValue,
  isSectionSlug,
  sectionConfig,
} from "@/features/content/lib/sections";
import { prisma } from "@/lib/prisma";

const MAX_GALLERY_IMAGES = 24;

export type CreateEntryState = {
  status: "idle" | "error";
  message: string;
};

function actionError(message: string): CreateEntryState {
  return { status: "error", message };
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
  return (
    value.startsWith("/api/media/uploads/") &&
    !value.includes("..") &&
    !value.includes("\\")
  );
}

export async function createEntryAction(
  _previousState: CreateEntryState,
  formData: FormData,
): Promise<CreateEntryState> {
  await requireAdminSession();

  const title = String(formData.get("title") ?? "").trim();
  const sectionSlug = String(formData.get("section") ?? "").trim();
  const kicker = String(formData.get("kicker") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const status = String(formData.get("status") ?? "DRAFT").trim() as EntryStatusValue;
  const featured = formData.get("featured") === "on";
  const readMinutesInput = Number(formData.get("readMinutes") ?? 0);
  const coverIndexInput = Number(formData.get("coverIndex") ?? 0);
  const savedGalleryImages = formData
    .getAll("galleryImageUrls")
    .map((item) => String(item).trim())
    .filter(Boolean);

  if (!title || !kicker || !excerpt || !content || !isSectionSlug(sectionSlug)) {
    return actionError("Fill in every required field before saving the entry.");
  }

  if (savedGalleryImages.length > MAX_GALLERY_IMAGES) {
    return actionError("You can upload up to 24 images per entry.");
  }

  if (!savedGalleryImages.every(isValidStoredImageUrl)) {
    return actionError("One or more uploaded image references are invalid.");
  }

  const section = sectionConfig[sectionSlug].dbValue;
  const slug = slugify(String(formData.get("slug") ?? "") || title);

  if (!slug) {
    return actionError("Enter a title or provide a valid URL slug.");
  }

  let existing: { id: string } | null;

  try {
    existing = await prisma.entry.findUnique({
      where: { slug },
      select: { id: true },
    });
  } catch (error) {
    console.error("Failed to check the entry slug.", error);
    return actionError("The database is unavailable. Wait a moment and try again.");
  }

  if (existing) {
    return actionError("That URL slug already exists. Change the title or slug.");
  }

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

  try {
    await prisma.entry.create({
      data: {
        title,
        slug,
        kicker,
        excerpt,
        content,
        coverImage: resolvedCoverImage,
        galleryImages: JSON.stringify(carouselImages),
        readMinutes:
          Number.isFinite(readMinutesInput) && readMinutesInput > 0
            ? readMinutesInput
            : estimateReadMinutes(content),
        featured,
        section,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });
  } catch (error) {
    console.error("Failed to create an entry.", error);
    return actionError("The entry could not be saved. Nothing was published; try again.");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/journal");
  revalidatePath("/realms");
  revalidatePath("/experiments");
  revalidatePath(`/${sectionSlug}/${slug}`);

  redirect("/admin?created=1");
}
