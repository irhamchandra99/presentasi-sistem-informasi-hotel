"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT } from "@/lib/motion";

export type PanelItem = {
  key: number;
  title: string;
  summary: string;
  details: ReactNode;
};

export function DiagramPanel({
  items,
  selected,
  onSelect,
  emptyHint,
  hints,
}: {
  items: PanelItem[];
  selected: number | null;
  onSelect: (n: number | null) => void;
  emptyHint: ReactNode;
  hints: { keys: string; label: string }[];
}) {
  const current = items.find((i) => i.key === selected) ?? null;
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const on = item.key === selected;
          return (
            <button
              key={item.key}
              type="button"
              onClick={(e) => {
                onSelect(on ? null : item.key);
                (e.currentTarget as HTMLButtonElement).blur();
              }}
              className={`group flex items-center gap-3 rounded-md border px-4 py-2.5 text-left transition-all duration-300 ${
                on
                  ? "border-forest bg-forest text-paper shadow-[4px_4px_0_0_var(--color-ink)]"
                  : "border-ink/30 bg-paper hover:border-forest"
              }`}
            >
              <kbd
                className={`grid h-8 w-8 shrink-0 place-items-center rounded border text-[16px] font-semibold ${
                  on ? "border-paper bg-paper text-forest" : "border-forest text-forest"
                }`}
              >
                {item.key}
              </kbd>
              <span className="min-w-0">
                <span className={`block text-[19px] font-semibold leading-tight ${on ? "text-paper" : "text-ink"}`}>
                  {item.title}
                </span>
                <span className={`block truncate font-mono text-[14px] ${on ? "text-paper/80" : "text-ink/60"}`}>{item.summary}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="glass relative min-h-0 flex-1 overflow-hidden rounded-md p-5">
        <motion.div
          key={current?.key ?? "empty"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="text-[19px] leading-relaxed text-ink"
        >
          {current ? current.details : emptyHint}
        </motion.div>
      </div>

      <div data-export-hide className="flex flex-wrap gap-x-4 gap-y-1.5 text-[14px] text-ink/60">
        {hints.map((h) => (
          <span key={h.label} className="flex items-center gap-1.5">
            <kbd className="rounded border border-ink/40 px-1.5 py-0.5 text-[13px] text-ink/80">{h.keys}</kbd>
            {h.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export const DIAGRAM_HINTS = [
  { keys: "Esc", label: "lepas sorotan" },
  { keys: "+ / −", label: "zoom" },
  { keys: "0", label: "reset" },
  { keys: "M", label: "focus mode" },
  { keys: "Shift+←→", label: "geser" },
];
