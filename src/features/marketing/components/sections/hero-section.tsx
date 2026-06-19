import Image from "next/image";

import { heroStats } from "@/shared/config/site-content";
import { CompassIcon, EyeIcon, SparkIcon } from "@/shared/icons/site-icons";
import { PrimaryButton } from "@/shared/ui/primary-button";
import { Reveal, RevealGroup, RevealItem } from "@/shared/ui/reveal";
import { SiteShell } from "@/shared/ui/site-shell";

export function HeroSection() {
  return (
    <section className="pb-20 pt-14 sm:pt-20">
      <SiteShell>
        <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
          <RevealGroup className="space-y-8">
            <RevealItem>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-300 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
                <SparkIcon className="size-4 text-[var(--secondary)]" />
                <span>Curator of curiosities</span>
              </div>
            </RevealItem>
            <RevealItem>
              <h1 className="font-display text-[clamp(3.5rem,9vw,7rem)] leading-[0.92] text-white">
                I collect <span className="text-[var(--accent)]">moments</span>
                <br />
                and <span className="text-[var(--secondary)]">mysteries</span>
              </h1>
            </RevealItem>
            <RevealItem>
              <p className="max-w-2xl text-lg leading-8 text-stone-400 sm:text-xl">
                This journal is part field atlas, part observatory, part studio
                for the questions that keep glowing after the expedition ends.
              </p>
            </RevealItem>
            <RevealItem>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <PrimaryButton href="/journal">Begin exploring</PrimaryButton>
                <PrimaryButton href="/admin" variant="ghost">
                  Enter the archive room
                </PrimaryButton>
              </div>
            </RevealItem>
            <RevealItem>
              <div className="grid gap-4 border-t border-white/8 pt-6 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label}>
                    <div className="font-display text-4xl text-white">{stat.value}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-500">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </RevealItem>
          </RevealGroup>

          <Reveal className="relative">
            <div className="absolute inset-x-12 bottom-0 top-8 rounded-[2rem] bg-[linear-gradient(180deg,rgba(107,92,165,0.18),rgba(74,124,157,0.08))] blur-3xl" />
            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-[0_32px_90px_rgba(0,0,0,0.4)]">
                <Image
                  alt="Explorer on horseback in a dramatic landscape"
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
                      Currently
                    </div>
                    <div className="text-sm text-stone-400">
                      Somewhere between maps
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 top-8 rounded-full border border-white/12 bg-black/30 px-4 py-3 text-sm text-stone-300 shadow-[0_12px_50px_rgba(0,0,0,0.24)] backdrop-blur">
                <span className="inline-flex items-center gap-2">
                  <EyeIcon className="size-4 text-[var(--sand)]" />
                  Quiet observation mode
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </SiteShell>
    </section>
  );
}
