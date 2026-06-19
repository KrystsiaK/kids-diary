import Link from "next/link";

import { logoutAction } from "@/features/admin/actions/auth";
import { CreateEntryForm } from "@/features/admin/components/create-entry-form";
import { formatRelativeAdminDate } from "@/features/content/lib/formatters";
import { getAdminEntries, getAdminMetrics } from "@/features/content/lib/content-repository";
import { adminSidebar } from "@/shared/config/site-content";
import { EyeIcon, OrbitIcon, SparkIcon } from "@/shared/icons/site-icons";
import { BrandMark } from "@/shared/ui/brand-mark";
import { RevealGroup, RevealItem } from "@/shared/ui/reveal";
import { SiteShell } from "@/shared/ui/site-shell";

type AdminDashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const params = (await searchParams) ?? {};
  const metrics = await getAdminMetrics();
  const entries = await getAdminEntries();
  const created = params.created === "1";
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0a0e14_0%,#0d1117_100%)] text-stone-100">
      <SiteShell className="py-8 sm:py-10">
        <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
          <aside className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-3 border-b border-white/8 pb-5">
              <div>
                <div className="flex items-center gap-3">
                  <BrandMark showTagline={false} size="md" />
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.22em] text-stone-500">
                  Admin atlas
                </div>
              </div>
            </div>

            <nav aria-label="Admin sections" className="mt-6 space-y-2">
              {adminSidebar.map((item, index) => (
                <a
                  key={item.label}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition ${
                    index === 0
                      ? "bg-white/10 text-white"
                      : "text-stone-400 hover:bg-white/6 hover:text-white"
                  }`}
                  href={item.href}
                >
                  <span>{item.label}</span>
                  <span className="text-stone-600">0{index + 1}</span>
                </a>
              ))}
            </nav>

            <div className="mt-8 rounded-[1.6rem] border border-white/8 bg-black/20 p-4">
              <div className="mb-2 text-xs uppercase tracking-[0.22em] text-stone-500">
                Quick handoff
              </div>
              <p className="text-sm leading-6 text-stone-300">
                Share an update with the editorial team or jump back to the public site.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
                  href="/"
                >
                  View site
                </Link>
                <form action={logoutAction}>
                  <button
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-stone-300 transition hover:bg-white/8"
                    type="submit"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </aside>

          <RevealGroup className="space-y-6">
            <RevealItem
              className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)] sm:p-8"
              id="overview"
            >
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.72rem] uppercase tracking-[0.24em] text-stone-300">
                    <SparkIcon className="size-4 text-[var(--sand)]" />
                    Live control room
                  </div>
                  <h1 className="font-display text-5xl leading-none text-white sm:text-6xl">
                    Publish the archive
                    <span className="block text-[var(--accent)]">without losing its magic</span>
                  </h1>
                  <p className="mt-4 max-w-xl text-base leading-7 text-stone-400 sm:text-lg">
                    This admin dashboard keeps editorial rhythm, media quality,
                    and audience signals in one place while preserving the tone
                    of the explorer brand.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                    <div className="mb-4 flex items-center justify-between text-stone-300">
                      <span className="text-[var(--secondary)]">
                        <SparkIcon className="size-5" />
                      </span>
                      <span className="text-xs uppercase tracking-[0.22em] text-stone-600">
                        Highlight
                      </span>
                    </div>
                    <div className="text-sm text-stone-400">Content cadence</div>
                    <div className="mt-2 font-display text-4xl text-white">
                      {metrics.total} items
                    </div>
                    <p className="mt-3 text-sm leading-6 text-stone-400">
                      One content model now powers the homepage, archives, and
                      individual entry pages.
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                    <div className="mb-4 flex items-center justify-between text-stone-300">
                      <span className="text-[var(--secondary)]">
                        <EyeIcon className="size-5" />
                      </span>
                      <span className="text-xs uppercase tracking-[0.22em] text-stone-600">
                        Highlight
                      </span>
                    </div>
                    <div className="text-sm text-stone-400">Latest update</div>
                    <div className="mt-2 font-display text-4xl text-white">
                      {formatRelativeAdminDate(metrics.latestUpdated)}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-stone-400">
                      Freshly edited content is ready to be reviewed or published.
                    </p>
                  </div>
                </div>
              </div>
            </RevealItem>

            {(created || error) && (
              <RevealItem
                className={`rounded-[1.4rem] border px-5 py-4 text-sm ${
                  created
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                    : "border-rose-500/20 bg-rose-500/10 text-rose-100"
                }`}
              >
                {created
                  ? "Entry created successfully. Published content is now live on its section page and homepage feeds."
                  : error === "slug-exists"
                    ? "That slug already exists. Change the title or provide a unique slug."
                    : error === "invalid-image"
                      ? "Images must be JPG, PNG, WebP, GIF, or AVIF and each file must stay under 8 MB."
                      : error === "too-many-images"
                        ? "Upload up to 24 gallery images per entry."
                    : "Please fill in all required fields before creating an entry."}
              </RevealItem>
            )}

            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {[
                {
                  label: "Published entries",
                  value: String(metrics.published),
                  detail: "Visible across the public site",
                },
                {
                  label: "Draft entries",
                  value: String(metrics.drafts),
                  detail: "Waiting for editorial review",
                },
                {
                  label: "Featured entries",
                  value: String(metrics.featured),
                  detail: "Highlighted in home and archives",
                },
                {
                  label: "Total entries",
                  value: String(metrics.total),
                  detail: "Stored in the database",
                },
              ].map((metric) => (
                <RevealItem
                  key={metric.label}
                  className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5"
                >
                  <div className="text-sm text-stone-400">{metric.label}</div>
                  <div className="mt-3 font-display text-5xl text-white">
                    {metric.value}
                  </div>
                  <div className="mt-3 text-sm text-stone-500">{metric.detail}</div>
                </RevealItem>
              ))}
            </div>

            <div className="grid gap-6 2xl:grid-cols-[1.25fr_0.75fr]">
              <RevealItem
                className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-6"
                id="content-pipeline"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
                      Editorial board
                    </div>
                    <h2 className="mt-2 font-display text-3xl text-white">
                      Content pipeline
                    </h2>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-300">
                    {entries.length} entries total
                  </div>
                </div>

                <div className="overflow-hidden rounded-[1.4rem] border border-white/8">
                  <table className="w-full border-collapse text-left">
                    <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.2em] text-stone-500">
                      <tr>
                        <th className="px-4 py-4 font-medium">Title</th>
                        <th className="px-4 py-4 font-medium">Section</th>
                        <th className="px-4 py-4 font-medium">Updated</th>
                        <th className="px-4 py-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr key={entry.title} className="border-t border-white/8">
                          <td className="px-4 py-4 text-sm text-stone-100">
                            {entry.title}
                          </td>
                          <td className="px-4 py-4 text-sm text-stone-400">
                            {entry.section.toLowerCase()}
                          </td>
                          <td className="px-4 py-4 text-sm text-stone-500">
                            {formatRelativeAdminDate(entry.updatedAt)}
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-stone-300">
                              {entry.status.toLowerCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {[
                    { id: "journal-entries", title: "Journal", section: "journal" },
                    { id: "realms-entries", title: "Realms", section: "realms" },
                    {
                      id: "experiments-entries",
                      title: "Experiments",
                      section: "experiments",
                    },
                  ].map((group) => {
                    const groupEntries = entries.filter(
                      (entry) => entry.section.toLowerCase() === group.section,
                    );

                    return (
                      <section
                        key={group.id}
                        id={group.id}
                        className="rounded-[1.4rem] border border-white/8 bg-black/20 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-300">
                            {group.title}
                          </h3>
                          <span className="text-xs text-stone-500">
                            {groupEntries.length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {groupEntries.length > 0 ? (
                            groupEntries.slice(0, 4).map((entry) => (
                              <div key={entry.id} className="rounded-2xl border border-white/8 px-3 py-3">
                                <div className="text-sm text-stone-100">
                                  {entry.title}
                                </div>
                                <div className="mt-1 text-xs text-stone-500">
                                  {entry.status.toLowerCase()}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 px-3 py-4 text-sm text-stone-500">
                              No entries yet
                            </div>
                          )}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </RevealItem>

              <div className="grid gap-6">
                <RevealItem
                  className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-6"
                  id="create-entry"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <EyeIcon className="size-5 text-[var(--sand)]" />
                    <h2 className="font-display text-3xl text-white">Create entry</h2>
                  </div>
                  <CreateEntryForm />
                </RevealItem>

                <RevealItem
                  className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-6"
                  id="publishing-rules"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <OrbitIcon className="size-5 text-[var(--secondary)]" />
                    <h2 className="font-display text-3xl text-white">Publishing rules</h2>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Choose Journal, Realms, or Experiments and the post will be routed to that archive.",
                      "Published entries appear on the homepage feeds automatically.",
                      "Each entry receives its own detail page under its section slug.",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-[1.2rem] border border-white/8 bg-black/20 px-4 py-3 text-sm text-stone-300"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </RevealItem>
              </div>
            </div>
          </RevealGroup>
        </div>
      </SiteShell>
    </div>
  );
}
