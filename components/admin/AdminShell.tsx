import Link from "next/link";
import type { ReactNode } from "react";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="gg-admin">
      <header className="gg-admin__mast">
        <p className="gg-eyebrow">Operations</p>
        <h1 className="gg-admin__title">Member desk</h1>
        <p className="gg-admin__lede">
          Track registration, mobile credentials, and BASE or GEMA unlocks.
        </p>
        <nav className="gg-admin-nav" aria-label="Admin">
          <Link href="/admin/users" aria-current="page">
            Users
          </Link>
          <Link href="/app/health">Member app</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
