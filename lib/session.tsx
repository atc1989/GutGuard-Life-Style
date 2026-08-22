"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { persistProfile } from "@/lib/actions/member";
import {
  createDefaultSession,
  type FunnelPhase,
  type MockSession,
} from "@/lib/mock/seed";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const STORAGE_KEY = "gg-lifestyle-session";
const EVENT_KEY = "gg-lifestyle-session";

type SessionContextValue = {
  session: MockSession;
  ready: boolean;
  update: (patch: Partial<MockSession>) => void;
  setPhase: (phase: FunnelPhase) => void;
  reset: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function parseSession(raw: string | null): MockSession {
  if (!raw) return createDefaultSession();
  try {
    return { ...createDefaultSession(), ...JSON.parse(raw) } as MockSession;
  } catch {
    return createDefaultSession();
  }
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(EVENT_KEY, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT_KEY, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return null;
}

function writeSession(next: MockSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT_KEY));
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const session = parseSession(raw);
  const ready = raw !== null || typeof window !== "undefined";

  const update = useCallback((patch: Partial<MockSession>) => {
    const next = { ...parseSession(getSnapshot()), ...patch };
    writeSession(next);
    if (isSupabaseConfigured()) {
      void persistProfile({
        name: patch.name,
        mobile: patch.mobile,
        email: patch.email,
        phase: patch.phase,
        claimed: patch.claimed,
        points: patch.points,
        pending: patch.pending,
        banked: patch.banked,
        daysLeft: patch.daysLeft,
        capsulesPerDay: patch.capsulesPerDay,
        telegram: patch.telegram,
        facebook: patch.facebook,
        notifications: patch.notifications,
        welcomeSeen: patch.welcomeSeen,
      });
    }
  }, []);

  const setPhase = useCallback((phase: FunnelPhase) => {
    const current = parseSession(getSnapshot());
    const claimed =
      phase === "claimed" || phase === "nearly" || phase === "member"
        ? true
        : current.claimed;
    writeSession({ ...current, phase, claimed });
    if (isSupabaseConfigured()) {
      void persistProfile({ phase, claimed });
    }
  }, []);

  const reset = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT_KEY));
  }, []);

  const value = useMemo(
    () => ({ session, ready, update, setPhase, reset }),
    [session, ready, update, setPhase, reset],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
