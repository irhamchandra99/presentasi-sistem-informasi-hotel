"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { hasWebGL, type SceneMode } from "@/lib/scene";
import { PALETTE } from "@/lib/theme";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), {
  ssr: false,
  loading: () => null,
});

/** Static fallback when WebGL is missing or crashes: technical line drawing of the hotel. */
export function StaticBackdrop({ mode }: { mode: SceneMode }) {
  const showSkyline = mode === "hotel-cover" || mode === "hotel-close";
  const x0 = mode === "hotel-cover" ? 1240 : 380;
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {showSkyline && (
        <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
          <g fill={PALETTE.white} stroke={PALETTE.ink} strokeWidth="2">
            <rect x={x0} y="260" width="300" height="620" />
            <rect x={x0 - 70} y="820" width="440" height="160" />
          </g>
          <rect x={x0 - 6} y="240" width="312" height="20" fill={PALETTE.forest} />
          <g>
            {Array.from({ length: 10 }).flatMap((_, r) =>
              Array.from({ length: 6 }).map((__, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={x0 + 22 + c * 46}
                  y={290 + r * 52}
                  width="24"
                  height="30"
                  fill={(r * 7 + c * 3) % 5 === 0 ? PALETTE.soft : PALETTE.forest}
                  stroke={PALETTE.ink}
                  strokeWidth="2"
                />
              )),
            )}
          </g>
          <line x1="0" y1="980" x2="1920" y2="980" stroke={PALETTE.ink} strokeWidth="1.5" />
        </svg>
      )}
    </div>
  );
}

class WebGLErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("3D scene disabled, using static fallback:", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function BackgroundLayer({
  mode,
  running,
  reducedMotion,
}: {
  mode: SceneMode;
  running: boolean;
  reducedMotion: boolean;
}) {
  // null = not checked yet (server render + first client render are identical: no hydration mismatch)
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [wanted, setWanted] = useState(mode !== "none");

  useEffect(() => {
    setWebgl(hasWebGL());
  }, []);

  // Lazy: only download/boot three.js once a slide actually needs 3D.
  useEffect(() => {
    if (mode !== "none") setWanted(true);
  }, [mode]);

  return (
    <div className="absolute inset-0">
      {/* Paper + blueprint grid always present behind everything */}
      <div aria-hidden className="absolute inset-0 bg-paper" />
      <div aria-hidden className="tech-grid absolute inset-0 opacity-60" />
      {webgl === false && <StaticBackdrop mode={mode} />}
      {webgl && wanted && (
        <WebGLErrorBoundary fallback={<StaticBackdrop mode={mode} />}>
          <SceneCanvas mode={mode} running={running} reducedMotion={reducedMotion} />
        </WebGLErrorBoundary>
      )}
    </div>
  );
}
