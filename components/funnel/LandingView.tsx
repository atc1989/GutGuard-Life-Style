"use client";

import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/EmptyState";
import {
  FUNNEL_STEPS,
  LANDING_FAQ,
  LINKS,
  TRUST_STATS,
} from "@/lib/mock/seed";

export function LandingView({ variant }: { variant: "gift" | "plain" }) {
  return (
    <main className="gg-funnel">
      <section className="gg-split">
        <div>
          <p className="gg-eyebrow">Ginhawa</p>
          {variant === "gift" ? (
            <>
              <h1 className="gg-display" style={{ marginTop: 12 }}>
                A <em>welcome gift</em> for our guests.
              </h1>
              <p className="gg-lede" style={{ marginTop: 16 }}>
                Your name and number — that’s it. Free, no payment, no password.
              </p>
            </>
          ) : (
            <>
              <p className="gg-eyebrow" style={{ marginTop: 10 }}>
                A mental wellness forum
              </p>
              <h1 className="gg-display" style={{ marginTop: 12 }}>
                Ginhawa ng <em>Isip at Damdamin</em>
              </h1>
              <p className="gg-lede" style={{ marginTop: 16 }}>
                Millions of Filipinos live with anxiety or depression. Most never get help. This is a place to start — free, open to anyone.
              </p>
            </>
          )}
          <div className="gg-cta-row" style={{ marginTop: 28 }}>
            <Link href="/register">
              <Button variant="pill">
                Ready now? Start my Lifestyle Protocol →
              </Button>
            </Link>
          </div>
        </div>
        <Card variant={variant === "plain" ? "commerce" : "ceremonial"}>
          {variant === "plain" ? (
            <>
              <p className="gg-eyebrow">Hosted by Gutguard Lifestyle</p>
              <h2 className="gg-heading" style={{ fontSize: 32, marginTop: 8 }}>
                Everyone welcome
              </h2>
              <p className="gg-help" style={{ marginTop: 8 }}>
                A community wellness initiative. Free to attend. Not a government or DOH service.
              </p>
            </>
          ) : (
            <>
              <p className="gg-eyebrow" style={{ color: "var(--gg-gold-soft)" }}>
                Limited guest gift
              </p>
              <h2 className="gg-heading" style={{ color: "var(--gg-bone)", fontSize: 36, marginTop: 10 }}>
                A card and an invitation
              </h2>
              <p className="gg-lede" style={{ color: "var(--gg-bone)", marginTop: 10 }}>
                Come to an event, see it for yourself, decide after. Nothing to pay to come.
              </p>
            </>
          )}
        </Card>
      </section>

      <div className="gg-stats" style={{ margin: "40px 0" }}>
        {TRUST_STATS.map(([value, label]) => (
          <Card key={label} variant="stat">
            <strong>{value}</strong>
            <span className="gg-help">{label}</span>
          </Card>
        ))}
      </div>

      <SectionLabel number="01">Three steps. No payment, ever, to start.</SectionLabel>
      <div className="gg-grid-3" style={{ margin: "14px 0 40px" }}>
        {FUNNEL_STEPS.map((step) => (
          <Card key={step.n}>
            <p className="gg-eyebrow">{step.n}</p>
            <h3 className="gg-heading" style={{ fontSize: 26, marginTop: 6 }}>
              {step.title}
            </h3>
            <p className="gg-help" style={{ marginTop: 6 }}>
              {step.copy}
            </p>
          </Card>
        ))}
      </div>

      <section className="gg-split">
        <div>
          <SectionLabel>Short answers</SectionLabel>
          <Accordion items={LANDING_FAQ} />
        </div>
        <div className="gg-stack">
          <p className="gg-eyebrow">Where to go next</p>
          <a className="gg-link" href={LINKS.telegram} target="_blank" rel="noreferrer">
            Join Ate Marites’ Telegram group
          </a>
          <a className="gg-link" href={LINKS.facebook} target="_blank" rel="noreferrer">
            Gutguard on Facebook
          </a>
          <a className="gg-link" href={LINKS.site} target="_blank" rel="noreferrer">
            The full site, if you want the detail.
          </a>
        </div>
      </section>
    </main>
  );
}
