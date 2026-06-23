"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Link, usePathname } from "@/i18n/navigation";
import { mainNavigation } from "@/shared/config/site-content";
import { CloseIcon, MenuIcon } from "@/shared/icons/site-icons";
import { BrandMark } from "@/shared/ui/brand-mark";
import { LanguageSwitcher } from "@/shared/ui/language-switcher";
import { PrimaryButton } from "@/shared/ui/primary-button";
import { SiteShell } from "@/shared/ui/site-shell";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

export function MarketingHeader() {
  const t = useTranslations();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_72%,transparent)] backdrop-blur-xl">
      <SiteShell className="relative py-3">
        <div className="flex min-h-20 items-center justify-between gap-3">
          <Link
            className="min-w-0 flex items-center gap-3 text-[var(--foreground)]"
            href="/"
            onClick={() => setMenuOpen(false)}
          >
            <div className="max-sm:[&_.brand-tagline]:hidden">
              <BrandMark size="sm" />
            </div>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-3 md:flex">
            {mainNavigation.map((item) => (
              <Link
                key={item.key}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  pathname === item.href
                    ? "bg-[var(--surface-strong)] text-[var(--foreground)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                }`}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="hidden sm:block">
              <PrimaryButton href="/admin" variant="ghost">
                {t("nav.openAdmin")}
              </PrimaryButton>
            </div>
            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? t("menu.close") : t("menu.open")}
              className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition hover:bg-[var(--surface-strong)] md:hidden"
              onClick={() => setMenuOpen((current) => !current)}
              type="button"
            >
              {menuOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="absolute inset-x-5 top-full z-50 mt-3 rounded-[1.8rem] border border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_96%,transparent)] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:inset-x-8 md:hidden">
            <nav aria-label="Mobile primary" className="grid gap-2">
              {mainNavigation.map((item) => (
                <Link
                  key={item.key}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    pathname === item.href
                      ? "bg-[var(--surface-strong)] text-[var(--foreground)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                  }`}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </nav>

            <div className="mt-3 sm:hidden">
              <PrimaryButton href="/admin" variant="ghost">
                {t("nav.openAdmin")}
              </PrimaryButton>
            </div>
          </div>
        )}
      </SiteShell>
    </header>
  );
}