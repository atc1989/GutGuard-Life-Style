"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/lib/actions/auth";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";

export function SignOutButton() {
  const { reset } = useSession();
  const { close } = useOverlay();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="signout"
      block
      loading={loading}
      onClick={async () => {
        setLoading(true);
        close();
        reset();
        await signOut();
      }}
    >
      Sign out
    </Button>
  );
}
