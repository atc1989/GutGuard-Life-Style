"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

type Item = { q: string; a: string };

export function Accordion({ items }: { items: readonly Item[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div>
      {items.map((item, index) => {
        const isOpen = open === index;
        const panelId = `${baseId}-panel-${index}`;
        const headId = `${baseId}-head-${index}`;
        return (
          <div
            key={item.q}
            className="gg-acc-item"
            data-open={isOpen ? "true" : "false"}
          >
            <button
              type="button"
              className="gg-acc-head"
              id={headId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : index)}
            >
              {item.q}
              <ChevronDown className="gg-chev" size={20} aria-hidden="true" />
            </button>
            <div
              className="gg-acc-body"
              id={panelId}
              role="region"
              aria-labelledby={headId}
              hidden={!isOpen}
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
