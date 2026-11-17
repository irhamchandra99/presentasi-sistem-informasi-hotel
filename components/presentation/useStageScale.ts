"use client";

import { useEffect, useState } from "react";

export const STAGE_W = 1920;
export const STAGE_H = 1080;

export type StageBox = { scale: number; left: number; top: number; width: number; height: number };

/** Fits a fixed 1920×1080 stage into the window (letterboxed, always 16:9). */
export function useStageScale(): StageBox | null {
  const [box, setBox] = useState<StageBox | null>(null);

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.min(vw / STAGE_W, vh / STAGE_H);
      const width = STAGE_W * scale;
      const height = STAGE_H * scale;
      setBox({ scale, width, height, left: (vw - width) / 2, top: (vh - height) / 2 });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return box;
}
