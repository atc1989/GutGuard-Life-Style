import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AdminGate = {
  userId: string;
};

/**
 * Defense-in-depth for `/admin/*`. Uses the cookie client + `lifestyle_is_admin()`.
 * Does not import the service-role client.
 */
export async function requireAdmin(): Promise<AdminGate | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/denied?reason=signed-out");
  }

  const { data, error } = await supabase.rpc("lifestyle_is_admin");
  if (error || !data) {
    redirect("/denied?reason=forbidden");
  }

  return { userId: user.id };
}
