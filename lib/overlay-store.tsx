"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { OverlayId } from "@/lib/mock/seed";

type OverlayContextValue = {
  overlay: OverlayId;
  open: (id: Exclude<OverlayId, null>) => void;
  close: () => void;
};

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<OverlayId>(null);

  const open = useCallback((id: Exclude<OverlayId, null>) => {
    setOverlay(id);
  }, []);

  const close = useCallback(() => setOverlay(null), []);

  const value = useMemo(
    () => ({ overlay, open, close }),
    [overlay, open, close],
  );

  return (
    <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>
  );
}

export function useOverlay() {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error("useOverlay must be used within OverlayProvider");
  return ctx;
}
