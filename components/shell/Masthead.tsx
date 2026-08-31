"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/shell/AccountChrome";
import { Spinner } from "@/components/ui/Spinner";
import { MEMBER_SECTIONS, isMemberSectionActive } from "@/lib/member-shell";

function SectionLabel({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  return pending ? <Spinner label={`Loading ${label}`} /> : <span>{label}</span>;
}

export function Masthead() {
  const pathname = usePathname();
  return (
    <header className="gg-masthead">
      <div className="gg-masthead__bar">
        <Link href="/app/health" className="gg-masthead__brand" aria-label="Gutguard Lifestyle home">
          <strong>Gutguard</strong>
          <em>Lifestyle</em>
        </Link>
        <div className="gg-masthead__actions">
          <AccountMenu />
        </div>
      </div>
      <nav className="gg-mobile-sections gg-segment" aria-label="Member sections">
        {MEMBER_SECTIONS.map((item) => {
          const active = isMemberSectionActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="gg-segment__button"
              aria-current={active ? "page" : undefined}
              data-active={active || undefined}
            >
              <SectionLabel label={item.label} />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
