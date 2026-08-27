"use client";

import { Settings } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/IconButton";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { memberDisplayName } from "@/lib/initials";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";

function AccountMeta({ name, sponsor }: { name: string; sponsor: string }) {
  return (
    <span className="gg-account__meta">
      <strong>{name}</strong>
      <span className="gg-help">with {sponsor}</span>
    </span>
  );
}

/** Desktop sidebar: identity, settings, and sign out always visible. */
export function AccountCard() {
  const { session } = useSession();
  const { open } = useOverlay();
  const name = memberDisplayName(session.name);

  return (
    <div className="gg-account-card">
      <div className="gg-account-card__row">
        <Avatar name={name} />
        <AccountMeta name={name} sponsor={session.sponsor} />
        <IconButton label="Settings" ghost onClick={() => open("settings")}>
          <Settings />
        </IconButton>
      </div>
      <SignOutButton />
    </div>
  );
}

/** Mobile masthead: avatar opens Settings + Sign out. */
export function AccountMenu() {
  const { session } = useSession();
  const { open } = useOverlay();
  const name = memberDisplayName(session.name);
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;

    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="gg-account" ref={rootRef}>
      <button
        type="button"
        className="gg-account__trigger"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        aria-label={`${name}, account menu`}
        onClick={() => setMenuOpen((value) => !value)}
      >
        <Avatar name={name} />
        <AccountMeta name={name} sponsor={session.sponsor} />
      </button>
      {menuOpen ? (
        <div className="gg-account__menu" id={menuId} role="menu">
          <button
            type="button"
            className="gg-nav-btn"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              open("settings");
            }}
          >
            <Settings aria-hidden />
            Settings
          </button>
          <div role="none">
            <SignOutButton />
          </div>
        </div>
      ) : null}
    </div>
  );
}
