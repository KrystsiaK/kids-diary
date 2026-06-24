"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import {
  useActionState,
  useLayoutEffect,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";

import {
  createEntryAction,
} from "@/features/admin/actions/create-entry";
import type { CreateEntryState } from "@/features/admin/actions/create-entry";
import { updateEntryAction } from "@/features/admin/actions/manage-entry";
import { MediaPickerModal } from "@/features/admin/components/media-picker-modal";
import { RichEditor } from "@/features/admin/components/rich-editor";
import type { RichEditorHandle } from "@/features/admin/components/rich-editor";

const MAX_GALLERY_IMAGES = 24;
const MAX_IMAGE_BYTES = 90 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const initialCreateEntryState: CreateEntryState = {
  status: "idle",
  message: "",
};

type SelectedImage = {
  id: string;
  file?: File;
  filename: string;
  previewUrl: string;
  status: "uploading" | "ready" | "error";
  uploadedUrl?: string;
  error?: string;
};

type EditableEntry = {
  id: string;
  title: string;
  slug: string;
  section: string;
  kicker: string;
  excerpt: string;
  content: string;
  customCss: string;
  experimentCategory: string;
  coverImage: string;
  galleryImages: string[];
  readMinutes: number;
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
};

type EntryFormProps = {
  entry?: EditableEntry;
  mode?: "create" | "edit";
};

async function copyTextToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function SubmitButton({ disabled, mode }: { disabled: boolean; mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color-mix(in_oklab,var(--accent)_82%,white)] disabled:cursor-not-allowed disabled:opacity-50"
      disabled={pending || disabled}
      type="submit"
    >
      {pending
        ? "Saving…"
        : disabled
          ? "Finish photo uploads first"
          : mode === "edit"
            ? "Save changes"
            : "Save entry"}
    </button>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const INPUT_CLS =
  "min-w-0 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-600 transition focus:border-[var(--ring)]/40 focus:ring-2 focus:ring-[var(--ring)]/20";
const SELECT_CLS = `${INPUT_CLS} appearance-none pr-12 [color-scheme:dark]`;
const OPTION_CLS = "bg-[#10151d] text-stone-100";

function SelectArrow() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-stone-400"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function HelpPopover({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 16, top: 16 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;

      if (
        target &&
        (buttonRef.current?.contains(target) || panelRef.current?.contains(target))
      ) {
        return;
      }

      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;

    function updatePosition() {
      const button = buttonRef.current;
      const panel = panelRef.current;

      if (!button || !panel) return;

      const margin = 12;
      const gap = 10;
      const buttonRect = button.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = buttonRect.left;
      let top = buttonRect.bottom + gap;

      if (left + panelRect.width > viewportWidth - margin) {
        left = buttonRect.right - panelRect.width;
      }

      if (left < margin) {
        left = margin;
      }

      if (top + panelRect.height > viewportHeight - margin) {
        top = buttonRect.top - panelRect.height - gap;
      }

      if (top < margin) {
        top = margin;
      }

      setPosition({ left, top });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  return (
    <>
      <button
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex size-6 cursor-pointer list-none items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-stone-300 transition hover:bg-white/10 hover:text-white [&::-webkit-details-marker]:hidden"
        onClick={() => setOpen((current) => !current)}
        ref={buttonRef}
        type="button"
      >
        ?
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed z-[100] max-h-[min(32rem,calc(100vh-1.5rem))] w-[min(24rem,calc(100vw-1.5rem))] overflow-auto rounded-2xl border border-white/10 bg-[#111827] p-4 text-xs leading-5 text-stone-300 shadow-2xl shadow-black/50"
              ref={panelRef}
              role="dialog"
              style={{ left: position.left, top: position.top }}
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export function CreateEntryForm(props: EntryFormProps = {}) {
  const { entry, mode = entry ? "edit" : "create" } = props;
  const [actionState, formAction] = useActionState(
    mode === "edit" ? updateEntryAction : createEntryAction,
    initialCreateEntryState,
  );
  const initialSection = entry?.section.toLowerCase() ?? "journal";
  const initialImages = useMemo<SelectedImage[]>(() => {
    if (!entry) return [];

    return [entry.coverImage, ...entry.galleryImages]
      .filter(Boolean)
      .map((url, index) => ({
        id: `existing-${index}-${url}`,
        filename: url.split("/").pop() || `image-${index + 1}`,
        previewUrl: url,
        status: "ready" as const,
        uploadedUrl: url,
      }));
  }, [entry]);
  const [title, setTitle] = useState(entry?.title ?? "");
  const [slug, setSlug] = useState(entry?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(entry?.slug));
  const [excerptLength, setExcerptLength] = useState(entry?.excerpt.length ?? 0);
  const [section, setSection] = useState(initialSection);
  const [customCss, setCustomCss] = useState(entry?.customCss ?? "");
  const [dragOver, setDragOver] = useState(false);
  const [clientError, setClientError] = useState("");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>(initialImages);
  const [coverIndex, setCoverIndex] = useState(0);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [copiedImageId, setCopiedImageId] = useState("");
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<RichEditorHandle>(null);
  const selectedImagesRef = useRef(selectedImages);

  const generatedSlug = useMemo(() => slugify(title), [title]);
  const slugValue = slugTouched ? slug : generatedSlug;

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) => {
        if (image.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });
    };
  }, []);

  async function uploadImage(image: SelectedImage) {
    if (!image.file) {
      setSelectedImages((current) =>
        current.map((item) =>
          item.id === image.id && item.uploadedUrl
            ? { ...item, status: "ready", error: undefined }
            : item,
        ),
      );
      return;
    }

    try {
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: image.file,
        headers: {
          "Content-Type": image.file.type,
        },
      });
      const payload = (await response.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || `Upload failed with status ${response.status}.`);
      }

      setSelectedImages((current) =>
        current.map((item) =>
          item.id === image.id
            ? { ...item, status: "ready", uploadedUrl: payload.url, error: undefined }
            : item,
        ),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The image could not be uploaded. Try again.";

      setSelectedImages((current) =>
        current.map((item) =>
          item.id === image.id ? { ...item, status: "error", error: message } : item,
        ),
      );
    }
  }

  async function uploadImages(images: SelectedImage[]) {
    for (const image of images) {
      await uploadImage(image);
    }
  }

  function retryUpload(image: SelectedImage) {
    setSelectedImages((current) =>
      current.map((item) =>
        item.id === image.id
          ? { ...item, status: "uploading", error: undefined }
          : item,
      ),
    );
    void uploadImage({ ...image, status: "uploading", error: undefined });
  }

  function handleAddFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    const incomingFiles = Array.from(files);
    const unsupportedFile = incomingFiles.find(
      (file) => !SUPPORTED_IMAGE_TYPES.has(file.type),
    );

    if (unsupportedFile) {
      setClientError(
        `“${unsupportedFile.name}” is not supported. Use JPG, PNG, WebP, GIF, or AVIF.`,
      );
      return;
    }

    if (selectedImages.length + incomingFiles.length > MAX_GALLERY_IMAGES) {
      setClientError(`You can upload up to ${MAX_GALLERY_IMAGES} images per entry.`);
      return;
    }

    const oversizedFile = incomingFiles.find((file) => file.size > MAX_IMAGE_BYTES);
    if (oversizedFile) {
      setClientError(
        `“${oversizedFile.name}” exceeds the 90 MB per-file limit.`,
      );
      return;
    }

    setClientError("");

    const nextItems = incomingFiles
      .map((file) => ({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        filename: file.name,
        previewUrl: URL.createObjectURL(file),
        status: "uploading" as const,
      }));

    setSelectedImages((current) => {
      const updated = [...current, ...nextItems];
      setClientError("");
      return updated;
    });
    void uploadImages(nextItems);
  }

  function removeImage(imageId: string) {
    setSelectedImages((current) => {
      const removedImage = current.find((image) => image.id === imageId);
      if (removedImage?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(removedImage.previewUrl);
      }

      const updated = current.filter((image) => image.id !== imageId);
      const removedIndex = current.findIndex((image) => image.id === imageId);

      setCoverIndex((previous) => {
        if (updated.length === 0) {
          return 0;
        }

        if (removedIndex === -1) {
          return Math.min(previous, updated.length - 1);
        }

        if (previous === removedIndex) {
          return 0;
        }

        if (previous > removedIndex) {
          return previous - 1;
        }

        return Math.min(previous, updated.length - 1);
      });

      return updated;
    });
  }

  async function copyImagePath(image: SelectedImage) {
    if (image.status !== "ready" || !image.uploadedUrl) {
      setClientError("Wait for the image upload to finish before copying its path.");
      return;
    }

    try {
      await copyTextToClipboard(image.uploadedUrl);
      setCopiedImageId(image.id);
      setClientError("");
      window.setTimeout(() => {
        setCopiedImageId((current) => (current === image.id ? "" : current));
      }, 1800);
    } catch {
      setClientError("Could not copy the image path. Select and copy it manually.");
    }
  }

  const activeCover = selectedImages[coverIndex] ?? null;
  const uploadsInProgress = selectedImages.some((image) => image.status === "uploading");
  const uploadErrors = selectedImages.filter((image) => image.status === "error");
  const formError =
    clientError ||
    actionState.message ||
    (uploadErrors.length > 0
      ? `${uploadErrors.length} photo${uploadErrors.length === 1 ? "" : "s"} failed to upload. Retry or remove them before saving.`
      : "");

  return (
    <form action={formAction} className="min-w-0 space-y-4">
      {mode === "edit" && entry && (
        <input name="entryId" type="hidden" value={entry.id} />
      )}
      {formError && (
        <div
          aria-live="assertive"
          className="rounded-[1.4rem] border border-rose-500/25 bg-rose-500/10 px-5 py-4 text-sm leading-6 text-rose-100"
          role="alert"
        >
          <div className="font-semibold">The entry was not saved</div>
          <div className="mt-1 text-rose-100/80">
            {formError}
          </div>
        </div>
      )}
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <label className="min-w-0 space-y-2">
          <span className="text-sm text-stone-300">Title</span>
          <input
            className={INPUT_CLS}
            name="title"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="When the sky became a map"
            required
            type="text"
            value={title}
          />
        </label>
        <label className="min-w-0 space-y-2">
          <span className="text-sm text-stone-300">Section</span>
          <div className="relative">
            <select
              className={SELECT_CLS}
              name="section"
              onChange={(event) => setSection(event.target.value)}
              value={section}
            >
              <option className={OPTION_CLS} value="journal">Journal</option>
              <option className={OPTION_CLS} value="realms">Realms</option>
              <option className={OPTION_CLS} value="experiments">Experiments</option>
            </select>
            <SelectArrow />
          </div>
        </label>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <label className="min-w-0 space-y-2">
          <span className="text-sm text-stone-300">Kicker</span>
          <input
            className={INPUT_CLS}
            defaultValue={entry?.kicker ?? ""}
            name="kicker"
            placeholder="Chapter IV"
            required
            type="text"
          />
        </label>
        <label className="min-w-0 space-y-2">
          <span className="text-sm text-stone-300">Slug</span>
          <input
            className={INPUT_CLS}
            name="slug"
            onBlur={() => { if (slugValue) setSlugTouched(true); }}
            onChange={(event) => { setSlugTouched(true); setSlug(event.target.value); }}
            placeholder="optional-custom-slug"
            type="text"
            value={slugValue}
          />
          <p className="text-xs leading-5 text-stone-500">
            Fills automatically from the title until you edit it manually.
          </p>
        </label>
      </div>

      <label className="min-w-0 space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-stone-300">Excerpt</span>
          <span className={`text-xs tabular-nums transition ${excerptLength > 240 ? "text-amber-400" : "text-stone-600"}`}>
            {excerptLength} / 280
          </span>
        </div>
        <textarea
          className={`min-h-24 ${INPUT_CLS}`}
          defaultValue={entry?.excerpt ?? ""}
          maxLength={280}
          name="excerpt"
          onChange={(e) => setExcerptLength(e.target.value.length)}
          placeholder="Short summary for cards and archive pages."
          required
        />
      </label>

      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-stone-300">Body content</span>
          {section === "experiments" && (
            <HelpPopover label="Experiment HTML translation instructions">
              <div className="space-y-3">
                <p>
                  For custom experiment pages, mark translatable text explicitly.
                  Layout/classes stay untouched; only text inside braces is sent
                  to AI.
                </p>
                <pre className="overflow-x-auto rounded-xl bg-black/40 p-3 text-[0.68rem] text-emerald-200">{`<section class="hero">
  <h1 data-i18n="hero.title">
    {Welcome to the experiment}
  </h1>
  <p data-i18n="hero.text">
    {This text will be translated.}
  </p>
</section>`}</pre>
                <p>
                  Use unique keys like <code>hero.title</code>,{" "}
                  <code>card.1.text</code>, <code>cta.label</code>.
                </p>
              </div>
            </HelpPopover>
          )}
        </div>
        <RichEditor
          customCss={section === "experiments" ? customCss : ""}
          enableHtmlMode={section === "experiments"}
          key={section === "experiments" ? "experiment-editor" : "standard-editor"}
          name="content"
          onImageInsert={() => setMediaPickerOpen(true)}
          placeholder="Write the full entry here. Use the toolbar for formatting."
          ref={editorRef}
          value={entry?.content ?? ""}
        />
        <MediaPickerModal
          onClose={() => setMediaPickerOpen(false)}
          onSelect={(url) => {
            editorRef.current?.insertImage(url);
            setMediaPickerOpen(false);
          }}
          open={mediaPickerOpen}
        />
      </div>

      {section === "experiments" && (
        <div className="min-w-0 space-y-4">
          <label className="min-w-0 space-y-2">
            <span className="text-sm text-stone-300">Experiment category</span>
            <input
              className={INPUT_CLS}
              defaultValue={entry?.experimentCategory ?? ""}
              list="experiment-category-suggestions"
              name="experimentCategory"
              placeholder="Interactive story, visual study, prompt lab…"
              type="text"
            />
            <datalist id="experiment-category-suggestions">
              <option value="Interactive story" />
              <option value="Visual study" />
              <option value="Prompt lab" />
              <option value="AI experiment" />
              <option value="Design system" />
            </datalist>
            <p className="text-xs leading-5 text-stone-500">
              Used for filtering on the public Experiments page.
            </p>
          </label>

          <label className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="text-sm text-stone-300">Experiment page CSS</span>
              <span className="ml-2 inline-flex align-middle">
                <HelpPopover label="Scoped CSS instructions">
                  <div className="space-y-3">
                    <p>
                      Write normal CSS for your experiment. It is automatically
                      scoped to this entry, so selectors cannot style the admin
                      or the rest of the site.
                    </p>
                    <pre className="overflow-x-auto rounded-xl bg-black/40 p-3 text-[0.68rem] text-emerald-200">{`.hero {
  min-height: 60vh;
  display: grid;
  place-items: center;
}

.hero h1 {
  font-size: clamp(3rem, 10vw, 8rem);
}`}</pre>
                    <p>
                      Blocked for safety: <code>@import</code>, scripts,
                      JavaScript URLs, and <code>position: fixed</code>.
                    </p>
                  </div>
                </HelpPopover>
              </span>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                Optional. Styles are scoped to this experiment page only; scripts,
                imports, fixed positioning and global page selectors are stripped
                or rewritten before preview/save.
              </p>
            </div>
            <span className="text-xs tabular-nums text-stone-600">
              {customCss.length} / 60000
            </span>
            </div>
            <textarea
              className={`${INPUT_CLS} min-h-56 resize-y font-mono text-xs leading-6 text-emerald-200`}
              maxLength={60000}
              name="customCss"
              onChange={(event) => setCustomCss(event.target.value)}
              placeholder={".hero {\n  min-height: 60vh;\n  display: grid;\n  place-items: center;\n}\n\n.hero h1 {\n  font-size: clamp(3rem, 10vw, 8rem);\n}"}
              spellCheck={false}
              value={customCss}
            />
          </label>
        </div>
      )}

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(24rem,0.92fr)_minmax(18rem,1.08fr)]">
        <div className="min-w-0 space-y-2">
          <span className="text-sm text-stone-300">Cover image</span>
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20">
            {activeCover ? (
              <div>
                <div className="relative">
                  <Image
                    alt="Selected cover preview"
                    className="aspect-[16/10] w-full object-cover"
                    height={800}
                    src={activeCover.previewUrl}
                    unoptimized
                    width={1280}
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    Cover
                  </div>
                </div>
                <div className="border-t border-white/10 px-4 py-3 text-sm text-stone-300">
                  {activeCover.filename}
                </div>
              </div>
            ) : (
              <div className="flex min-h-48 items-center justify-center px-6 text-center text-sm leading-6 text-stone-500">
                Upload photos below, then choose which one should be used as the
                header image.
              </div>
            )}
          </div>
          <p className="text-xs leading-5 text-stone-500">
            The selected cover is used on cards and page headers, and it will be
            excluded from the publication carousel.
          </p>
        </div>

        <label className="min-w-0 space-y-2">
          <span className="text-sm text-stone-300">Read minutes</span>
          <input
            className={INPUT_CLS}
            defaultValue={entry?.readMinutes ? String(entry.readMinutes) : ""}
            min="1"
            name="readMinutes"
            placeholder="Auto if empty"
            type="number"
          />
        </label>
      </div>

      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-stone-300">Gallery images</div>
            <p className="mt-1 text-xs leading-5 text-stone-500">
              Add as many photos as you need, preview them here, remove any of them,
              choose one as cover, or copy a ready image path for custom HTML.
              Up to 24 images.
            </p>
          </div>
          <button
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-stone-100 transition hover:bg-white/10"
            onClick={() => galleryInputRef.current?.click()}
            type="button"
          >
            Add photos
          </button>
        </div>

        <input
          accept="image/*"
          className="hidden"
          multiple
          onChange={(event) => {
            handleAddFiles(event.target.files);
            event.target.value = "";
          }}
          ref={galleryInputRef}
          type="file"
        />
        {selectedImages.map((image) =>
          image.status === "ready" && image.uploadedUrl ? (
            <input
              key={`${image.id}-url`}
              name="galleryImageUrls"
              type="hidden"
              value={image.uploadedUrl}
            />
          ) : null,
        )}
        <input name="coverIndex" type="hidden" value={selectedImages.length > 0 ? coverIndex : 0} />

        {selectedImages.length > 0 ? (
          <div
            className={`grid min-w-0 gap-4 rounded-[1.5rem] border border-dashed p-3 transition sm:grid-cols-2 xl:grid-cols-3 ${
              dragOver ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-white/10"
            }`}
            onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleAddFiles(e.dataTransfer.files); }}
          >
            {selectedImages.map((image, index) => {
              const isCover = index === coverIndex;

              return (
                <article
                  key={image.id}
                  className={`min-w-0 overflow-hidden rounded-[1.5rem] border bg-black/20 ${
                    isCover ? "border-[var(--accent)]" : "border-white/10"
                  }`}
                >
                  <div className="relative">
                    <Image
                      alt={image.filename}
                      className="aspect-[4/3] w-full object-cover"
                      height={640}
                      src={image.previewUrl}
                      unoptimized
                      width={960}
                    />
                    {isCover && (
                      <div className="absolute left-3 top-3 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                        Header image
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="truncate text-sm text-stone-300">
                      {image.filename}
                    </div>
                    <div
                      aria-live="polite"
                      className={`text-xs leading-5 ${
                        image.status === "ready"
                          ? "text-emerald-300"
                          : image.status === "error"
                            ? "text-rose-300"
                            : "text-amber-300"
                      }`}
                    >
                      {image.status === "ready"
                        ? "Uploaded"
                        : image.status === "error"
                          ? image.error
                          : "Uploading…"}
                    </div>
                    {image.status === "ready" && image.uploadedUrl && (
                      <code className="block truncate rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[0.68rem] text-stone-400">
                        {image.uploadedUrl}
                      </code>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                          isCover
                            ? "bg-[var(--accent)] text-white"
                            : "border border-white/10 bg-white/5 text-stone-100 hover:bg-white/10"
                        }`}
                        onClick={() => setCoverIndex(index)}
                        type="button"
                      >
                        {isCover ? "Selected cover" : "Set as cover"}
                      </button>
                      <button
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-stone-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={image.status !== "ready" || !image.uploadedUrl}
                        onClick={() => void copyImagePath(image)}
                        type="button"
                      >
                        {copiedImageId === image.id ? "Copied" : "Copy path"}
                      </button>
                      <button
                        className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
                        onClick={() => removeImage(image.id)}
                        type="button"
                      >
                        Remove
                      </button>
                      {image.status === "error" && (
                        <button
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-stone-100 transition hover:bg-white/10"
                          onClick={() => retryUpload(image)}
                          type="button"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div
            className={`rounded-[1.5rem] border border-dashed px-6 py-10 text-center text-sm leading-6 transition ${
              dragOver
                ? "border-[var(--accent)] bg-[var(--accent)]/5 text-stone-300"
                : "border-white/10 bg-black/20 text-stone-500"
            }`}
            onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleAddFiles(e.dataTransfer.files); }}
          >
            {dragOver
              ? "Drop photos here"
              : <>No photos added yet. Click <span className="text-stone-300">Add photos</span> or drag files here.</>
            }
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-stone-300">Status</span>
          <div className="relative">
            <select
              className={SELECT_CLS}
              defaultValue={entry?.status ?? "PUBLISHED"}
              name="status"
            >
              <option className={OPTION_CLS} value="PUBLISHED">Published</option>
              <option className={OPTION_CLS} value="DRAFT">Draft</option>
            </select>
            <SelectArrow />
          </div>
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition hover:bg-white/[0.03]">
          <input
            className="size-4 accent-[var(--accent)]"
            defaultChecked={entry?.featured ?? false}
            name="featured"
            type="checkbox"
          />
          <span className="text-sm text-stone-300">Mark as featured</span>
        </label>
      </div>

      <SubmitButton disabled={uploadsInProgress || uploadErrors.length > 0} mode={mode} />
    </form>
  );
}
