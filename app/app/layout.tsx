import { MemberShell } from "@/components/shell/MemberShell";
import type { ReactNode } from "react";

export default function MemberLayout({ children }: { children: ReactNode }) {
  return <MemberShell>{children}</MemberShell>;
}
