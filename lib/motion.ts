import type { Transition, Variants } from "motion/react";

/** Expo-out style curve used everywhere for a calm, premium feel. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

export const DURATION = {
  fast: 0.4,
  base: 0.6,
  slow: 0.8,
} as const;

export const baseTransition: Transition = { duration: DURATION.base, ease: EASE_OUT };

/** Parent that staggers its children. */
export const stagger = (staggerChildren = 0.08, delayChildren = 0.15): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.slow, ease: EASE_OUT } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: DURATION.slow, ease: EASE_OUT } },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
};

/** Word-by-word headline reveal. */
export const wordReveal: Variants = {
  hidden: { opacity: 0, y: "0.6em", filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: "0em",
    filter: "blur(0px)",
    transition: { duration: DURATION.slow, ease: EASE_OUT },
  },
};

/** Slide-level transition, direction aware (custom = +1 forward, -1 backward). */
export const slideTransition: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 60, scale: 0.985 }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -60,
    scale: 0.985,
    transition: { duration: 0.45, ease: EASE_IN_OUT },
  }),
};

export const slideTransitionReduced: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};
