"use client";

import { ShoppingBag, UserRound } from "lucide-react";
import { TopBar } from "@/components/shell/TopBar";
import { IconButton } from "@/components/ui/IconButton";
import { PointsPill } from "@/components/ui/PointsPill";
import { memberNotifications } from "@/lib/member-notifications";
import { useMemberChrome } from "@/lib/lifestyle/member-chrome-context";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";

/**
 * Member top bar. The right slot carries what the retired sidebar and bottom
 * bar held: E-Points, Order now, and the account sheet (notifications,
 * settings, QR, Events / Academy, sign out).
 */
export function MemberTopBar() {
  const { session } = useSession();
  const { displayName } = useMemberChrome();
  const { overlay, open } = useOverlay();
  const notifications = memberNotifications(session);

  return (
    <TopBar
      here="Lifestyle"
      homeHref="/app/health"
      right={
        <>
          <PointsPill label="E-Points" points={session.points} href="/app/health#rewards" />
          <IconButton shape="round" label="Order now" onClick={() => open("order")}>
            <ShoppingBag />
          </IconButton>
          <IconButton
            id="gg-account-trigger"
            shape="round"
            label={`${displayName}, account`}
            count={notifications.length || undefined}
            aria-haspopup="dialog"
            aria-expanded={overlay === "account"}
            aria-controls="gg-account-sheet"
            onClick={() => open("account")}
          >
            <UserRound />
          </IconButton>
        </>
      }
    />
  );
}
