import { CreditCard, UserPlus, Wallet } from "lucide-react";
import { AuthPanel, FunnelPage } from "./AuthPanel";
import { FaqSection } from "./FaqSection";
import { FunnelTopBar } from "./FunnelTopBar";
import { IconRow } from "@/components/lifestyle/IconRow";
import { MemberCard } from "@/components/lifestyle/MemberCard";
import { OfferCard } from "@/components/lifestyle/OfferCard";
import { StatGroup } from "@/components/lifestyle/StatGroup";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FUNNEL_STEPS, TRUST_STATS } from "@/lib/mock/seed";

const STEP_ICONS = [CreditCard, UserPlus, Wallet] as const;

/**
 * Landing composition on the UI Library free-card screen: `AuthPanel` with
 * the content column sticky, an `OfferCard` hero, the `MemberCard` preview,
 * `IconRow` steps, then the trust band and FAQ. All copy is the app's own.
 * Server-rendered end to end — the FAQ is native `<details>`.
 */
export function LandingView({ variant }: { variant: "gift" | "plain" }) {
  const gift = variant === "gift";

  return (
    <>
      <FunnelTopBar />
      <FunnelPage>
        <AuthPanel
          sticky="content"
          intro={gift ? "Ginhawa · a welcome gift" : "Ginhawa · a mental wellness forum"}
          title={gift ? "Limited guest gift" : "Hosted by Gutguard Lifestyle"}
          titleId="gg-offer-label"
          card={
            <>
              <OfferCard
                eyebrow="Ginhawa"
                titleAs="h1"
                titleId="hero-title"
                title={
                  gift ? (
                    <>
                      A <em>welcome gift</em> for our guests.
                    </>
                  ) : (
                    <>
                      Ginhawa ng <em>Isip at Damdamin</em>
                    </>
                  )
                }
              >
                {gift
                  ? "Your name, number, and a password. Free, no payment to start."
                  : "Millions of Filipinos live with anxiety or depression. Most never get help. This is a place to start — free, open to anyone."}
              </OfferCard>
              <MemberCard
                placeholder
                rank="Lifestyle member"
                name="Your name here"
                number="09xx xxx xxxx"
                points={0}
                corner={
                  <>
                    Free
                    <br />
                    No payment to start
                  </>
                }
              />
              <section className="gg-panel" aria-labelledby="steps-title">
                <Eyebrow as="h2" id="steps-title">
                  Three steps. No payment, ever, to start.
                </Eyebrow>
                {FUNNEL_STEPS.map((step, index) => {
                  const Icon = STEP_ICONS[index] ?? CreditCard;
                  return (
                    <IconRow key={step.n} icon={<Icon />} title={step.title}>
                      {step.copy}
                    </IconRow>
                  );
                })}
              </section>
            </>
          }
        >
          <div className="gg-panel">
            <h3 className="gg-panel__title">
              {gift ? "A card and an invitation" : "Everyone welcome"}
            </h3>
            <p className="gg-panel__text">
              {gift
                ? "Come to an event, see it for yourself, decide after. Nothing to pay to come."
                : "A community wellness initiative. Free to attend. Not a government or DOH service."}
            </p>
          </div>
          <Button href="/register" size="lg">
            Ready now? Start my Lifestyle Protocol →
          </Button>
          <p className="gg-cta-note">
            <b>Free.</b> Your name, number, and a password.
          </p>
        </AuthPanel>

        <section className="gg-funnel__band" aria-labelledby="trust-title">
          <h2 className="gg-vh" id="trust-title">
            Gutguard in numbers
          </h2>
          <StatGroup
            variant="trust"
            items={TRUST_STATS.map(([value, label]) => ({ value, label }))}
          />
        </section>

        <FaqSection />
      </FunnelPage>
    </>
  );
}
