import { redirect } from "next/navigation";
import { MemberShell } from "@/components/shell/MemberShell";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ReactNode } from "react";

export default async function MemberLayout({ children }: { children: ReactNode }) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/");
  }
  return <MemberShell>{children}</MemberShell>;
}
