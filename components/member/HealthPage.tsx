"use client";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { DoseCalendar } from "@/components/lifestyle/DoseCalendar";
import { PointsLedger } from "@/components/lifestyle/PointsLedger";
import { StatGroup } from "@/components/lifestyle/StatGroup";
import { BusinessTools } from "@/components/member/BusinessTools";
import { MemberGreeting } from "@/components/member/MemberGreeting";
import { persistDose, uploadDoseProof } from "@/lib/actions/member";
import { useMemberChrome } from "@/lib/lifestyle/member-chrome-context";
import { BASE_STEPS, DOSE_SLOTS, hasSupply, refillCopy } from "@/lib/mock/seed";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useToast } from "@/lib/toast";

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function HealthPage() {
  const { session, update } = useSession();
  const chrome = useMemberChrome();
  const { open } = useOverlay();
  const { push } = useToast();
  const refill = refillCopy(session.daysLeft);
  const baseCount = session.baseDone.filter(Boolean).length;
  const baseComplete = baseCount === BASE_STEPS.length;
  const supplied = hasSupply(session.daysLeft);
  const today = session.doseLog[todayKey()] ?? {};
  const takenToday = DOSE_SLOTS.filter((slot) => today[slot.id]).length;

  return (
    // Three areas so phones read greeting → doses → BASE / rewards, while from
    // 900px the greeting and BASE / rewards share the left column.
    <div className="gg-cols gg-cols--health">
      <div className="gg-col gg-area-greet">
        <MemberGreeting
          name={chrome.displayName}
          cardNo={chrome.cardNo}
          points={session.points}
          onShowCard={() => open("qr")}
        />
        <BusinessTools />
      </div>
      <div className="gg-col gg-area-extra">
        <Card
          title="BASE Activation"
          aside={
            <Badge tone="status" active={baseComplete}>
              {baseCount} of {BASE_STEPS.length}
            </Badge>
          }
        >
          <ProgressBar
            value={baseCount}
            max={BASE_STEPS.length}
            segments={BASE_STEPS.length}
            label="BASE Activation steps done"
          />
          <p className="gg-help gg-card__foot">Finish all five and GEMA opens.</p>
          <Button variant="outline" block onClick={() => open("base")}>
            {baseComplete ? "BASE Activation ✓" : "Continue BASE ›"}
          </Button>
        </Card>
        <PointsLedger
          id="rewards"
          points={session.points}
          pending={session.pending}
          banked={session.banked}
          ledger={session.ledger}
        />
      </div>

      <div className="gg-col gg-area-doses">
        {refill ? (
          <Alert>
            {refill.en} <em>{refill.tl}</em>
          </Alert>
        ) : null}

        {supplied ? (
          <>
            <DoseCalendar
              log={session.doseLog}
              capsulesPerDay={session.capsulesPerDay}
              onToggle={(day, slotId) => {
                const entry = session.doseLog[day] ?? {};
                const nextValue = !entry[slotId];
                update({
                  doseLog: {
                    ...session.doseLog,
                    [day]: { ...entry, [slotId]: nextValue },
                  },
                });
                if (isSupabaseConfigured()) {
                  void persistDose(day, slotId, nextValue);
                }
              }}
              onProof={(day, file) => {
                const entry = session.doseLog[day] ?? {};
                update({
                  doseLog: {
                    ...session.doseLog,
                    [day]: { ...entry, proof: file.name },
                  },
                });
                if (isSupabaseConfigured()) {
                  const form = new FormData();
                  form.set("file", file);
                  void uploadDoseProof(day, form);
                }
                push({
                  tone: "success",
                  title: "Proof saved",
                  body: isSupabaseConfigured()
                    ? "Uploaded to your member record."
                    : "Kept on this device for the mock session.",
                });
              }}
            />
            <StatGroup
              items={[
                { value: `${session.daysLeft}d`, label: "Supply left", highlight: session.daysLeft <= 5 },
                {
                  value: `${takenToday}/${DOSE_SLOTS.length}`,
                  label: "Today",
                  highlight: takenToday === 0,
                },
                { value: session.points.toLocaleString(), label: "E-Points" },
              ]}
            />
            {session.sponsor ? (
              <p className="gg-help gg-center">
                {session.sponsor} will reach you before it runs out.
              </p>
            ) : null}
          </>
        ) : (
          <EmptyState
            title="Your protocol starts with a bottle"
            copy="Show your card at the door. Ate Marites will reach you. Nothing to log until Gutguard is in the house."
          />
        )}
      </div>
    </div>
  );
}
