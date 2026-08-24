import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/EmptyState";
import { WelcomeOverlay } from "@/components/lifestyle/WelcomeOverlay";
import { readWelcomeSeen } from "@/lib/welcome";
import {
  FUNNEL_STEPS,
  LANDING_FAQ,
  LINKS,
  TRUST_STATS,
} from "@/lib/content/landing";

export async function LandingView({ variant }: { variant: "gift" | "plain" }) {
  const welcomeSeen = await readWelcomeSeen();

  return (
    <main className="gg-funnel">
      <WelcomeOverlay initialSeen={welcomeSeen} />
      <section className="gg-split">
        <div>
          <p className="gg-eyebrow">Ginhawa</p>
          {variant === "gift" ? (
            <>
              <h1 className="gg-display gg-hero__title">
                A <em>welcome gift</em> for our guests.
              </h1>
              <p className="gg-lede gg-hero__lede">
                A card and an invitation. Nothing to pay to start.
              </p>
            </>
          ) : (
            <>
              <p className="gg-eyebrow gg-hero__kicker">
                A mental wellness forum
              </p>
              <h1 className="gg-display gg-hero__title">
                Ginhawa ng <em>Isip at Damdamin</em>
              </h1>
              <p className="gg-lede gg-hero__lede">
                Millions of Filipinos live with anxiety or depression. Most never
                get help. This is a place to start — free, open to anyone.
              </p>
            </>
          )}
          <div className="gg-cta-row gg-hero__cta">
            <Link href="/register" className="gg-button gg-button--pill">
              Ready now? Start my Lifestyle Protocol
            </Link>
          </div>
        </div>
        <Card variant={variant === "plain" ? "commerce" : "ceremonial"}>
          {variant === "plain" ? (
            <>
              <p className="gg-eyebrow">Hosted by Gutguard Lifestyle</p>
              <h2 className="gg-heading gg-offer-title">Everyone welcome</h2>
              <p className="gg-help gg-offer-copy">
                A community wellness initiative. Free to attend. Not a government
                or DOH service.
              </p>
            </>
          ) : (
            <>
              <p className="gg-eyebrow">Limited guest gift</p>
              <h2 className="gg-heading gg-offer-title">
                A card and an invitation
              </h2>
              <p className="gg-lede gg-offer-copy">
                Come to an event, see it for yourself, decide after. Nothing to
                pay to come.
              </p>
            </>
          )}
        </Card>
      </section>

      <div className="gg-stats">
        {TRUST_STATS.map(([value, label]) => (
          <Card key={label} variant="stat">
            <strong>{value}</strong>
            <span className="gg-help">{label}</span>
          </Card>
        ))}
      </div>

      <SectionLabel number="01">
        Three steps. No payment, ever, to start.
      </SectionLabel>
      <div className="gg-grid-3 gg-steps">
        {FUNNEL_STEPS.map((step) => (
          <Card key={step.n}>
            <p className="gg-eyebrow">{step.n}</p>
            <h3 className="gg-heading gg-step-title">{step.title}</h3>
            <p className="gg-help gg-step-copy">{step.copy}</p>
          </Card>
        ))}
      </div>

      <section className="gg-split">
        <div>
          <SectionLabel>Short answers</SectionLabel>
          <Accordion items={LANDING_FAQ} />
        </div>
        <div className="gg-stack gg-next-links">
          <p className="gg-eyebrow">Where to go next</p>
          <a
            className="gg-link gg-next-link"
            href={LINKS.telegram}
            target="_blank"
            rel="noreferrer"
          >
            Join Ate Marites’ Telegram group
          </a>
          <a
            className="gg-link gg-next-link"
            href={LINKS.facebook}
            target="_blank"
            rel="noreferrer"
          >
            Gutguard on Facebook
          </a>
          <a
            className="gg-link gg-next-link"
            href={LINKS.site}
            target="_blank"
            rel="noreferrer"
          >
            The full site, if you want the detail.
          </a>
        </div>
      </section>
    </main>
  );
}
