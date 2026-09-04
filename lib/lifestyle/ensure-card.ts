import "server-only";

import {
  createIdentityAdminClient,
  ensurePersonRow,
  hasIdentityAdminCredentials,
  PERSON_SCHEMA,
} from "@/lib/one-account";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { cardMintPatch, isCardless, type CardRow } from "@/lib/lifestyle/card";

/**
 * Change 4 — the Lifestyle card, created on the first authenticated visit.
 *
 * `00 - Locks`: a new Auth user creates a person only. Every Auth user already
 * has a person row in `public.profiles` (Change 3's backfill), so first visit is
 * not an insert — it is filling in the card half of a row that exists with
 * `card_no` null. A member who arrives from OneGrinders gets a card built from
 * their guild name and never sees the register form (D13).
 *
 * Written with the service role where there is one. Two reasons: Change 3
 * revoked the whole-row UPDATE from `authenticated` and the corrective column
 * grant is still outstanding on Staging, so a member's own session may not be
 * able to write `card_no` there; and the card number needs a uniqueness retry,
 * which is not a member's business. Where no service key is configured it falls
 * back to the member's own session client, which is what the register upsert
 * always used.
 */

const MAX_MINT_ATTEMPTS = 5;

export type EnsureCardResult =
  | { ok: true; minted: boolean; cardNo?: string }
  | { ok: false; reason: EnsureCardFailure };

export type EnsureCardFailure =
  | "no-session"
  | "unconfigured"
  | "read-failed"
  | "write-failed"
  /** Another identity already holds this email or mobile. */
  | "duplicate"
  | "card-number-exhausted"
  | "unavailable";

/** A unique violation on the card number is a retry; anything else is not. */
function isCardNumberCollision(error: { message?: string; details?: string } | null) {
  const text = `${error?.message ?? ""} ${error?.details ?? ""}`.toLowerCase();
  return text.includes("card_no");
}

type CardClient = {
  from(table: string): {
    select(columns: string): {
      eq(
        column: string,
        value: string,
      ): {
        maybeSingle<T>(): PromiseLike<{
          data: T | null;
          error: { code?: string; message?: string } | null;
        }>;
      };
    };
    update(patch: Record<string, unknown>): {
      eq(
        column: string,
        value: string,
      ): {
        is(
          column: string,
          value: null,
        ): {
          select(columns: string): PromiseLike<{
            data: { card_no: string }[] | null;
            error: { code?: string; message?: string; details?: string } | null;
          }>;
        };
      };
    };
  };
};

const CARD_COLUMNS = "name, full_name, mobile, phone, email, card_no";

export async function ensureLifestyleCard(input: {
  userId: string | null | undefined;
  name?: string | null;
  mobile?: string | null;
  email?: string | null;
}): Promise<EnsureCardResult> {
  const userId = input.userId;
  if (!userId) return { ok: false, reason: "no-session" };
  if (!isSupabaseConfigured()) return { ok: false, reason: "unconfigured" };

  try {
    // A card without a person behind it is the thing 00 - Locks forbids, and a
    // brand-new guild member has no person row yet — the Staging trigger writes
    // gema.profiles only.
    await ensurePersonRow(userId, { fullName: input.name, email: input.email });

    const admin = hasIdentityAdminCredentials();
    const client = (
      admin ? createIdentityAdminClient(PERSON_SCHEMA) : await createClient()
    ) as unknown as CardClient;

    const { data: row, error: readError } = await client
      .from("profiles")
      .select(CARD_COLUMNS)
      .eq("id", userId)
      .maybeSingle<CardRow>();

    if (readError) {
      console.warn("[lifestyle] could not read the card row", {
        userId,
        code: readError.code,
        message: readError.message,
      });
      return { ok: false, reason: "read-failed" };
    }

    if (!isCardless(row)) {
      return { ok: true, minted: false, cardNo: row?.card_no ?? undefined };
    }

    for (let attempt = 0; attempt < MAX_MINT_ATTEMPTS; attempt += 1) {
      const patch = cardMintPatch({
        userId,
        row,
        name: input.name,
        mobile: input.mobile,
        attempt,
      });

      const { data, error } = await client
        .from("profiles")
        .update(patch)
        // The guard, not a filter: only a row still without a card is minted,
        // so two visits racing produce one card and the loser is a no-op.
        .eq("id", userId)
        .is("card_no", null)
        .select("card_no");

      if (!error) {
        const cardNo = data?.[0]?.card_no;
        // No row came back: either another visit won the race, or this row still
        // carries the legacy placeholder, which only the migration can clear.
        if (!cardNo) return { ok: true, minted: false };
        return { ok: true, minted: true, cardNo };
      }

      // 23505 on the card number is a collision: re-derive and try again. On
      // email or mobile it is a different identity holding that detail, which
      // register has to report rather than retry.
      if (error.code === "23505" && !isCardNumberCollision(error)) {
        return { ok: false, reason: "duplicate" };
      }
      if (error.code !== "23505") {
        console.warn("[lifestyle] could not mint the card", {
          userId,
          code: error.code,
          message: error.message,
        });
        return { ok: false, reason: "write-failed" };
      }
    }

    console.warn("[lifestyle] card number collided on every attempt", { userId });
    return { ok: false, reason: "card-number-exhausted" };
  } catch (error) {
    // First visit must never be the reason a page fails to render.
    console.warn("[lifestyle] card check skipped", {
      userId,
      message: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, reason: "unavailable" };
  }
}

/**
 * The first-visit hook. Every authenticated Lifestyle surface calls this before
 * it renders: the door card, and the member app shell. A member whose session
 * was opened on GEMA or Academy still lands here with a card.
 */
export async function ensureCardForCurrentUser(): Promise<EnsureCardResult> {
  if (!isSupabaseConfigured()) return { ok: false, reason: "unconfigured" };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, reason: "no-session" };
    return await ensureLifestyleCard({ userId: user.id, email: user.email ?? null });
  } catch (error) {
    console.warn("[lifestyle] first-visit card check skipped", {
      message: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, reason: "unavailable" };
  }
}
