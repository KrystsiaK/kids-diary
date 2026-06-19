import Link from "next/link";

import { type SectionSlug, getSectionConfig } from "@/features/content/lib/sections";

export function EmptySectionState({ section }: { section: SectionSlug }) {
  const config = getSectionConfig(section);

  return (
    <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
      <h3 className="font-display text-3xl text-white">{config.emptyTitle}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-400">
        Create the first entry for {config.title.toLowerCase()} from the admin
        panel and it will appear here automatically.
      </p>
      <Link
        className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/10"
        href="/admin"
      >
        Open admin
      </Link>
    </div>
  );
}
