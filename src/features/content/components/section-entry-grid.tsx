import Image from "next/image";
import Link from "next/link";

import { formatShortDate } from "@/features/content/lib/formatters";
import type { ContentEntry, SectionSlug } from "@/features/content/lib/sections";
import { getEntryHref } from "@/features/content/lib/sections";

type SectionEntryGridProps = {
  entries: ContentEntry[];
  section: SectionSlug;
  variant?: "list" | "cards" | "compact";
};

export function SectionEntryGrid({
  entries,
  section,
  variant = "list",
}: SectionEntryGridProps) {
  if (entries.length === 0) {
    return null;
  }

  if (variant === "cards") {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {entries.map((entry, index) => (
          <article
            key={entry.id}
            className={`group relative flex min-h-[20rem] items-end overflow-hidden rounded-[2rem] border border-white/8 bg-black/20 ${
              index === 0 ? "lg:row-span-2 lg:min-h-[32rem]" : ""
            }`}
          >
            <Image
              alt={entry.title}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              src={entry.coverImage}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/85" />
            <div className="relative z-10 p-6 sm:p-8">
              <div className="text-xs uppercase tracking-[0.24em] text-stone-300">
                {entry.kicker}
              </div>
              <h3 className="mt-3 font-display text-3xl text-white sm:text-4xl">
                <Link href={getEntryHref(section, entry.slug)}>{entry.title}</Link>
              </h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-stone-200/85">
                {entry.excerpt}
              </p>
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-4">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"
          >
            <div className="overflow-hidden rounded-2xl">
            <Image
              alt={entry.title}
              className="size-14 object-cover"
              height={56}
              sizes="56px"
              src={entry.coverImage}
              width={56}
            />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
                {entry.kicker}
              </div>
              <h3 className="mt-1 text-lg font-semibold text-stone-100">
                <Link href={getEntryHref(section, entry.slug)}>{entry.title}</Link>
              </h3>
              <p className="mt-1 text-sm leading-6 text-stone-400">
                {entry.excerpt}
              </p>
            </div>
            <div className="text-stone-500">→</div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="grid gap-6 overflow-hidden rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.05] sm:p-6 lg:grid-cols-[320px_1fr]"
        >
          <div className="relative overflow-hidden rounded-[1.2rem]">
            <Image
              alt={entry.title}
              className="aspect-[4/3] h-full w-full object-cover"
              height={720}
              sizes="(min-width: 1024px) 320px, 100vw"
              src={entry.coverImage}
              width={960}
            />
            <div className="absolute left-4 top-4 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              {entry.kicker}
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6 rounded-[1.3rem] border border-white/8 bg-black/15 p-5">
            <div>
              <div className="mb-4 text-xs uppercase tracking-[0.2em] text-stone-500">
                {entry.readMinutes} min read · {formatShortDate(entry.publishedAt)}
              </div>
              <h3 className="font-display text-3xl text-white">
                <Link href={getEntryHref(section, entry.slug)}>{entry.title}</Link>
              </h3>
              <p className="mt-3 max-w-xl text-base leading-7 text-stone-400">
                {entry.excerpt}
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-white/8 pt-4 text-sm text-stone-300">
              <Link href={getEntryHref(section, entry.slug)}>Read entry</Link>
              <span aria-hidden="true">→</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
