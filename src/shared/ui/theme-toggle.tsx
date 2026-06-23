"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { MoonIcon, SunIcon, SystemIcon } from "@/shared/icons/site-icons";

const ORDER = ["light", "dark", "system"] as const;

const ICONS = {
  light: SunIcon,
  dark: MoonIcon,
  system: SystemIcon,
} as const;

export function ThemeToggle() {
  const t = useTranslations("theme");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // next-themes resolves `theme` from localStorage synchronously on the client, so the first
    // client render already differs from SSR. Gating on `mounted` renders the SSR-safe fallback
    // until after hydration, avoiding the mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Server and the pre-hydration client render both see "system" regardless of the real
  // stored preference, so they agree; the real theme/icon appears in the next paint.
  const current = (mounted ? theme ?? "system" : "system") as (typeof ORDER)[number];
  const Icon = ICONS[current] ?? SystemIcon;

  function cycleTheme() {
    const index = ORDER.indexOf(current);
    setTheme(ORDER[(index + 1) % ORDER.length]);
  }

  return (
    <button
      aria-label={`${t(current)}. ${t("action")}`}
      className="relative inline-flex size-11 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition hover:bg-[var(--surface-strong)]"
      onClick={cycleTheme}
      type="button"
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={current}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center"
          exit={{ opacity: 0, scale: 0.7 }}
          initial={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Icon className="size-5" />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
