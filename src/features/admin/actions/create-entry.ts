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
import { saveUploadedImage } from "@/lib/storage";

const MAX_GALLERY_IMAGES = 24;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

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

function isValidUpload(file: File) {
  return ALLOWED_IMAGE_TYPES.has(file.type);
}

async function saveUploadedGallery(files: File[]) {
  const saved = await Promise.allSettled(files.map((file) => saveUploadedImage(file)));
  const failed = saved.some((r) => r.status === "rejected");
  if (failed) {
    redirect("/admin?error=invalid-image");
  }
  return (saved as PromiseFulfilledResult<string | null>[])
    .map((r) => r.value)
    .filter((item): item is string => Boolean(item));
}

export async function createEntryAction(formData: FormData) {
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
  const galleryUploads = formData
    .getAll("galleryUploads")
    .filter((item): item is File => item instanceof File && item.size > 0);

  if (!title || !kicker || !excerpt || !content || !isSectionSlug(sectionSlug)) {
    redirect("/admin?error=missing-fields");
  }

  if (galleryUploads.length > MAX_GALLERY_IMAGES) {
    redirect("/admin?error=too-many-images");
  }

  if (!galleryUploads.every(isValidUpload)) {
    redirect("/admin?error=invalid-image");
  }

  const section = sectionConfig[sectionSlug].dbValue;
  const slug = slugify(String(formData.get("slug") ?? "") || title);

  if (!slug) {
    redirect("/admin?error=invalid-slug");
  }

  const existing = await prisma.entry.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existing) {
    redirect("/admin?error=slug-exists");
  }

  const savedGalleryImages = await saveUploadedGallery(galleryUploads);
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

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/journal");
  revalidatePath("/realms");
  revalidatePath("/experiments");
  revalidatePath(`/${sectionSlug}/${slug}`);

  redirect("/admin?created=1");
}
