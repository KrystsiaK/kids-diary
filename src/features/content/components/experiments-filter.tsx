"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { ContentEntry } from "@/features/content/lib/sections";
import { getEntryHref } from "@/features/content/lib/sections";
import { Link } from "@/i18n/navigation";

type ExperimentsFilterProps = {
  entries: ContentEntry[];
};

export function ExperimentsFilter({ entries }: ExperimentsFilterProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        entries
          .map((entry) => entry.experimentCategory.trim())
          .filter(Boolean),
      ),
    ).sort((left, right) => left.localeCompare(right));
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesCategory =
        category === "all" || entry.experimentCategory === category;
      const searchableText = [
        entry.title,
        entry.kicker,
        entry.excerpt,
        entry.experimentCategory,
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, entries, query]);

  return (
    <div className="min-w-0 space-y-6">
      <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface-strong)] p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="min-w-0 space-y-2">
            <span className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
              Search experiments
            </span>
            <input
              className="w-full min-w-0 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--ring)]/50 focus:ring-2 focus:ring-[var(--ring)]/20"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, category, or idea…"
              type="search"
              value={query}
            />
          </label>

          <div className="text-sm text-[var(--muted)]">
            {filteredEntries.length} of {entries.length}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mt-4 flex max-w-full gap-2 overflow-x-auto pb-1">
            {["all", ...categories].map((item) => {
              const active = item === category;

              return (
                <button
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                      : "border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                  key={item}
                  onClick={() => setCategory(item)}
                  type="button"
                >
                  {item === "all" ? "All categories" : item}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {filteredEntries.length > 0 ? (
        <div className="grid min-w-0 gap-5 md:grid-cols-2">
          {filteredEntries.map((entry) => (
            <Link
              className="group min-w-0 overflow-hidden rounded-[1.8rem] border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-1 hover:border-[var(--ring)]/40"
              href={getEntryHref("experiments", entry.slug)}
              key={entry.id}
            >
              <Image
                alt={entry.title}
                className="aspect-[16/9] w-full object-cover"
                height={540}
                src={entry.coverImage}
                width={960}
              />
              <div className="space-y-3 p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  <span>{entry.kicker}</span>
                  {entry.experimentCategory && (
                    <span className="rounded-full border border-[var(--border)] px-2.5 py-1 normal-case tracking-normal">
                      {entry.experimentCategory}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-3xl leading-tight text-[var(--foreground)]">
                  {entry.title}
                </h3>
                <p className="text-sm leading-6 text-[var(--muted)]">
                  {entry.excerpt}
                </p>
                <div className="text-sm font-semibold text-[var(--foreground)] transition group-hover:text-[var(--accent)]">
                  Open experiment →
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center text-sm text-[var(--muted)]">
          No experiments match this search yet.
        </div>
      )}
    </div>
  );
}
