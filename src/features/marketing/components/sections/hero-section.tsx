import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { getHeroStats } from "@/features/content/lib/content-repository";
import { CompassIcon, EyeIcon, SparkIcon } from "@/shared/icons/site-icons";
import { PrimaryButton } from "@/shared/ui/primary-button";
import { Reveal, RevealGroup, RevealItem } from "@/shared/ui/reveal";
import { SiteShell } from "@/shared/ui/site-shell";

function formatRomanNumeral(value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 3999) {
    return value.toLocaleString("en");
  }

  const numerals = [
    ["M", 1000],
    ["CM", 900],
    ["D", 500],
    ["CD", 400],
    ["C", 100],
    ["XC", 90],
    ["L", 50],
    ["XL", 40],
    ["X", 10],
    ["IX", 9],
    ["V", 5],
    ["IV", 4],
    ["I", 1],
  ] as const;

  let remaining = value;
  let result = "";

  for (const [numeral, amount] of numerals) {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  }

  return result;
}

export async function HeroSection() {
  const t = await getTranslations();
  const stats = await getHeroStats();
  const heroStats = [
    { value: formatRomanNumeral(stats.realmsMapped), labelKey: "realmsMapped" },
    { value: formatRomanNumeral(stats.entriesGathered), labelKey: "entriesGathered" },
    { value: formatRomanNumeral(stats.questionsOpen), labelKey: "questionsOpen" },
  ] as const;

  return (
    <section className="pb-20 pt-14 sm:pt-20">
      <SiteShell>
        <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
          <RevealGroup className="space-y-8">
            <RevealItem>
              <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)] shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
                <SparkIcon className="size-4 text-[var(--secondary)]" />
                <span>{t("hero.kicker")}</span>
              </div>
            </RevealItem>
            <RevealItem>
              <h1 className="font-display text-[clamp(3.5rem,9vw,7rem)] leading-[0.92] text-[var(--foreground)]">
                {t("hero.titleLead")}{" "}
                <span className="text-[var(--accent)]">{t("hero.titleAccent1")}</span>
                <br />
                {t("hero.titleConnector")}{" "}
                <span className="text-[var(--secondary)]">{t("hero.titleAccent2")}</span>
              </h1>
            </RevealItem>
            <RevealItem>
              <p className="max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
                {t("hero.description")}
              </p>
            </RevealItem>
            <RevealItem>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <PrimaryButton href="/journal">{t("hero.ctaPrimary")}</PrimaryButton>
                <PrimaryButton href="#journal" variant="ghost">
                  {t("hero.ctaSecondary")}
                </PrimaryButton>
              </div>
            </RevealItem>
            <RevealItem>
              <div className="flex items-start justify-between gap-2 border-t border-[var(--border)] pt-6 text-center">
                {heroStats.map((stat) => (
                  <div key={stat.labelKey} className="min-w-0 flex-1">
                    <div className="font-display text-3xl leading-none text-[var(--foreground)] sm:text-4xl">
                      {stat.value}
                    </div>
                    <div className="mt-2 text-[0.58rem] uppercase leading-tight tracking-[0.12em] text-[var(--muted)] sm:text-xs sm:tracking-[0.2em]">
                      {t(`stats.${stat.labelKey}`)}
                    </div>
                  </div>
                ))}
              </div>
            </RevealItem>
          </RevealGroup>

          <Reveal className="relative">
            <div className="absolute inset-x-12 bottom-0 top-8 rounded-[2rem] bg-[linear-gradient(180deg,rgba(107,92,165,0.18),rgba(74,124,157,0.08))] blur-3xl" />
            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_32px_90px_rgba(0,0,0,0.4)]">
                <Image
                  alt={t("hero.imageAlt")}
                  className="aspect-[4/5] w-full rounded-[1.4rem] object-cover"
                  height={1200}
                  priority
                  src="/media/ImageWithFallback.png"
                  width={960}
                />
              </div>

              <div className="absolute -bottom-6 -left-4 max-w-[17rem] rounded-[1.5rem] border border-white/10 bg-[rgba(16,20,28,0.95)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,var(--accent),var(--secondary))] text-white">
                    <CompassIcon className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-100">
                      {t("hero.currentlyLabel")}
                    </div>
                    <div className="text-sm text-stone-400">
                      {t("hero.currentlyValue")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 top-8 rounded-full border border-white/12 bg-black/30 px-4 py-3 text-sm text-stone-300 shadow-[0_12px_50px_rgba(0,0,0,0.24)] backdrop-blur">
                <span className="inline-flex items-center gap-2">
                  <EyeIcon className="size-4 text-[var(--sand)]" />
                  {t("hero.observationMode")}
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </SiteShell>
    </section>
  );
}
