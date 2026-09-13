export const WELCOME_SEEN_KEY = "gg-welcome-seen";

export function shouldShowWelcomeOverlay({
  mockWelcomeSeen,
  storedPreference,
}: {
  mockWelcomeSeen: boolean;
  storedPreference: boolean;
}) {
  return !mockWelcomeSeen && !storedPreference;
}

export function readWelcomeSeenPreference(storage: Pick<Storage, "getItem"> | null) {
  return storage?.getItem(WELCOME_SEEN_KEY) === "1";
}

export function writeWelcomeSeenPreference(storage: Pick<Storage, "setItem"> | null) {
  storage?.setItem(WELCOME_SEEN_KEY, "1");
}
