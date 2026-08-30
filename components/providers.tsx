"use client";

import { usePathname } from "next/navigation";
import { OverlayProvider } from "@/lib/overlay-store";
import { SessionProvider } from "@/lib/session";
import { ToastProvider } from "@/lib/toast";
import { DemoStrip } from "@/components/lifestyle/DemoStrip";
import { ToastViewport } from "@/components/ui/Toast";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ReactNode } from "react";

function PageFade({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Key on the route group, not the full path. /app/* shares one MemberShell
  // (sidebar, masthead, bottom bar) that must survive tab switches — keying on
  // pathname here remounted the entire member chrome on every navigation.
  const group = pathname.startsWith("/app") ? "/app" : pathname;
  return (
    <div className="gg-page" key={group}>
      {children}
    </div>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <OverlayProvider>
        <ToastProvider>
          <PageFade>{children}</PageFade>
          <ToastViewport />
          {process.env.NODE_ENV === "development" && !isSupabaseConfigured() ? (
            <DemoStrip />
          ) : null}
        </ToastProvider>
      </OverlayProvider>
    </SessionProvider>
  );
}
