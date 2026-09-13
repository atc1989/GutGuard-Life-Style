import assert from "node:assert/strict";
import test from "node:test";
import {
  readWelcomeSeenPreference,
  shouldShowWelcomeOverlay,
  WELCOME_SEEN_KEY,
  writeWelcomeSeenPreference,
} from "./welcome.ts";

test("first-run guests see the welcome overlay", () => {
  assert.equal(
    shouldShowWelcomeOverlay({ mockWelcomeSeen: false, storedPreference: false }),
    true,
  );
});

test("a dismissed overlay stays dismissed without becoming authorization", () => {
  assert.equal(
    shouldShowWelcomeOverlay({ mockWelcomeSeen: true, storedPreference: false }),
    false,
  );
  assert.equal(
    shouldShowWelcomeOverlay({ mockWelcomeSeen: false, storedPreference: true }),
    false,
  );
});

test("the preference key is not the member session", () => {
  const store = new Map<string, string>();
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };

  assert.equal(readWelcomeSeenPreference(storage), false);
  writeWelcomeSeenPreference(storage);
  assert.equal(store.get(WELCOME_SEEN_KEY), "1");
  assert.equal(readWelcomeSeenPreference(storage), true);
});
