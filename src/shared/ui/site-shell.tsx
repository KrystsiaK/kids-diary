import type { ReactNode } from "react";

type SiteShellProps = {
  children: ReactNode;
  className?: string;
};

export function SiteShell({ children, className }: SiteShellProps) {
  return (
    <div
      className={`mx-auto w-full max-w-full min-w-0 px-5 sm:px-8 lg:px-10 2xl:max-w-7xl ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
