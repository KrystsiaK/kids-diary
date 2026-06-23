import { retryEntryTranslationAction } from "@/features/admin/actions/manage-entry";
import { getEntryTranslationStatuses } from "@/features/content/lib/content-repository";

const LOCALE_LABELS: Record<string, string> = {
  ru: "RU",
  pt: "PT",
  pl: "PL",
  es: "ES",
};

export async function EntryTranslationStatus({
  entryId,
  published,
}: {
  entryId: string;
  published: boolean;
}) {
  if (!published) {
    return <span className="text-xs text-stone-600">—</span>;
  }

  const statuses = await getEntryTranslationStatuses(entryId);

  return (
    <div className="flex flex-wrap gap-1.5">
      {statuses.map(({ locale, status }) => (
        <span key={locale} className="inline-flex items-center gap-1">
          <span
            className={`rounded-full px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.08em] ${
              status === "READY"
                ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                : status === "FAILED"
                  ? "border border-rose-500/25 bg-rose-500/10 text-rose-300"
                  : "border border-white/10 bg-white/5 text-stone-500"
            }`}
            title={`${LOCALE_LABELS[locale] ?? locale}: ${status.toLowerCase()}`}
          >
            {LOCALE_LABELS[locale] ?? locale}
          </span>
          {status === "FAILED" && (
            <form action={retryEntryTranslationAction}>
              <input name="entryId" type="hidden" value={entryId} />
              <input name="locale" type="hidden" value={locale} />
              <button
                className="text-[0.65rem] text-stone-400 underline decoration-stone-600 underline-offset-2 transition hover:text-stone-100"
                type="submit"
              >
                retry
              </button>
            </form>
          )}
        </span>
      ))}
    </div>
  );
}
