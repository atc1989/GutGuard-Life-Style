"use client";

import { BottomBar } from "@/components/shell/BottomBar";
import { Masthead } from "@/components/shell/Masthead";
import { Sidebar } from "@/components/shell/Sidebar";
import { MemberOverlays } from "@/components/overlays/MemberOverlays";
import type { ReactNode } from "react";

export function MemberShell({ children }: { children: ReactNode }) {
  return (
    <div className="gg-frame">
      <Sidebar />
      <div className="gg-content">
        <Masthead />
        <div className="gg-content__body">{children}</div>
      </div>
      <BottomBar />
      <MemberOverlays />
    </div>
  );
}
