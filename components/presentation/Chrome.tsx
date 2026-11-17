"use client";

import { ChevronLeft, ChevronRight, Download, Expand, Keyboard, LayoutGrid, Minimize } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT } from "@/lib/motion";
import type { SlideDef } from "@/components/slides/registry";

/** Bottom progress bar + slide counter. Always visible, very subtle. */
export function Progress({ index, total, title }: { index: number; total: number; title: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70px] px-[70px]">
      <div className="absolute left-[56px] bottom-[26px] flex items-center gap-5 bg-paper px-3 py-1.5 font-mono text-[15px]">
        <span className="font-mono text-forest">
          {String(index + 1).padStart(2, "0")}
          <span className="text-ink/50"> / {String(total).padStart(2, "0")}</span>
        </span>
        <span className="h-px w-8 bg-ink" />
        <motion.span
          key={title}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="uppercase tracking-[0.2em] text-ink/60"
        >
          {title}
        </motion.span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-[4px] gap-[3px] px-0">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="relative h-full flex-1 overflow-hidden bg-ink/10">
            <motion.div
              className="absolute inset-0 origin-left bg-forest"
              initial={false}
              animate={{ scaleX: i <= index ? 1 : 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Control cluster; fades out while the mouse is idle. */
export function Controls({
  visible,
  canPrev,
  canNext,
  fullscreen,
  onPrev,
  onNext,
  onOverview,
  onFullscreen,
  onHelp,
  onDownload,
}: {
  visible: boolean;
  canPrev: boolean;
  canNext: boolean;
  fullscreen: boolean;
  onPrev: () => void;
  onNext: () => void;
  onOverview: () => void;
  onFullscreen: () => void;
  onHelp: () => void;
  onDownload: () => void;
}) {
  return (
    <motion.div
      data-export-hide
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="absolute bottom-[20px] right-[60px] flex items-center gap-1 rounded-md border border-ink bg-paper p-1.5"
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <ChromeButton label="Sebelumnya (←)" onClick={onPrev} disabled={!canPrev}>
        <ChevronLeft size={22} />
      </ChromeButton>
      <ChromeButton label="Berikutnya (→)" onClick={onNext} disabled={!canNext}>
        <ChevronRight size={22} />
      </ChromeButton>
      <span className="mx-1 h-6 w-px bg-ink/10" />
      <ChromeButton label="Overview slide (O)" onClick={onOverview}>
        <LayoutGrid size={20} />
      </ChromeButton>
      <ChromeButton label="Fullscreen (F)" onClick={onFullscreen}>
        {fullscreen ? <Minimize size={20} /> : <Expand size={20} />}
      </ChromeButton>
      <ChromeButton label="Download PDF (D)" onClick={onDownload}>
        <Download size={20} />
      </ChromeButton>
      <ChromeButton label="Pintasan keyboard (?)" onClick={onHelp}>
        <Keyboard size={20} />
      </ChromeButton>
    </motion.div>
  );
}

function ChromeButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        onClick();
        // Never keep focus on a button, so Space/Enter don't re-trigger it.
        (e.currentTarget as HTMLButtonElement).blur();
      }}
      className="grid h-12 w-12 place-items-center rounded text-ink transition-colors hover:bg-soft hover:text-forest disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

/** Grid of all slides; click or arrows + Enter to jump. */
export function Overview({
  slides,
  current,
  cursor,
  onPick,
  onHover,
}: {
  slides: SlideDef[];
  current: number;
  cursor: number;
  onPick: (i: number) => void;
  onHover: (i: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 z-30 tech-grid bg-soft px-[120px] pt-[90px]"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-[72px] font-bold uppercase leading-none text-ink">Overview</h2>
        <span className="text-[18px] text-ink/60">
          Pilih dengan panah lalu <kbd className="text-forest">Enter</kbd> · <kbd className="text-forest">Esc</kbd> untuk kembali
        </span>
      </div>
      <motion.div
        className="mt-10 grid grid-cols-4 gap-6"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035 } } }}
      >
        {slides.map((s, i) => {
          const isCurrent = i === current;
          const isCursor = i === cursor;
          return (
            <motion.button
              key={s.id}
              type="button"
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } } }}
              onClick={() => onPick(i)}
              onMouseEnter={() => onHover(i)}
              className={`relative flex aspect-video flex-col justify-between overflow-hidden rounded-md border p-6 text-left transition-all duration-300 ${
                isCursor
                  ? "border-forest bg-paper shadow-[6px_6px_0_0_var(--color-forest)]"
                  : "border-ink/30 bg-paper"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[34px] font-semibold text-forest">{String(i + 1).padStart(2, "0")}</span>
                {isCurrent && (
                  <span className="rounded-full bg-forest px-3 py-0.5 text-[13px] font-bold uppercase tracking-wider text-paper">
                    Sekarang
                  </span>
                )}
              </div>
              <div>
                <div className="text-[14px] uppercase tracking-[0.25em] text-ink/60">{s.section}</div>
                <div className="mt-1 font-display text-[38px] font-bold uppercase leading-none text-ink">{s.title}</div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["→", "PgDn", "Space"], label: "Slide berikutnya" },
  { keys: ["←", "PgUp"], label: "Slide sebelumnya" },
  { keys: ["Home", "End"], label: "Slide pertama / terakhir" },
  { keys: ["O"], label: "Overview semua slide" },
  { keys: ["F"], label: "Fullscreen" },
  { keys: ["D"], label: "Download PDF" },
  { keys: ["?"], label: "Bantuan ini" },
  { keys: ["1–5"], label: "DFD Level 1: sorot proses" },
  { keys: ["1–3"], label: "ERD: sorot relasi" },
  { keys: ["+", "−", "0"], label: "Diagram: zoom / reset" },
  { keys: ["Shift + panah"], label: "Diagram: geser" },
  { keys: ["M"], label: "Diagram: focus mode" },
  { keys: ["Esc"], label: "Lepas sorotan / tutup panel" },
];

export function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-40 grid place-items-center bg-ink/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
        className="glass w-[980px] rounded-md p-12"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-[64px] font-bold uppercase leading-none text-ink">Pintasan keyboard</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-12 gap-y-4">
          {SHORTCUTS.map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-4 border-b border-line pb-3">
              <span className="text-[20px] text-ink/80">{s.label}</span>
              <span className="flex gap-1.5">
                {s.keys.map((k) => (
                  <kbd key={k} className="rounded-md border border-forest/40 bg-soft px-2.5 py-1 text-[16px] text-forest">
                    {k}
                  </kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
