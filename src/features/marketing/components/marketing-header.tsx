"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { mainNavigation } from "@/shared/config/site-content";
import { CloseIcon, MenuIcon } from "@/shared/icons/site-icons";
import { BrandMark } from "@/shared/ui/brand-mark";
import { PrimaryButton } from "@/shared/ui/primary-button";
import { SiteShell } from "@/shared/ui/site-shell";

export function MarketingHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[rgba(10,14,20,0.72)] backdrop-blur-xl">
      <SiteShell className="py-3">
        <div className="flex min-h-20 items-center justify-between gap-3">
          <Link
            className="min-w-0 flex items-center gap-3 text-stone-100"
            href="/"
            onClick={() => setMenuOpen(false)}
          >
            <div className="max-sm:[&_div:last-child>div:last-child]:hidden">
              <BrandMark size="sm" />
            </div>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-3 md:flex">
            {mainNavigation.map((item) => (
              <Link
                key={item.label}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  pathname === item.href
                    ? "bg-white/10 text-white"
                    : "text-stone-400 hover:bg-white/5 hover:text-stone-100"
                }`}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <PrimaryButton href="/admin" variant="ghost">
                Open admin
              </PrimaryButton>
            </div>
            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/12 bg-white/5 text-stone-100 transition hover:bg-white/10 md:hidden"
              onClick={() => setMenuOpen((current) => !current)}
              type="button"
            >
              {menuOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mt-3 rounded-[1.8rem] border border-white/8 bg-[rgba(9,13,20,0.96)] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.3)] md:hidden">
            <nav aria-label="Mobile primary" className="grid gap-2">
              {mainNavigation.map((item) => (
                <Link
                  key={item.label}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    pathname === item.href
                      ? "bg-white/10 text-white"
                      : "text-stone-300 hover:bg-white/5 hover:text-white"
                  }`}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-3 sm:hidden">
              <PrimaryButton href="/admin" variant="ghost">
                Open admin
              </PrimaryButton>
            </div>
          </div>
        )}
      </SiteShell>
    </header>
  );
}
