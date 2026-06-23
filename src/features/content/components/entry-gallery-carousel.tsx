"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";

type EntryGalleryCarouselProps = {
  images: string[];
  title: string;
};

export function EntryGalleryCarousel({
  images,
  title,
}: EntryGalleryCarouselProps) {
  const t = useTranslations("gallery");
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const activeImage = images[activeIndex];

  return (
    <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            {t("fieldGallery")}
          </div>
          <h2 className="mt-2 font-display text-3xl text-[var(--foreground)]">{t("photoSequence")}</h2>
        </div>
        <div className="text-sm text-[var(--muted)]">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-strong)]">
        <motion.div
          key={activeImage}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Image
            alt={`${title} image ${activeIndex + 1}`}
            className="aspect-[16/10] w-full object-cover"
            height={1200}
            sizes="100vw"
            src={activeImage}
            width={1800}
          />
        </motion.div>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            className={`relative shrink-0 overflow-hidden rounded-2xl border transition ${
              index === activeIndex
                ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30"
                : "border-[var(--border)] hover:border-[var(--muted)]"
            }`}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            <Image
              alt=""
              aria-hidden="true"
              className="size-20 object-cover sm:size-24"
              height={96}
              sizes="96px"
              src={image}
              width={96}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
