"use client";

import { Bell, QrCode, Settings } from "lucide-react";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { memberDisplayName } from "@/lib/initials";
import { memberNotifications } from "@/lib/member-notifications";
import { nextMenuIndex } from "@/lib/member-shell";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";

function AccountMeta({ name, sponsor }: { name: string; sponsor: string }) {
  return (
    <span className="gg-account__meta">
      <strong>{name}</strong>
      {sponsor ? <span className="gg-help">with {sponsor}</span> : null}
    </span>
  );
}

function useDismissiblePopup({
  open,
  setOpen,
  rootRef,
  triggerRef,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  rootRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  useEffect(() => {
    if (!open) return;

    const items = () =>
      Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    requestAnimationFrame(() => items()[0]?.focus());

    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const menuItems = items();
      if (menuItems.length === 0) return;
      event.preventDefault();
      const current = menuItems.indexOf(document.activeElement as HTMLElement);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      menuItems[nextMenuIndex(current, direction, menuItems.length)]?.focus();
    }

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, rootRef, setOpen, triggerRef]);
}

/** Desktop sidebar account entry. Secondary actions live in one inward-opening menu. */
export function AccountCard() {
  const { session } = useSession();
  const { open } = useOverlay();
  const name = memberDisplayName(session.name);
  const notifications = memberNotifications(session);
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useDismissiblePopup({ open: menuOpen, setOpen: setMenuOpen, rootRef, triggerRef });

  function openOverlay(id: "notifications" | "settings" | "qr") {
    setMenuOpen(false);
    open(id);
  }

  return (
    <div className={`gg-account-card gg-account${menuOpen ? " is-open" : ""}`} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="gg-account-card__trigger"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={() => setMenuOpen((value) => !value)}
      >
        <Avatar name={name} />
        <AccountMeta name={name} sponsor={session.sponsor} />
        {notifications.length ? (
          <span className="gg-account__badge" aria-label={`${notifications.length} notifications`}>
            {notifications.length}
          </span>
        ) : null}
      </button>
      {menuOpen ? (
        <div className="gg-account__menu gg-account__menu--sidebar" id={menuId} role="menu">
          <button type="button" className="gg-nav-btn" role="menuitem" onClick={() => openOverlay("notifications")}>
            <Bell aria-hidden />
            Notifications
            {notifications.length ? <span className="gg-account__badge">{notifications.length}</span> : null}
          </button>
          <button type="button" className="gg-nav-btn" role="menuitem" onClick={() => openOverlay("settings")}>
            <Settings aria-hidden />
            Settings
          </button>
          <button type="button" className="gg-nav-btn" role="menuitem" onClick={() => openOverlay("qr")}>
            <QrCode aria-hidden />
            My QR code
          </button>
          <SignOutButton role="menuitem" block />
        </div>
      ) : null}
    </div>
  );
}

/** Mobile masthead account trigger. Account utilities open in a bottom sheet. */
export function AccountMenu() {
  const { session } = useSession();
  const { overlay, open } = useOverlay();
  const name = memberDisplayName(session.name);
  const notifications = memberNotifications(session);

  return (
    <button
      type="button"
      className="gg-account__trigger"
      aria-haspopup="dialog"
      aria-expanded={overlay === "account"}
      aria-controls="gg-account-sheet"
      aria-label={`${name}, account${notifications.length ? `, ${notifications.length} notifications` : ""}`}
      onClick={() => open("account")}
    >
      <Avatar name={name} />
      {notifications.length ? <span className="gg-account__badge gg-account__badge--floating">{notifications.length}</span> : null}
    </button>
  );
}
