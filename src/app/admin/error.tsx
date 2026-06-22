"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Admin route error", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5 py-12 text-stone-100">
      <div className="w-full max-w-xl rounded-[2rem] border border-rose-500/20 bg-white/[0.04] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.4)] sm:p-10">
        <div className="text-xs uppercase tracking-[0.24em] text-rose-300/70">
          Admin error
        </div>
        <h1 className="mt-4 font-display text-4xl text-white">
          The control room hit a problem
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-300">
          Your action may not have been completed. Refresh the admin data and try
          again. If the problem repeats, use the support code below in Railway logs.
        </p>
        {error.digest && (
          <div className="mt-5 rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-xs text-stone-400">
            Support code: {error.digest}
          </div>
        )}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            onClick={() => unstable_retry()}
            type="button"
          >
            Try again
          </button>
          <a
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-stone-200 transition hover:bg-white/10"
            href="/admin"
          >
            Reload admin
          </a>
        </div>
      </div>
    </main>
  );
}
