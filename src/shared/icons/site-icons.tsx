import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.6,
  viewBox: "0 0 24 24",
};

export function SparkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.5 14.6 9.4 21.5 12l-6.9 2.6L12 21.5l-2.6-6.9L2.5 12l6.9-2.6L12 2.5Z" />
      <path d="M19 3v4" />
      <path d="M21 5h-4" />
      <path d="M4 16v3" />
      <path d="M5.5 17.5h-3" />
    </svg>
  );
}

export function AtlasMarkIcon(props: IconProps) {
  return (
    <svg
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        cx="24"
        cy="24"
        r="19"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <circle
        cx="24"
        cy="24"
        r="13.5"
        stroke="currentColor"
        strokeDasharray="1.8 4.2"
        strokeLinecap="round"
        strokeOpacity="0.18"
        strokeWidth="1.2"
      />
      <path
        d="M16.5 33.5 24 14.5l7.5 19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
      <path
        d="M19.4 26.2h9.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      <path
        d="M24 14.5v22.3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeOpacity="0.72"
        strokeWidth="1.2"
      />
      <circle cx="24" cy="11" fill="currentColor" r="2.4" />
      <path
        d="m33.8 14.2 1.1 2.8 2.9 1.1-2.9 1.1-1.1 2.8-1.1-2.8-2.8-1.1 2.8-1.1 1.1-2.8Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
    </svg>
  );
}

export function CompassIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.3 6.1-6.1 2.3 2.3-6.1 6.1-2.3Z" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.8 12c2.1-4 5.3-6 9.2-6s7.1 2 9.2 6c-2.1 4-5.3 6-9.2 6s-7.1-2-9.2-6Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14 2.8A8.7 8.7 0 1 0 21.2 10 7.3 7.3 0 0 1 14 2.8Z" />
    </svg>
  );
}

export function OrbitIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <ellipse cx="12" cy="12" rx="9" ry="4.5" />
      <ellipse cx="12" cy="12" rx="4.5" ry="9" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}

export function WaveIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 7.5c1.3 1.1 2.7 1.7 4.5 1.7C11 9.2 11 6.8 14.5 6.8c1.8 0 3.2.6 4.5 1.7" />
      <path d="M3 12c1.3 1.1 2.7 1.7 4.5 1.7 3.5 0 3.5-2.4 7-2.4 1.8 0 3.2.6 4.5 1.7" />
      <path d="M3 16.5c1.3 1.1 2.7 1.7 4.5 1.7 3.5 0 3.5-2.4 7-2.4 1.8 0 3.2.6 4.5 1.7" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8.5h16" />
      <path d="M4 12h16" />
      <path d="M4 15.5h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}
