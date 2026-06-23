"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

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
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    function updateHeaderVisibility() {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollYRef.current;

      if (menuOpen || currentScrollY < 24) {
        setHeaderHidden(false);
      } else if (scrollDelta > 8 && currentScrollY > 140) {
        setHeaderHidden(true);
      } else if (scrollDelta < -8) {
        setHeaderHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
      tickingRef.current = false;
    }

    function handleScroll() {
      if (tickingRef.current) {
        return;
      }

      tickingRef.current = true;
      requestAnimationFrame(updateHeaderVisibility);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_72%,transparent)] backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none ${
        headerHidden ? "-translate-y-[calc(100%+1px)]" : "translate-y-0"
      }`}
    >
      <SiteShell className="relative py-3">
        <div className="flex min-h-20 items-center justify-between gap-3">
          <Link
            className="min-w-0 flex items-center gap-3 text-[var(--foreground)]"
            href="/"
            onClick={() => setMenuOpen(false)}
          >
            <div className="[&_.brand-tagline]:hidden lg:[&_.brand-tagline]:block">
              <BrandMark size="sm" />
            </div>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-3 lg:flex">
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
            <div className="hidden lg:block">
              <PrimaryButton href="/admin" variant="ghost">
                {t("nav.openAdmin")}
              </PrimaryButton>
            </div>
            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? t("menu.close") : t("menu.open")}
              className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition hover:bg-[var(--surface-strong)] lg:hidden"
              onClick={() => setMenuOpen((current) => !current)}
              type="button"
            >
              {menuOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="absolute inset-x-5 top-full z-50 mt-3 rounded-[1.8rem] border border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_96%,transparent)] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:inset-x-8 lg:hidden">
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

            <div className="mt-3 lg:hidden">
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
