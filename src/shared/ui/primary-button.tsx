import NextLink from "next/link";
import type { ReactNode } from "react";

import { Link as LocaleLink } from "@/i18n/navigation";

type PrimaryButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "solid" | "ghost";
};

export function PrimaryButton({
  href,
  children,
  variant = "solid",
}: PrimaryButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-3 rounded-full border px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]";

  const variants = {
    solid:
      "border-transparent bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[color-mix(in_oklab,var(--accent)_82%,white)]",
    ghost:
      "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-strong)]",
  };

  const className = `${base} ${variants[variant]}`;

  // The admin control room lives outside the [locale] segment, so it must
  // never be prefixed with a locale (e.g. /ru/admin doesn't exist). Same-page
  // anchors aren't routes either, so they bypass locale-aware resolution too.
  if (href.startsWith("/admin") || href.startsWith("#")) {
    return (
      <NextLink className={className} href={href}>
        {children}
      </NextLink>
    );
  }

  return (
    <LocaleLink className={className} href={href}>
      {children}
    </LocaleLink>
  );
}
