"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { MEMBER_SECTIONS, isMemberSectionActive } from "@/lib/member-shell";

function TabLabel({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  return (
    <>
      {label}
      {pending ? <Spinner label={`Loading ${label}`} /> : null}
    </>
  );
}

/**
 * UI Library `Tabs`, `underline` variant: the sticky My Health / My Story /
 * My Team row under the top bar. These switch routes, so they are links with
 * `aria-current="page"` rather than an ARIA tablist.
 */
export function MemberTabs() {
  const pathname = usePathname();
  return (
    <nav className="gg-tabs" aria-label="Member sections">
      <div className="gg-tabs__in">
        {MEMBER_SECTIONS.map((item) => {
          const active = isMemberSectionActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="gg-tabs__tab"
              aria-current={active ? "page" : undefined}
            >
              <TabLabel label={item.longLabel} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
