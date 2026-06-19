import Link from "next/link";

import { mainNavigation } from "@/shared/config/site-content";
import { BrandMark } from "@/shared/ui/brand-mark";
import { SiteShell } from "@/shared/ui/site-shell";

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/8 bg-black/30 py-14">
      <SiteShell className="grid gap-10 text-center lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr] lg:text-left">
        <div>
          <div className="flex items-center justify-center gap-3 text-stone-100 lg:justify-start">
            <BrandMark showTagline={false} size="md" />
          </div>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-stone-400 lg:mx-0">
            A personal atlas of curiosity, field notes, and strange little
            breakthroughs that deserve a second look.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-stone-500">
            Copyright © 2026 Explorer&apos;s Journal
          </p>
        </div>
        <div>
          <div className="mb-4 text-xs uppercase tracking-[0.24em] text-stone-500">
            Navigate
          </div>
          <div className="space-y-3">
            {mainNavigation.map((item) => (
              <Link
                key={item.label}
                className="block text-sm text-stone-300 transition hover:text-white"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-4 text-xs uppercase tracking-[0.24em] text-stone-500">
            Explore
          </div>
          <div className="space-y-3 text-sm text-stone-400">
            <p>Home curates the freshest discoveries from every section.</p>
            <p>Each archive leads to dedicated entries with full reading pages.</p>
            <Link className="block text-stone-300 transition hover:text-white" href="/admin">
              Go to admin control room
            </Link>
          </div>
        </div>
        <div>
          <div className="mb-4 text-xs uppercase tracking-[0.24em] text-stone-500">
            Legal
          </div>
          <div className="space-y-3">
            <Link
              className="block text-sm text-stone-300 transition hover:text-white"
              href="/privacy"
            >
              Privacy policy
            </Link>
            <Link
              className="block text-sm text-stone-300 transition hover:text-white"
              href="/terms"
            >
              Terms of use
            </Link>
          </div>
        </div>
      </SiteShell>
    </footer>
  );
}
