"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/lib/actions/auth";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";

export function SignOutButton({ block = true }: { block?: boolean }) {
  const { reset } = useSession();
  const { close } = useOverlay();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="signout"
      block={block}
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
