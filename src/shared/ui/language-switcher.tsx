"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  ru: "RU",
  pt: "PT",
  pl: "PL",
  es: "ES",
};

export function LanguageSwitcher() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function selectLocale(nextLocale: string) {
    setOpen(false);
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div className="relative">
      <button
        aria-expanded={open}
        aria-label={t("language.label")}
        className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-strong)]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {LOCALE_LABELS[locale] ?? locale.toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-28 rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_96%,transparent)] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          {routing.locales.map((value) => (
            <button
              key={value}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                value === locale
                  ? "bg-[var(--surface-strong)] text-[var(--foreground)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              }`}
              onClick={() => selectLocale(value)}
              type="button"
            >
              {LOCALE_LABELS[value] ?? value.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}