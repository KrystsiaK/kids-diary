"use client";

import { AnimatePresence, motion } from "framer-motion";

import { useEntryTranslation } from "@/features/content/components/entry-translation-context";

export function TranslatedField({
  field,
}: {
  field: "title" | "kicker" | "excerpt";
}) {
  const { fields } = useEntryTranslation();

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.span
        key={fields[field]}
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {fields[field]}
      </motion.span>
    </AnimatePresence>
  );
}

export function TranslatedArticleBody() {
  const { fields } = useEntryTranslation();
  const paragraphs = fields.content.split(/\n{2,}/).filter(Boolean);

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={fields.content}
        animate={{ opacity: 1 }}
        className="space-y-6 text-base leading-8 text-[var(--muted)] sm:text-lg"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}