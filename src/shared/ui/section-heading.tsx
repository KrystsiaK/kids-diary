import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  accent?: ReactNode;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  accent,
  align = "left",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <div
        className={`mb-5 inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[0.7rem] uppercase tracking-[0.28em] text-[var(--muted)] ${
          centered ? "justify-center" : ""
        }`}
      >
        {accent}
        <span>{eyebrow}</span>
      </div>
      <h2 className="font-display text-4xl leading-none text-[var(--foreground)] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg">
        {description}
      </p>
    </div>
  );
}
