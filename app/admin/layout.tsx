import Link from "next/link";
import type { ReactNode } from "react";
import { AdminTabs } from "@/components/admin/AdminTabs";

/** DS Admin Shell: hero + horizontal Admin Tabs. Admin dialect — square. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="gg-admin">
      <header className="gg-admin__hero">
        <p className="gg-eyebrow">Gutguard Lifestyle</p>
        <h1 className="gg-admin__hero-title">Admin</h1>
        <p className="gg-help">Users, orders, and stories — operators only.</p>
        <Link href="/" className="gg-link gg-link--row">
          ← Back to site
        </Link>
      </header>
      <AdminTabs />
      <div className="gg-admin__panel">{children}</div>
    </div>
  );
}
