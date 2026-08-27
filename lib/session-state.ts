import { createNewMemberSession, type MockSession } from "@/lib/mock/seed";

export function createGuestSession(): MockSession {
  return createNewMemberSession({
    name: "",
    mobile: "",
    email: "",
    sponsor: "",
    team: "",
    cardNo: "",
    phase: "landing",
    claimed: false,
  });
}

export function parseLifestyleSession(
  raw: string | null,
  supabaseConfigured: boolean,
): MockSession {
  if (supabaseConfigured) {
    return createGuestSession();
  }
  if (!raw) return createNewMemberSession();
  try {
    return { ...createNewMemberSession(), ...JSON.parse(raw) } as MockSession;
  } catch {
    return createNewMemberSession();
  }
}

export function shouldPersistMockSession(supabaseConfigured: boolean): boolean {
  return !supabaseConfigured;
}
