"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { fadeUp, stagger, wordReveal } from "@/lib/motion";

/** Standard slide frame: 1920×1080 canvas with generous, consistent margins. */
export function SlideShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={stagger(0.07, 0.1)}
      initial="hidden"
      animate="show"
      className={`relative flex h-full w-full flex-col px-[120px] pb-[110px] pt-[90px] ${className}`}
    >
      {children}
    </motion.div>
  );
}

/** Section label like "02 — DESKRIPSI SISTEM", set in IBM Plex Mono. */
export function Kicker({ number, children }: { number: string; children: ReactNode }) {
  return (
    <motion.div variants={fadeUp} className="flex items-center gap-4 font-mono text-[18px] font-medium uppercase tracking-[0.22em] text-ink">
      <span className="bg-forest px-2 py-0.5 tracking-normal text-paper">{number}</span>
      <motion.span
        className="h-px w-16 origin-left bg-ink"
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.8 } } }}
      />
      <span>{children}</span>
    </motion.div>
  );
}

/** Headline revealed word by word — Barlow Condensed Bold, uppercase. */
export function Headline({
  text,
  className = "",
  accent,
}: {
  text: string;
  className?: string;
  /** Words (exact match) rendered in forest green. */
  accent?: string[];
}) {
  const words = text.split(" ");
  return (
    <motion.h2
      variants={stagger(0.05, 0)}
      className={`font-display font-bold uppercase leading-[0.95] tracking-[0.005em] text-ink ${className}`}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
          <motion.span variants={wordReveal} className={`inline-block ${accent?.includes(w) ? "text-forest" : ""}`}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  );
}

/** Flat paper card with hairline border and offset print shadow. */
export function Card({
  children,
  className = "",
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={hover ? { y: -4, x: -2, transition: { duration: 0.3 } } : undefined}
      className={`glass rounded-md ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function IconBadge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`grid h-14 w-14 shrink-0 place-items-center rounded bg-forest text-paper ${className}`}>
      {children}
    </span>
  );
}
