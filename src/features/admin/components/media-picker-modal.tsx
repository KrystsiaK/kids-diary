"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type MediaFile = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

type MediaPickerModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
};

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export function MediaPickerModal({ open, onClose, onSelect }: MediaPickerModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copiedFileId, setCopiedFileId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/media");
        if (!res.ok) throw new Error("Failed to load media library.");
        const data = (await res.json()) as { files: MediaFile[] };
        if (!cancelled) setFiles(data.files);
      } catch {
        if (!cancelled) setError("Could not load media library.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [open]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      setError("Use a JPG, PNG, WebP, GIF, or AVIF image.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: file,
        headers: {
          "Content-Type": file.type,
          "x-filename": encodeURIComponent(file.name),
        },
      });
      const data = (await res.json().catch(() => null)) as { file?: MediaFile; error?: string } | null;
      if (!res.ok || !data?.file) {
        throw new Error(data?.error ?? "Upload failed.");
      }
      const uploaded = data.file;
      setFiles((prev) => [uploaded, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function copyPath(file: MediaFile) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(file.url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = file.url;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopiedFileId(file.id);
      setError("");
      window.setTimeout(() => {
        setCopiedFileId((current) => (current === file.id ? "" : current));
      }, 1800);
    } catch {
      setError("Could not copy the media path. Select and copy it manually.");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f1319] shadow-2xl"
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="font-display text-xl text-[var(--foreground)]">Media library</h2>
              <div className="flex items-center gap-3">
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  type="file"
                />
                <button
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-stone-100 transition hover:bg-white/10 disabled:opacity-50"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  {uploading ? "Uploading…" : "Upload new"}
                </button>
                <button
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-stone-300 transition hover:bg-white/10"
                  onClick={onClose}
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-4 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex h-40 items-center justify-center text-sm text-stone-500">
                  Loading…
                </div>
              ) : files.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-stone-500">
                  No images uploaded yet. Click <span className="mx-1 text-stone-300">Upload new</span> to add one.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {files.map((file) => (
                    <article
                      className="group overflow-hidden rounded-xl border border-white/10 bg-black/20 transition hover:border-[var(--accent)]"
                      key={file.id}
                      title={file.filename}
                    >
                      <button
                        className="relative block aspect-square w-full focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/40"
                        onClick={() => { onSelect(file.url); onClose(); }}
                        type="button"
                      >
                        <Image
                          alt={file.filename}
                          className="object-cover transition group-hover:opacity-90"
                          fill
                          sizes="(min-width: 768px) 25vw, 50vw"
                          src={file.url}
                          unoptimized
                        />
                      </button>
                      <div className="truncate px-2 py-1.5 text-left text-xs text-stone-400">
                        {file.filename}
                      </div>
                      <div className="space-y-2 border-t border-white/10 px-2 pb-2 pt-2">
                        <code className="block truncate rounded-md bg-black/30 px-2 py-1 text-[0.65rem] text-stone-500">
                          {file.url}
                        </code>
                        <div className="flex gap-2">
                          <button
                            className="flex-1 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 text-[0.68rem] font-semibold text-stone-100 transition hover:bg-white/10"
                            onClick={() => void copyPath(file)}
                            type="button"
                          >
                            {copiedFileId === file.id ? "Copied" : "Copy path"}
                          </button>
                          <button
                            className="flex-1 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 text-[0.68rem] font-semibold text-stone-100 transition hover:bg-white/10"
                            onClick={() => { onSelect(file.url); onClose(); }}
                            type="button"
                          >
                            Insert
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
