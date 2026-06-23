"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Link } from "@/i18n/navigation";

const COOKIE_NOTICE_KEY = "cookie-notice-dismissed";

export function CookieNotice() {
  const t = useTranslations("cookie");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed =
      typeof window !== "undefined" &&
      window.localStorage.getItem(COOKIE_NOTICE_KEY) === "true";

    const timer = window.setTimeout(() => {
      if (!dismissed) {
        setVisible(true);
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] px-4 sm:px-6">
      <div className="pointer-events-auto mx-auto flex max-w-4xl flex-col gap-4 rounded-[1.7rem] border border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_94%,transparent)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            {t("badge")}
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            {t("body")}{" "}
            <Link className="text-[var(--foreground)] underline decoration-[var(--foreground)]/30 underline-offset-4" href="/privacy">
              {t("privacyLink")}
            </Link>
            .
          </p>
        </div>

        <button
          className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[color-mix(in_oklab,var(--accent)_82%,white)]"
          onClick={() => {
            window.localStorage.setItem(COOKIE_NOTICE_KEY, "true");
            setVisible(false);
          }}
          type="button"
        >
          {t("understood")}
        </button>
      </div>
    </div>
  );
}
