"use client";

import { useSlideKeys } from "@/lib/deck";

type Options = {
  slideId: string;
  active: boolean;
  maxNumber: number;
  onNumber: (n: number) => void;
  onClear: () => boolean; // returns true if something was cleared
  onZoom: (factor: number) => void;
  onPan: (dx: number, dy: number) => void;
  onReset: () => void;
  onToggleFocus: () => void;
};

/**
 * Diagram-only keys. Navigation keys (arrows without Shift, PageUp/Down, Space)
 * are deliberately NOT consumed, so slide navigation always keeps working.
 *
 *  1..n      highlight item          Esc   clear highlight (only if one is active)
 *  + / -     zoom                    0     reset view
 *  Shift+Arrows  pan                 M     focus mode
 */
export function useDiagramKeys(o: Options) {
  useSlideKeys(o.slideId, o.active, (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return false;

    if (/^[1-9]$/.test(e.key)) {
      const n = Number(e.key);
      if (n <= o.maxNumber) {
        o.onNumber(n);
        return true;
      }
      return true; // swallow other digits so they never trigger anything else
    }
    if (e.key === "Escape") return o.onClear();
    if (e.key === "+" || e.key === "=") {
      o.onZoom(1.25);
      return true;
    }
    if (e.key === "-" || e.key === "_") {
      o.onZoom(1 / 1.25);
      return true;
    }
    if (e.key === "0") {
      o.onReset();
      return true;
    }
    if (e.key === "m" || e.key === "M") {
      o.onToggleFocus();
      return true;
    }
    if (e.shiftKey && e.key.startsWith("Arrow")) {
      const step = 80;
      const map: Record<string, [number, number]> = {
        ArrowLeft: [step, 0],
        ArrowRight: [-step, 0],
        ArrowUp: [0, step],
        ArrowDown: [0, -step],
      };
      const d = map[e.key];
      if (d) {
        o.onPan(d[0], d[1]);
        return true;
      }
    }
    return false;
  });
}
