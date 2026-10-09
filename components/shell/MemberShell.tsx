"use client";

import { usePathname } from "next/navigation";
import { MemberTabs } from "@/components/shell/MemberTabs";
import { MemberTopBar } from "@/components/shell/MemberTopBar";
import { MemberOverlays } from "@/components/overlays/MemberOverlays";
import { MemberChromeProvider } from "@/lib/lifestyle/member-chrome-context";
import type { MemberChrome } from "@/lib/lifestyle/member-chrome";
import type { ReactNode } from "react";

/** UI Library app shell: TopBar `app` + underline Tabs over one content well. */
export function MemberShell({
  children,
  chrome,
}: {
  children: ReactNode;
  chrome: MemberChrome | null;
}) {
  const pathname = usePathname();
  return (
    <MemberChromeProvider chrome={chrome}>
      <div className="gg-app">
        <MemberTopBar />
        <MemberTabs />
        {/* Only the page body crossfades; the chrome around it stays mounted. */}
        <main className="gg-app__main gg-page" key={pathname}>
          {children}
        </main>
        <MemberOverlays />
      </div>
    </MemberChromeProvider>
  );
}
