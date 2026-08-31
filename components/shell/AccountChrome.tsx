"use client";

import { Bell, QrCode, Settings, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { cx } from "@/lib/cx";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/IconButton";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { memberDisplayName } from "@/lib/initials";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";
import { memberNotifications } from "@/lib/member-notifications";
import { nextMenuIndex } from "@/lib/member-shell";

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

function useDismissiblePopup({
  open,
  setOpen,
  rootRef,
  triggerRef,
  itemSelector,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  rootRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  itemSelector: string;
}) {
  useEffect(() => {
    if (!open) return;

    const items = () =>
      Array.from(rootRef.current?.querySelectorAll<HTMLElement>(itemSelector) ?? []);
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
  }, [itemSelector, open, rootRef, setOpen, triggerRef]);
}

/** Masthead avatar: desktop dropdown, mobile account sheet. */
export function AccountMenu() {
  const { session } = useSession();
  const { overlay, open } = useOverlay();
  const name = memberDisplayName(session.name);
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useDismissiblePopup({
    open: menuOpen,
    setOpen: setMenuOpen,
    rootRef,
    triggerRef,
    itemSelector: '[role="menuitem"]',
  });

  return (
    <div className={cx("gg-account", menuOpen && "is-open")} ref={rootRef}>
      <button
        ref={triggerRef}
        id="gg-account-trigger"
        type="button"
        className="gg-account__trigger gg-account__trigger--desktop"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        aria-label={`${name}, account menu`}
        onClick={() => setMenuOpen((value) => !value)}
      >
        <Avatar name={name} />
      </button>
      <button
        type="button"
        className="gg-account__trigger gg-account__trigger--mobile"
        aria-haspopup="dialog"
        aria-expanded={overlay === "account"}
        aria-controls="gg-account-sheet"
        aria-label={`${name}, account`}
        onClick={() => open("account")}
      >
        <Avatar name={name} />
      </button>
      {menuOpen ? (
        <div className="gg-account__menu" id={menuId} role="menu">
          <div className="gg-account__menu-head" role="none">
            <Avatar name={name} />
            <AccountMeta name={name} sponsor={session.sponsor} />
          </div>
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
          <button
            type="button"
            className="gg-nav-btn"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              open("qr");
            }}
          >
            <QrCode aria-hidden />
            My QR code
          </button>
          <SignOutButton role="menuitem" block />
        </div>
      ) : null}
    </div>
  );
}

/** Notification Bell: anchored desktop panel, full-width mobile sheet. */
export function NotificationMenu() {
  const { session } = useSession();
  const { overlay, open } = useOverlay();
  const notifications = memberNotifications(session);
  const [panelOpen, setPanelOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const titleId = useId();

  useDismissiblePopup({
    open: panelOpen,
    setOpen: setPanelOpen,
    rootRef,
    triggerRef,
    itemSelector: '[data-notification-control="true"]',
  });

  return (
    <div className="gg-bell" ref={rootRef}>
      <IconButton
        ref={triggerRef}
        label="Notifications"
        className="gg-bell__trigger--desktop"
        aria-haspopup="dialog"
        aria-expanded={panelOpen}
        aria-controls={panelId}
        onClick={() => setPanelOpen((value) => !value)}
      >
        <Bell aria-hidden />
      </IconButton>
      <IconButton
        label="Notifications"
        className="gg-bell__trigger--mobile"
        aria-haspopup="dialog"
        aria-expanded={overlay === "notifications"}
        aria-controls="gg-notifications-sheet"
        onClick={() => open("notifications")}
      >
        <Bell aria-hidden />
      </IconButton>
      {notifications.length ? (
        <span className="gg-bell__count" aria-hidden>
          {notifications.length}
        </span>
      ) : null}
      {panelOpen ? (
        <section
          className="gg-bell__panel"
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
        >
          <div className="gg-bell__panel-head">
            <h2 id={titleId}>Notifications</h2>
            <IconButton
              label="Close notifications"
              ghost
              data-notification-control="true"
              onClick={() => {
                setPanelOpen(false);
                triggerRef.current?.focus();
              }}
            >
              <X aria-hidden />
            </IconButton>
          </div>
          {notifications.length ? (
            <ul className="gg-notification-list">
              {notifications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="gg-help gg-bell__empty">You’re all caught up.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
