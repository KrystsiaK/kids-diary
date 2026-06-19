import {
  deleteEntryAction,
  updateEntryStatusAction,
} from "@/features/admin/actions/manage-entry";
import type { EntryStatusValue } from "@/features/content/lib/sections";
import { ConfirmationDialog } from "@/shared/ui/confirmation-dialog";

type EntryManagementActionsProps = {
  entryId: string;
  entryTitle: string;
  status: EntryStatusValue;
};

export function EntryManagementActions({
  entryId,
  entryTitle,
  status,
}: EntryManagementActionsProps) {
  const nextStatus: EntryStatusValue =
    status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  const isPublished = status === "PUBLISHED";

  return (
    <div className="flex flex-wrap items-start gap-2">
      <ConfirmationDialog
        description={
          isPublished
            ? "The article will disappear from the homepage, its archive, and its public URL. It will remain saved in the admin area as a draft."
            : "The article will become visible on the homepage, in its archive, and at its public URL."
        }
        heading={isPublished ? "Move article to draft?" : "Publish article?"}
        triggerLabel={isPublished ? "Move to draft" : "Publish"}
      >
        <form action={updateEntryStatusAction}>
          <input name="entryId" type="hidden" value={entryId} />
          <input name="nextStatus" type="hidden" value={nextStatus} />
          <button
            className="w-full rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color-mix(in_oklab,var(--accent)_82%,white)] sm:w-auto"
            type="submit"
          >
            {isPublished ? "Move to draft" : "Publish now"}
          </button>
        </form>
      </ConfirmationDialog>

      <ConfirmationDialog
        description="The article will be permanently removed from the database and all public pages. This action cannot be undone."
        heading={`Delete “${entryTitle}”?`}
        tone="danger"
        triggerLabel="Delete"
      >
        <form action={deleteEntryAction}>
          <input name="entryId" type="hidden" value={entryId} />
          <button
            className="w-full rounded-full bg-rose-500/20 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/30 sm:w-auto"
            type="submit"
          >
            Delete permanently
          </button>
        </form>
      </ConfirmationDialog>
    </div>
  );
}
