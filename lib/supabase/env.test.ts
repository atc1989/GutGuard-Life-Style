import assert from "node:assert/strict";
import test from "node:test";
import { isSupabaseConfigured } from "./env.ts";

const tracked = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const snapshot: Record<string, string | undefined> = {};

function remember() {
  for (const key of tracked) {
    snapshot[key] = process.env[key];
    delete process.env[key];
  }
}

function restore() {
  for (const key of tracked) {
    const value = snapshot[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

test("Staging URL with no key is unconfigured", (t) => {
  remember();
  t.after(restore);
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fxdsnacuonfvutdquogb.supabase.co";
  assert.equal(isSupabaseConfigured(), false);
});

test("copied placeholder keys do not count as configured", (t) => {
  remember();
  t.after(restore);
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fxdsnacuonfvutdquogb.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "your-publishable-key";
  assert.equal(isSupabaseConfigured(), false);
});

test("real URL and key enable cookie Auth", (t) => {
  remember();
  t.after(restore);
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fxdsnacuonfvutdquogb.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOi-test";
  assert.equal(isSupabaseConfigured(), true);
});
