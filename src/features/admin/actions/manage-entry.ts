"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/features/admin/lib/admin-auth";
import type { EntryStatusValue } from "@/features/content/lib/sections";
import { prisma } from "@/lib/prisma";

const ENTRY_STATUSES = new Set<EntryStatusValue>(["DRAFT", "PUBLISHED"]);

function revalidateEntryPaths(section: string, slug: string) {
  const sectionSlug = section.toLowerCase();

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/journal");
  revalidatePath("/realms");
  revalidatePath("/experiments");
  revalidatePath(`/${sectionSlug}/${slug}`);
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
    },
  });

  if (!entry) {
    redirect("/admin?error=entry-not-found");
  }

  await prisma.entry.update({
    where: { id: entry.id },
    data: {
      status: nextStatus,
      publishedAt:
        nextStatus === "PUBLISHED" ? (entry.publishedAt ?? new Date()) : null,
    },
  });

  revalidateEntryPaths(entry.section, entry.slug);
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
