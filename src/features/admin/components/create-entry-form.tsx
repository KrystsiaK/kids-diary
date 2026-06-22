"use client";

import Image from "next/image";
import {
  useActionState,
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

const MAX_GALLERY_IMAGES = 24;
const MAX_TOTAL_UPLOAD_BYTES = 90 * 1024 * 1024;
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color-mix(in_oklab,var(--accent)_82%,white)] disabled:cursor-not-allowed disabled:opacity-50"
      disabled={pending}
      type="submit"
    >
      {pending ? "Saving…" : "Save entry"}
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
  "w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-600 transition focus:border-[var(--ring)]/40 focus:ring-2 focus:ring-[var(--ring)]/20";

export function CreateEntryForm() {
  const [actionState, formAction] = useActionState(
    createEntryAction,
    initialCreateEntryState,
  );
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerptLength, setExcerptLength] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [clientError, setClientError] = useState("");
  const [selectedImages, setSelectedImages] = useState<
    Array<{ id: string; file: File; previewUrl: string }>
  >([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const selectedImagesRef = useRef(selectedImages);

  const generatedSlug = useMemo(() => slugify(title), [title]);
  const slugValue = slugTouched ? slug : generatedSlug;

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, []);

  function syncInputFiles(
    images: Array<{ id: string; file: File; previewUrl: string }>,
  ) {
    const input = galleryInputRef.current;

    if (!input) {
      return;
    }

    const dataTransfer = new DataTransfer();

    images.forEach((image) => {
      dataTransfer.items.add(image.file);
    });

    input.files = dataTransfer.files;
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

    const totalBytes = [...selectedImages.map((image) => image.file), ...incomingFiles]
      .reduce((sum, file) => sum + file.size, 0);

    if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
      setClientError(
        "The selected images exceed 90 MB in total. Remove some files and try again.",
      );
      return;
    }

    setClientError("");

    const nextItems = incomingFiles
      .map((file) => ({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));

    setSelectedImages((current) => {
      const updated = [...current, ...nextItems];
      queueMicrotask(() => syncInputFiles(updated));
      setClientError("");
      return updated;
    });
  }

  function removeImage(imageId: string) {
    setSelectedImages((current) => {
      const removedImage = current.find((image) => image.id === imageId);
      if (removedImage) {
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

      queueMicrotask(() => syncInputFiles(updated));
      return updated;
    });
  }

  const activeCover = selectedImages[coverIndex] ?? null;

  return (
    <form
      action={formAction}
      className="space-y-4"
      onSubmit={() => syncInputFiles(selectedImages)}
    >
      {(clientError || actionState.message) && (
        <div
          aria-live="assertive"
          className="rounded-[1.4rem] border border-rose-500/25 bg-rose-500/10 px-5 py-4 text-sm leading-6 text-rose-100"
          role="alert"
        >
          <div className="font-semibold">The entry was not saved</div>
          <div className="mt-1 text-rose-100/80">
            {clientError || actionState.message}
          </div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
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
        <label className="space-y-2">
          <span className="text-sm text-stone-300">Section</span>
          <select
            className={INPUT_CLS}
            defaultValue="journal"
            name="section"
          >
            <option value="journal">Journal</option>
            <option value="realms">Realms</option>
            <option value="experiments">Experiments</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-stone-300">Kicker</span>
          <input
            className={INPUT_CLS}
            name="kicker"
            placeholder="Chapter IV"
            required
            type="text"
          />
        </label>
        <label className="space-y-2">
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

      <label className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-stone-300">Excerpt</span>
          <span className={`text-xs tabular-nums transition ${excerptLength > 240 ? "text-amber-400" : "text-stone-600"}`}>
            {excerptLength} / 280
          </span>
        </div>
        <textarea
          className={`min-h-24 ${INPUT_CLS}`}
          maxLength={280}
          name="excerpt"
          onChange={(e) => setExcerptLength(e.target.value.length)}
          placeholder="Short summary for cards and archive pages."
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-stone-300">Body content</span>
        <textarea
          className={`min-h-40 resize-none overflow-hidden ${INPUT_CLS}`}
          name="content"
          onChange={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
          }}
          placeholder="Write the full entry here. Separate paragraphs with blank lines."
          ref={bodyRef}
          required
        />
      </label>

      <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-2">
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
                  {activeCover.file.name}
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

        <label className="space-y-2">
          <span className="text-sm text-stone-300">Read minutes</span>
          <input
            className={INPUT_CLS}
            min="1"
            name="readMinutes"
            placeholder="Auto if empty"
            type="number"
          />
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-stone-300">Gallery images</div>
            <p className="mt-1 text-xs leading-5 text-stone-500">
              Add as many photos as you need, preview them here, remove any of them,
              and choose one as cover. Up to 24 images.
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
          name="galleryUploads"
          onChange={(event) => {
            handleAddFiles(event.target.files);
          }}
          ref={galleryInputRef}
          type="file"
        />
        <input name="coverIndex" type="hidden" value={selectedImages.length > 0 ? coverIndex : 0} />

        {selectedImages.length > 0 ? (
          <div
            className={`grid gap-4 rounded-[1.5rem] border border-dashed p-3 transition sm:grid-cols-2 xl:grid-cols-3 ${
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
                  className={`overflow-hidden rounded-[1.5rem] border bg-black/20 ${
                    isCover ? "border-[var(--accent)]" : "border-white/10"
                  }`}
                >
                  <div className="relative">
                    <Image
                      alt={image.file.name}
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
                      {image.file.name}
                    </div>
                    <div className="flex gap-2">
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
                        className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
                        onClick={() => removeImage(image.id)}
                        type="button"
                      >
                        Remove
                      </button>
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
          <select
            className={INPUT_CLS}
            defaultValue="PUBLISHED"
            name="status"
          >
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition hover:bg-white/[0.03]">
          <input className="size-4 accent-[var(--accent)]" defaultChecked name="featured" type="checkbox" />
          <span className="text-sm text-stone-300">Mark as featured</span>
        </label>
      </div>

      <SubmitButton />
    </form>
  );
}
