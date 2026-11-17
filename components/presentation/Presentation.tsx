"use client";

import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BackgroundLayer from "@/components/three/BackgroundLayer";
import { SLIDES } from "@/components/slides/registry";
import { DeckContext, type SlideKeyHandler } from "@/lib/deck";
import { slideTransition, slideTransitionReduced } from "@/lib/motion";
import { PDF_FILENAME, PDF_URL } from "@/lib/pdf";
import { Controls, HelpOverlay, Overview, Progress } from "./Chrome";
import { STAGE_H, STAGE_W, useStageScale } from "./useStageScale";

const TOTAL = SLIDES.length;
const IDLE_MS = 2600;

function readHashIndex(): number | null {
  const n = Number.parseInt(window.location.hash.replace("#", ""), 10);
  return Number.isFinite(n) && n >= 1 && n <= TOTAL ? n - 1 : null;
}

export default function Presentation() {
  const box = useStageScale();
  const reducedMotion = !!useReducedMotion();

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [overview, setOverview] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [help, setHelp] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  const keyHandlers = useRef(new Map<string, SlideKeyHandler>());
  const registerKeyHandler = useCallback((slideId: string, handler: SlideKeyHandler | null) => {
    if (handler) keyHandlers.current.set(slideId, handler);
    else keyHandlers.current.delete(slideId);
  }, []);
  const deck = useMemo(() => ({ registerKeyHandler, reducedMotion }), [registerKeyHandler, reducedMotion]);

  // Restore slide from URL hash after mount (keeps SSR/CSR markup identical).
  useEffect(() => {
    const fromHash = readHashIndex();
    if (fromHash !== null) setIndex(fromHash);
    setHydrated(true);
    const onHash = () => {
      const i = readHashIndex();
      if (i !== null) setIndex(i);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const hash = `#${index + 1}`;
    if (window.location.hash !== hash) history.replaceState(null, "", hash);
  }, [index, hydrated]);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(TOTAL - 1, next));
      setIndex((cur) => {
        if (clamped === cur) return cur;
        setDirection(clamped > cur ? 1 : -1);
        return clamped;
      });
    },
    [],
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  }, []);

  const downloadPdf = useCallback(() => {
    const a = document.createElement("a");
    a.href = PDF_URL;
    a.download = PDF_FILENAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  const openOverview = useCallback(() => {
    setCursor(index);
    setOverview(true);
    setHelp(false);
  }, [index]);

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    const onVis = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Hide the control cluster while the presenter isn't moving the mouse.
  useEffect(() => {
    let timer = window.setTimeout(() => setChromeVisible(false), IDLE_MS);
    const wake = () => {
      setChromeVisible(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setChromeVisible(false), IDLE_MS);
    };
    window.addEventListener("mousemove", wake);
    window.addEventListener("pointerdown", wake);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("pointerdown", wake);
    };
  }, []);

  // Keyboard: overlays first, then the active slide (diagrams), then navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;

      if (help) {
        if (e.key === "Escape" || e.key === "?" || e.key === "h" || e.key === "H") {
          e.preventDefault();
          setHelp(false);
        }
        return;
      }

      if (overview) {
        const cols = 4;
        const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols };
        if (e.key in moves) {
          e.preventDefault();
          setCursor((c) => Math.max(0, Math.min(TOTAL - 1, c + moves[e.key])));
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goTo(cursor);
          setOverview(false);
        } else if (e.key === "Escape" || e.key === "o" || e.key === "O") {
          e.preventDefault();
          setOverview(false);
        } else if (e.key === "f" || e.key === "F") {
          e.preventDefault();
          toggleFullscreen();
        }
        return;
      }

      const slideHandler = keyHandlers.current.get(SLIDES[index].id);
      if (slideHandler && slideHandler(e)) {
        e.preventDefault();
        return;
      }

      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
        case "Enter":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "PageUp":
        case "Backspace":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          goTo(0);
          break;
        case "End":
          e.preventDefault();
          goTo(TOTAL - 1);
          break;
        case "o":
        case "O":
        case "Escape":
          // Esc only opens overview when nothing else consumed it.
          if (e.key === "Escape" && document.fullscreenElement) return;
          e.preventDefault();
          openOverview();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "d":
        case "D":
          e.preventDefault();
          downloadPdf();
          break;
        case "?":
        case "h":
        case "H":
          e.preventDefault();
          setHelp(true);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [help, overview, cursor, index, next, prev, goTo, toggleFullscreen, openOverview, downloadPdf]);

  const slide = SLIDES[index];
  const sceneRunning = pageVisible && !overview;

  return (
    <DeckContext.Provider value={deck}>
      <MotionConfig reducedMotion="user">
        <main className="fixed inset-0 overflow-hidden bg-paper" aria-roledescription="presentasi">
          {box && (
            <div
              className="absolute overflow-hidden"
              style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
            >
              {/* 3D layer: sized in real pixels (never CSS-scaled) so WebGL stays crisp */}
              <BackgroundLayer mode={slide.scene} running={sceneRunning} reducedMotion={reducedMotion} />

              {/* Content layer: fixed 1920×1080 canvas scaled to fit */}
              <div
                className="absolute left-0 top-0 origin-top-left"
                style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${box.scale})` }}
              >
                <AnimatePresence initial={false} custom={direction}>
                  <motion.section
                    key={slide.id}
                    custom={direction}
                    variants={reducedMotion ? slideTransitionReduced : slideTransition}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0"
                    aria-label={`Slide ${index + 1} dari ${TOTAL}: ${slide.title}`}
                  >
                    <slide.Component id={slide.id} active={!overview && !help} />
                  </motion.section>
                </AnimatePresence>

                <Progress index={index} total={TOTAL} title={slide.title} />
                <Controls
                  visible={chromeVisible && !overview}
                  canPrev={index > 0}
                  canNext={index < TOTAL - 1}
                  fullscreen={fullscreen}
                  onPrev={prev}
                  onNext={next}
                  onOverview={openOverview}
                  onFullscreen={toggleFullscreen}
                  onHelp={() => setHelp(true)}
                  onDownload={downloadPdf}
                />

                <AnimatePresence>
                  {overview && (
                    <Overview
                      slides={SLIDES}
                      current={index}
                      cursor={cursor}
                      onHover={setCursor}
                      onPick={(i) => {
                        goTo(i);
                        setOverview(false);
                      }}
                    />
                  )}
                </AnimatePresence>
                <AnimatePresence>{help && <HelpOverlay onClose={() => setHelp(false)} />}</AnimatePresence>
              </div>
            </div>
          )}
          <noscript>
            <p style={{ padding: 40, color: "#191919" }}>Presentasi ini membutuhkan JavaScript.</p>
          </noscript>
        </main>
      </MotionConfig>
    </DeckContext.Provider>
  );
}
