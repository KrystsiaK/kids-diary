import Link from "next/link";

import { loginAction } from "@/features/admin/actions/auth";
import { BrandMark } from "@/shared/ui/brand-mark";
import { SiteShell } from "@/shared/ui/site-shell";

type AdminLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = typeof params.error === "string" ? params.error : null;
  const logout = params.logout === "1";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0a0e14_0%,#0d1117_100%)] text-stone-100">
      <SiteShell className="flex min-h-screen items-center py-10">
        <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/8 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)] sm:p-8">
          <div className="flex items-center gap-3 border-b border-white/8 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <BrandMark showTagline={false} size="lg" />
              </div>
              <div className="mt-3 font-display text-3xl text-white">Admin Atlas</div>
              <div className="text-xs uppercase tracking-[0.22em] text-stone-500">
                Secure editorial access
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <h1 className="font-display text-5xl leading-none text-white">
                Sign in to the control room
              </h1>
              <p className="mt-3 text-base leading-7 text-stone-400">
                The admin area is now protected by an encrypted server-side
                session cookie. Use the deployment password to continue.
              </p>
            </div>

            {(error || logout) && (
              <div
                className={`rounded-[1.4rem] border px-4 py-3 text-sm ${
                  error
                    ? "border-rose-500/20 bg-rose-500/10 text-rose-100"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
                }`}
              >
                {error
                  ? "Incorrect password. Check ADMIN_PASSWORD and try again."
                  : "You have been signed out."}
              </div>
            )}

            <form action={loginAction} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm text-stone-300">Admin password</span>
                <input
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-600"
                  name="password"
                  placeholder="Enter the deployment password"
                  required
                  type="password"
                />
              </label>

              <button
                className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color-mix(in_oklab,var(--accent)_82%,white)]"
                type="submit"
              >
                Enter admin
              </button>
            </form>

            <div className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-6 text-stone-400">
              Keep <code className="text-stone-200">AUTH_SECRET</code> and{" "}
              <code className="text-stone-200">ADMIN_PASSWORD</code> set in
              Railway before publishing this environment.
            </div>

            <Link
              className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200 transition hover:bg-white/10"
              href="/"
            >
              Return to public site
            </Link>
          </div>
        </div>
      </SiteShell>
    </div>
  );
}
