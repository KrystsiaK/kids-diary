"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createEntryAction } from "@/features/admin/actions/create-entry";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function CreateEntryForm() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [selectedImages, setSelectedImages] = useState<
    Array<{ id: string; file: File; previewUrl: string }>
  >([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const galleryInputRef = useRef<HTMLInputElement>(null);
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

    const nextItems = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));

    setSelectedImages((current) => {
      const updated = [...current, ...nextItems];
      queueMicrotask(() => syncInputFiles(updated));
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
    <form action={createEntryAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-stone-300">Title</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-stone-600"
            name="title"
            onChange={(event) => {
              setTitle(event.target.value);
            }}
            placeholder="When the sky became a map"
            required
            type="text"
            value={title}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-stone-300">Section</span>
          <select
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
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
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-stone-600"
            name="kicker"
            placeholder="Chapter IV"
            required
            type="text"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-stone-300">Slug</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-stone-600"
            name="slug"
            onBlur={() => {
              if (slugValue) {
                setSlugTouched(true);
              }
            }}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
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
        <span className="text-sm text-stone-300">Excerpt</span>
        <textarea
          className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-stone-600"
          name="excerpt"
          placeholder="Short summary for cards and archive pages."
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-stone-300">Body content</span>
        <textarea
          className="min-h-40 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-stone-600"
          name="content"
          placeholder="Write the full entry here. Separate paragraphs with blank lines."
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
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-stone-600"
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
              and choose one as cover. Up to 24 images, 8 MB each.
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
            event.target.value = "";
          }}
          ref={galleryInputRef}
          type="file"
        />
        <input name="coverIndex" type="hidden" value={selectedImages.length > 0 ? coverIndex : 0} />

        {selectedImages.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center text-sm leading-6 text-stone-500">
            No photos added yet. Start by clicking <span className="text-stone-300">Add photos</span>.
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-stone-300">Status</span>
          <select
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            defaultValue="PUBLISHED"
            name="status"
          >
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <input className="size-4" defaultChecked name="featured" type="checkbox" />
          <span className="text-sm text-stone-300">Mark as featured</span>
        </label>
      </div>

      <button
        className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color-mix(in_oklab,var(--accent)_82%,white)]"
        type="submit"
      >
        Save entry
      </button>
    </form>
  );
}
