"use client";

import {
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
  useEffect,
  useId,
  useRef,
} from "react";

export type ConfirmationDialogProps = {
  children: ReactNode;
  description: string;
  heading: string;
  tone?: "default" | "danger";
  triggerLabel: string;
};

export function ConfirmationDialog({
  children,
  description,
  heading,
  tone = "default",
  triggerLabel,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headingId = useId();
  const descriptionId = useId();

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function openDialog() {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    dialog.classList.remove("is-closing");
    dialog.showModal();
    requestAnimationFrame(() => dialog.classList.add("is-open"));
  }

  function closeDialog() {
    const dialog = dialogRef.current;

    if (!dialog || !dialog.open) {
      return;
    }

    const closeMs =
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--modal-close-dur",
        ),
      ) || 150;

    dialog.classList.remove("is-open");
    dialog.classList.add("is-closing");
    closeTimerRef.current = setTimeout(() => {
      dialog.close();
      dialog.classList.remove("is-closing");
      closeTimerRef.current = null;
    }, closeMs);
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    closeDialog();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  }

  const isDanger = tone === "danger";

  return (
    <>
      <button
        className={`rounded-full border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
          isDanger
            ? "border-rose-500/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
            : "border-white/10 bg-white/5 text-stone-100 hover:bg-white/10"
        }`}
        onClick={openDialog}
        type="button"
      >
        {triggerLabel}
      </button>

      <dialog
        aria-describedby={descriptionId}
        aria-labelledby={headingId}
        className="t-modal m-auto w-[calc(100%_-_2rem)] max-w-md rounded-[1.75rem] border border-white/10 bg-[#11151d] p-0 text-stone-100 shadow-[0_32px_100px_rgba(0,0,0,0.65)] backdrop:bg-black/70 backdrop:backdrop-blur-sm"
        onCancel={handleCancel}
        onClick={handleBackdropClick}
        ref={dialogRef}
      >
        <div className="p-6 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.22em] text-stone-500">
                Confirm action
              </div>
              <h2 className="font-display text-3xl text-white" id={headingId}>
                {heading}
              </h2>
            </div>
            <button
              aria-label="Close confirmation"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-stone-300 transition hover:bg-white/10 hover:text-white"
              onClick={closeDialog}
              type="button"
            >
              ×
            </button>
          </div>

          <p className="mb-6 text-sm leading-6 text-stone-300" id={descriptionId}>
            {description}
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-stone-200 transition hover:bg-white/10"
              onClick={closeDialog}
              type="button"
            >
              Cancel
            </button>
            {children}
          </div>
        </div>
      </dialog>
    </>
  );
}
