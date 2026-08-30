"use client";

import { useState, type ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/lib/actions/auth";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onClick"> & {
  block?: boolean;
};

export function SignOutButton({ block = true, ...props }: Props) {
  const { reset } = useSession();
  const { close } = useOverlay();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="signout"
      block={block}
      loading={loading}
      {...props}
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
