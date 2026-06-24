"use client";

import { AnimatePresence, motion } from "framer-motion";

import { useEntryTranslation } from "@/features/content/components/entry-translation-context";
import { unwrapExperimentI18nBraces } from "@/features/content/lib/experiment-i18n";
import { prepareRichHtml } from "@/features/content/lib/rich-content";
import { buildScopedCustomCss } from "@/features/content/lib/scoped-css";

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

export function TranslatedArticleBody({
  customCss = "",
  scopeId,
}: {
  customCss?: string;
  scopeId?: string;
}) {
  const { fields } = useEntryTranslation();
  const content = fields.content;
  const safeHtml = prepareRichHtml(content);
  const displayHtml = unwrapExperimentI18nBraces(safeHtml);
  const isHtml = safeHtml.startsWith("<");
  const scopeClass = scopeId ? `experiment-page-${scopeId.replace(/[^a-z0-9_-]/gi, "")}` : "";
  const scopedCss =
    customCss && scopeClass ? buildScopedCustomCss(customCss, `.${scopeClass}`) : "";

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={content}
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {scopedCss && <style>{scopedCss}</style>}
        {isHtml ? (
          <div
            className={`rich-content ${scopeClass}`}
            dangerouslySetInnerHTML={{ __html: displayHtml }}
          />
        ) : (
          <div className={`space-y-6 text-base leading-8 text-[var(--muted)] sm:text-lg ${scopeClass}`}>
            {content.split(/\n{2,}/).filter(Boolean).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
