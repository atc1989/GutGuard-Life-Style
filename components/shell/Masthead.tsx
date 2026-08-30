"use client";

import Link from "next/link";
import { AccountMenu } from "@/components/shell/AccountChrome";

export function Masthead() {
  return (
    <header className="gg-masthead">
      <div className="gg-masthead__bar">
        <Link href="/app/health" className="gg-masthead__brand" aria-label="Gutguard Lifestyle home">
          <strong>Gutguard</strong>
          <em>Lifestyle</em>
        </Link>
        <AccountMenu />
      </div>
    </header>
  );
}
