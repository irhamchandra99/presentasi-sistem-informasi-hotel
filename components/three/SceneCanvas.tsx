"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { SceneMode } from "@/lib/scene";
import Experience from "./Experience";

type Props = {
  mode: SceneMode;
  /** False while the deck is in overview, tab hidden, etc. */
  running: boolean;
  reducedMotion: boolean;
};

/**
 * The single shared WebGL canvas. Loaded lazily (dynamic import, ssr: false)
 * so three.js never runs on the server and never blocks first paint.
 */
export default function SceneCanvas({ mode, running, reducedMotion }: Props) {
  // Keep the last real composition while fading out, so the scene doesn't pop.
  const [shownMode, setShownMode] = useState<Exclude<SceneMode, "none">>(
    mode === "none" ? "hotel-cover" : mode,
  );
  const [visible, setVisible] = useState(mode !== "none");
  const [loopOn, setLoopOn] = useState(mode !== "none");
  const fadeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    if (mode === "none") {
      setVisible(false);
      // Stop the render loop after the CSS fade finishes.
      fadeTimer.current = window.setTimeout(() => setLoopOn(false), 700);
    } else {
      setShownMode(mode);
      setLoopOn(true);
      setVisible(true);
    }
    return () => {
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    };
  }, [mode]);

  const animate = !reducedMotion;
  const frameloop: "always" | "demand" | "never" =
    !running || !loopOn ? "never" : animate ? "always" : "demand";

  return (
    <div
      aria-hidden
      className="absolute inset-0 transition-opacity duration-700 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.5]}
        camera={{ fov: 38, near: 0.1, far: 120, position: [12, 5, 15] }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.NeutralToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Experience mode={shownMode} animate={animate} />
      </Canvas>
    </div>
  );
}
