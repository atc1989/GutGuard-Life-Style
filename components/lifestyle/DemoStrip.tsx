"use client";

import { usePathname, useRouter } from "next/navigation";
import { PHASE_ROUTES, type FunnelPhase } from "@/lib/mock/seed";
import { useSession } from "@/lib/session";
import { useEffect } from "react";
import { cx } from "@/lib/cx";

const PHASES: Array<[FunnelPhase, string]> = [
  ["landing", "Ginhawa · Gift"],
  ["landing2", "Ginhawa · Plain"],
  ["register", "Sign up"],
  ["invited", "Before the door"],
  ["claimed", "After the door"],
  ["nearly", "Nearly free"],
  ["member", "Member app"],
];

export function DemoStrip() {
  const { session, setPhase } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.add("has-demo");
    return () => document.body.classList.remove("has-demo");
  }, []);

  return (
    <div className="gg-demo" aria-label="Development phase jumper">
      {PHASES.map(([id, label]) => (
        <button
          key={id}
          type="button"
          className={cx(session.phase === id && "is-active")}
          onClick={() => {
            setPhase(id);
            router.push(PHASE_ROUTES[id]);
          }}
        >
          {label}
          {id === "member" && pathname.startsWith("/app") ? " •" : ""}
        </button>
      ))}
    </div>
  );
}
