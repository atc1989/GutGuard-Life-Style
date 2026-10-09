import Link from "next/link";
import type { ReactNode } from "react";
import { AdminTabs } from "@/components/admin/AdminTabs";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="gg-admin">
      <header className="gg-admin__hero">
        <p className="gg-eyebrow">Gutguard Lifestyle</p>
        <h1 className="gg-heading" style={{ fontSize: 36, marginTop: 8 }}>
          Admin
        </h1>
        <p className="gg-help" style={{ marginTop: 8 }}>
          Users, orders, and stories — operators only.
        </p>
        <p style={{ marginTop: 12 }}>
          <Link href="/" className="gg-link gg-link--row">
            ← Back to site
          </Link>
        </p>
      </header>
      <AdminTabs />
      <div className="gg-admin__panel">{children}</div>
    </div>
  );
}
