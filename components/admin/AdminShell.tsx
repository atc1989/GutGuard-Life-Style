import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="gg-admin">
      <header className="gg-admin__mast">
        <p className="gg-eyebrow">Operations</p>
        <AdminNav />
      </header>
      {children}
    </div>
  );
}
