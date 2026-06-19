import Link from "next/link";
import type { ReactNode } from "react";

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
      "border-white/12 bg-white/5 text-stone-100 hover:bg-white/10",
  };

  return (
    <Link className={`${base} ${variants[variant]}`} href={href}>
      {children}
    </Link>
  );
}
