"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const LINKS = [
  { href: "/admin/users", label: "Users" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/stories", label: "Stories" },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="gg-admin-nav" aria-label="Admin">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname === link.href || pathname.startsWith(`${link.href}/`) ? "page" : undefined}
        >
          {link.label}
        </Link>
      ))}
      <Link href="/app/health">Member app</Link>
    </nav>
  );
}
