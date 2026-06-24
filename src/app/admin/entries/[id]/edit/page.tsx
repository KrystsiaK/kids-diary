import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateEntryForm } from "@/features/admin/components/create-entry-form";
import { requireAdminSession } from "@/features/admin/lib/admin-auth";
import type { EntryStatusValue } from "@/features/content/lib/sections";
import { BrandMark } from "@/shared/ui/brand-mark";
import { SiteShell } from "@/shared/ui/site-shell";
import { prisma } from "@/lib/prisma";

type EditEntryPageProps = {
  params: Promise<{ id: string }>;
};

function parseGalleryImages(value: string | null | undefined) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export default async function EditEntryPage({ params }: EditEntryPageProps) {
  await requireAdminSession();

  const { id } = await params;
  const entry = await prisma.entry.findUnique({
    where: { id },
  });

  if (!entry) {
    redirect("/admin?error=entry-not-found#content-pipeline");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0a0e14_0%,#0d1117_100%)] text-stone-100">
      <SiteShell className="py-8 sm:py-10">
        <div className="mb-6 flex min-w-0 flex-col gap-4 rounded-[2rem] border border-white/8 bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <BrandMark showTagline={false} size="md" />
            <div className="mt-4 text-xs uppercase tracking-[0.24em] text-stone-500">
              Edit entry
            </div>
            <h1 className="mt-2 truncate font-display text-4xl text-white sm:text-5xl">
              {entry.title}
            </h1>
          </div>
          <Link
            className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/10"
            href="/admin#content-pipeline"
          >
            Back to admin
          </Link>
        </div>

        <section className="min-w-0 rounded-[2rem] border border-white/8 bg-white/[0.04] p-5 sm:p-6">
          <CreateEntryForm
            entry={{
              id: entry.id,
              title: entry.title,
              slug: entry.slug,
              section: entry.section,
              kicker: entry.kicker,
              excerpt: entry.excerpt,
              content: entry.content,
              customCss: entry.customCss ?? "",
              experimentCategory: entry.experimentCategory ?? "",
              coverImage: entry.coverImage,
              galleryImages: parseGalleryImages(entry.galleryImages),
              readMinutes: entry.readMinutes,
              status: entry.status as EntryStatusValue,
              featured: entry.featured,
            }}
            mode="edit"
          />
        </section>
      </SiteShell>
    </div>
  );
}
