"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Item = { q: string; a: string };

export function Accordion({ items }: { items: readonly Item[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div
            key={item.q}
            className="gg-acc-item"
            data-open={isOpen ? "true" : "false"}
          >
            <button
              type="button"
              className="gg-acc-head"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : index)}
            >
              {item.q}
              <ChevronDown className="gg-chev" size={20} />
            </button>
            <div className="gg-acc-body">{item.a}</div>
          </div>
        );
      })}
    </div>
  );
}
