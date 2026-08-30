"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Heart, ShoppingBag, Users } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { cx } from "@/lib/cx";
import { useOverlay } from "@/lib/overlay-store";

const ITEMS = [
  { href: "/app/health", label: "Health", icon: Heart },
  { href: "/app/team", label: "Team", icon: Users },
  { href: "/app/story", label: "Story", icon: BookOpen },
] as const;

function NavLabel({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  return pending ? <Spinner label={`Loading ${label}`} /> : <span>{label}</span>;
}

export function BottomBar() {
  const { open } = useOverlay();
  const pathname = usePathname();
  return (
    <nav className="gg-bottom-bar" aria-label="Member sections">
      <div className="gg-bottom-bar__inner">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cx("gg-bottom-nav__item", active && "is-active")}
              aria-current={active ? "page" : undefined}
            >
              <Icon aria-hidden />
              <NavLabel label={label} />
            </Link>
          );
        })}
        <button
          type="button"
          className="gg-bottom-nav__item gg-bottom-nav__item--order"
          onClick={() => open("order")}
        >
          <ShoppingBag aria-hidden />
          <span>Order</span>
        </button>
      </div>
    </nav>
  );
}
