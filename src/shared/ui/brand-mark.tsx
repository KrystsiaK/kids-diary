import { AtlasMarkIcon } from "@/shared/icons/site-icons";

type BrandMarkProps = {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
};

const sizeClasses = {
  sm: {
    shell: "size-10",
    icon: "size-5",
    title: "text-xl",
    subtitle: "text-[0.68rem]",
  },
  md: {
    shell: "size-11",
    icon: "size-5.5",
    title: "text-2xl",
    subtitle: "text-[0.72rem]",
  },
  lg: {
    shell: "size-12",
    icon: "size-6",
    title: "text-3xl",
    subtitle: "text-xs",
  },
};

export function BrandMark({
  size = "sm",
  showTagline = true,
}: BrandMarkProps) {
  const styles = sizeClasses[size];

  return (
    <div className="flex items-center gap-3">
      <span
        className={`relative flex ${styles.shell} items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(107,92,165,0.28),rgba(74,124,157,0.12)_52%,rgba(255,255,255,0.03)_100%)] text-[var(--accent-foreground)] shadow-[0_10px_30px_rgba(0,0,0,0.24)]`}
      >
        <span className="absolute inset-[1px] rounded-full border border-white/10" />
        <AtlasMarkIcon className={`${styles.icon} relative z-10 text-white`} />
      </span>
      <div>
        <div className={`font-display leading-none text-stone-100 ${styles.title}`}>
          Explorer&apos;s Journal
        </div>
        {showTagline && (
          <div
            className={`brand-tagline mt-1 uppercase tracking-[0.24em] text-stone-400 ${styles.subtitle}`}
          >
            Atlas of wonder
          </div>
        )}
      </div>
    </div>
  );
}
