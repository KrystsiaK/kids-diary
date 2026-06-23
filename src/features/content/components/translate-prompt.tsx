"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { useEntryTranslation } from "@/features/content/components/entry-translation-context";

export function TranslatePrompt() {
  const t = useTranslations("translatePrompt");
  const { promptLocale, isLoading, error, acceptTranslation, dismiss } = useEntryTranslation();

  const languageName = promptLocale
    ? (new Intl.DisplayNames([promptLocale], { type: "language" }).of(promptLocale) ??
      promptLocale)
    : "";

  return (
    <AnimatePresence>
      {promptLocale && (
        <motion.div
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden"
          exit={{ opacity: 0, height: 0 }}
          initial={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
            <span>{t("question", { language: languageName })}</span>
            {error && <span className="text-rose-400">{t("error")}</span>}
            <div className="ml-auto flex items-center gap-2">
              <button
                className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-foreground)] transition disabled:opacity-60"
                disabled={isLoading}
                onClick={acceptTranslation}
                type="button"
              >
                {isLoading ? t("loading") : t("accept")}
              </button>
              <button
                className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
                disabled={isLoading}
                onClick={dismiss}
                type="button"
              >
                {t("dismiss")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
