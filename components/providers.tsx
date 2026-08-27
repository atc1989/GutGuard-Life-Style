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
  return (
    <div className="gg-page" key={pathname}>
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
