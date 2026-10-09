import { TopBar } from "@/components/shell/TopBar";
import { PointsPill } from "@/components/ui/PointsPill";

/**
 * Landing / sign-up top bar: UI Library `TopBar` `app` with a plain text
 * PointsPill on the right ("Sign in"), as on the free-card screens.
 */
export function FunnelTopBar({ signIn = true }: { signIn?: boolean }) {
  return (
    <TopBar
      here="Lifestyle"
      right={signIn ? <PointsPill label="Sign in" href="/register" /> : undefined}
    />
  );
}
