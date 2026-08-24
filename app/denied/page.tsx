import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Access · Gutguard Lifestyle",
  robots: { index: false, follow: false },
};

const COPY: Record<string, { title: string; body: string }> = {
  "signed-out": {
    title: "Sign in to continue",
    body: "The operator desk is not public. Use the member booth if you already have a card, or go back to the gift page.",
  },
  forbidden: {
    title: "This desk is for operators",
    body: "Your member card still works. Open My Health to continue. If you need the operator desk, ask a Gutguard admin to grant access.",
  },
};

export default async function DeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const reason = params.reason === "signed-out" ? "signed-out" : "forbidden";
  const copy = COPY[reason];

  return (
    <main className="gg-denied">
      <p className="gg-eyebrow">Access</p>
      <h1 className="gg-heading">{copy.title}</h1>
      <p className="gg-lede">{copy.body}</p>
      <div className="gg-denied__actions">
        {reason === "signed-out" ? (
          <Link className="gg-button gg-button--primary" href="/register">
            Open the booth
          </Link>
        ) : (
          <Link className="gg-button gg-button--primary" href="/app/health">
            Go to My Health
          </Link>
        )}
        <Link className="gg-button gg-button--ghost" href="/">
          Back to the gift
        </Link>
      </div>
    </main>
  );
}
