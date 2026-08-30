"use client";

import { usePathname } from "next/navigation";
import { BottomBar } from "@/components/shell/BottomBar";
import { Masthead } from "@/components/shell/Masthead";
import { Sidebar } from "@/components/shell/Sidebar";
import { MemberOverlays } from "@/components/overlays/MemberOverlays";
import type { ReactNode } from "react";

export function MemberShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="gg-frame">
      <Sidebar />
      <div className="gg-content">
        <Masthead />
        {/* Only the page body crossfades; the chrome around it stays mounted. */}
        <div className="gg-content__body gg-page" key={pathname}>
          {children}
        </div>
      </div>
      <BottomBar />
      <MemberOverlays />
    </div>
  );
}
