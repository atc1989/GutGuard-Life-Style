"use client";

import {
  Award,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  Lock,
  Sparkles,
} from "lucide-react";
import { useId, useState } from "react";
import { ListRow } from "@/components/lifestyle/ListRow";
import { spokeLinks } from "@/lib/app-links";
import { BASE_STEPS } from "@/lib/mock/seed";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";

const SPOKE_ICONS = { gema: CalendarDays, academy: GraduationCap } as const;

/**
 * UI Library section `BusinessTools`: a collapsed paper box with three tool
 * tiles and a chevron. It now carries what the retired sidebar listed —
 * BASE Activation, GEMA, GG-VERSE — and the Change 5 links to Events and
 * Academy (omitted when no spoke origin is configured).
 */
export function BusinessTools() {
  const { open } = useOverlay();
  const { session } = useSession();
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const baseCount = session.baseDone.filter(Boolean).length;
  const baseComplete = baseCount === BASE_STEPS.length;
  const spokes = spokeLinks();

  return (
    <section className="gg-tools">
      <button
        type="button"
        className="gg-tools__toggle"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((value) => !value)}
      >
        <span className="gg-tools__label">Business tools</span>
        <span className="gg-tools__tiles" aria-hidden>
          <i className="gg-tools__tile gg-tools__tile--blue"><ClipboardCheck /></i>
          <i className="gg-tools__tile gg-tools__tile--recovery">
            {baseComplete ? <Award /> : <Lock />}
          </i>
          <i className="gg-tools__tile gg-tools__tile--ink"><Sparkles /></i>
        </span>
        <ChevronDown className="gg-tools__chev" aria-hidden />
      </button>
      <div className="gg-tools__panel" id={panelId} hidden={!expanded}>
        <ListRow
          icon={<ClipboardCheck />}
          title="BASE Activation"
          description={
            baseComplete ? "All five steps done" : `${baseCount} of ${BASE_STEPS.length} steps done`
          }
          onClick={() => open("base")}
        />
        <ListRow
          icon={baseComplete ? <Award /> : <Lock />}
          title="GEMA"
          description={baseComplete ? "Open" : "Locked until BASE is complete"}
          onClick={() => open("gema")}
        />
        <ListRow
          icon={<Sparkles />}
          title="GG-VERSE"
          description="Invitation only"
          onClick={() => open("ggverse")}
        />
        {spokes.map((link) => {
          const Icon = SPOKE_ICONS[link.key];
          return (
            <ListRow
              key={link.key}
              href={link.href}
              icon={<Icon />}
              title={link.label}
              description={link.hint}
            />
          );
        })}
      </div>
    </section>
  );
}
