"use client";

import { createContext, useContext, type ReactNode } from "react";
import { memberChromeForUi, type MemberChrome } from "@/lib/lifestyle/member-chrome";
import { useSession } from "@/lib/session";

const MemberChromeContext = createContext<MemberChrome | null>(null);

export function MemberChromeProvider({
  chrome,
  children,
}: {
  chrome: MemberChrome | null;
  children: ReactNode;
}) {
  return <MemberChromeContext.Provider value={chrome}>{children}</MemberChromeContext.Provider>;
}

export function useMemberChrome(): MemberChrome {
  const chrome = useContext(MemberChromeContext);
  const { session } = useSession();
  return memberChromeForUi(chrome, session);
}
