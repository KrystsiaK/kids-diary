import type { ReactNode } from "react";

import { CookieNotice } from "@/features/legal/components/cookie-notice";
import { MarketingFooter } from "@/features/marketing/components/marketing-footer";
import { MarketingHeader } from "@/features/marketing/components/marketing-header";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_top,_rgba(107,92,165,0.28),_transparent_52%),radial-gradient(circle_at_75%_18%,_rgba(74,124,157,0.2),_transparent_28%)]" />
      <MarketingHeader />
      <main className="relative">{children}</main>
      <MarketingFooter />
      <CookieNotice />
    </div>
  );
}
