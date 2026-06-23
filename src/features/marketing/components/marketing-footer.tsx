import NextLink from "next/link";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { mainNavigation } from "@/shared/config/site-content";
import { BrandMark } from "@/shared/ui/brand-mark";
import { SiteShell } from "@/shared/ui/site-shell";

export async function MarketingFooter() {
  const t = await getTranslations();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-strong)] py-14">
      <SiteShell className="grid gap-10 text-center lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr] lg:text-left">
        <div>
          <div className="flex items-center justify-center gap-3 text-[var(--foreground)] lg:justify-start">
            <BrandMark showTagline={false} size="md" />
          </div>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--muted)] lg:mx-0">
            {t("footer.tagline")}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            {t("footer.copyright")}
          </p>
        </div>
        <div>
          <div className="mb-4 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            {t("footer.navigate")}
          </div>
          <div className="space-y-3">
            {mainNavigation.map((item) => (
              <Link
                key={item.key}
                className="block text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
                href={item.href}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-4 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            {t("footer.explore")}
          </div>
          <div className="space-y-3 text-sm text-[var(--muted)]">
            <p>{t("footer.exploreHome")}</p>
            <p>{t("footer.exploreArchive")}</p>
            <NextLink className="block text-[var(--muted)] transition hover:text-[var(--foreground)]" href="/admin">
              {t("footer.adminLink")}
            </NextLink>
          </div>
        </div>
        <div>
          <div className="mb-4 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            {t("footer.legal")}
          </div>
          <div className="space-y-3">
            <Link
              className="block text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
              href="/privacy"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              className="block text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
              href="/terms"
            >
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </SiteShell>
    </footer>
  );
}