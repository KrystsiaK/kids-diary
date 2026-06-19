"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_NOTICE_KEY = "cookie-notice-dismissed";

export function CookieNotice() {
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
      <div className="pointer-events-auto mx-auto flex max-w-4xl flex-col gap-4 rounded-[1.7rem] border border-white/10 bg-[rgba(10,14,20,0.94)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
            Cookie notice
          </div>
          <p className="mt-2 text-sm leading-7 text-stone-300">
            This site uses essential cookies for secure admin access and may rely
            on hosting-level technical cookies or logs to keep the experience
            stable and safe. By continuing to browse, you acknowledge that use.
            Read more in the{" "}
            <Link className="text-white underline decoration-white/30 underline-offset-4" href="/privacy">
              privacy policy
            </Link>
            .
          </p>
        </div>

        <button
          className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color-mix(in_oklab,var(--accent)_82%,white)]"
          onClick={() => {
            window.localStorage.setItem(COOKIE_NOTICE_KEY, "true");
            setVisible(false);
          }}
          type="button"
        >
          Understood
        </button>
      </div>
    </div>
  );
}
