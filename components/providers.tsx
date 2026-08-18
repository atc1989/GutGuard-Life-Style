"use client";

import { OverlayProvider } from "@/lib/overlay-store";
import { SessionProvider } from "@/lib/session";
import { ToastProvider } from "@/lib/toast";
import { DemoStrip } from "@/components/lifestyle/DemoStrip";
import { ToastViewport } from "@/components/ui/Toast";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <OverlayProvider>
        <ToastProvider>
          {children}
          <ToastViewport />
          {process.env.NODE_ENV === "development" ? <DemoStrip /> : null}
        </ToastProvider>
      </OverlayProvider>
    </SessionProvider>
  );
}
