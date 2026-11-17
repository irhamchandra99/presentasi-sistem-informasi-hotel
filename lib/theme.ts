/**
 * Design tokens — Modern Retro Technical Editorial.
 * The only colours allowed anywhere in the app (CSS, SVG, three.js).
 * CSS mirrors these in app/globals.css (@theme).
 */
export const PALETTE = {
  white: "#FFFFFF",
  ink: "#191919",
  forest: "#244D3B",
  olive: "#87977A",
  soft: "#F3F4F2",
  line: "#DADDD8",
} as const;

/** Semantic aliases used by the SVG diagrams. */
export const DIAGRAM = {
  paper: PALETTE.white,
  text: PALETTE.ink,
  textOnDark: PALETTE.white,
  stroke: PALETTE.ink,
  /** "abu-abu gelap": ink at reduced opacity */
  connector: PALETTE.ink,
  connectorOpacity: 0.55,
  activeFlow: PALETTE.olive,
  highlight: PALETTE.forest,
  pk: PALETTE.forest,
  fk: PALETTE.olive,
  muted: PALETTE.line,
  soft: PALETTE.soft,
} as const;
