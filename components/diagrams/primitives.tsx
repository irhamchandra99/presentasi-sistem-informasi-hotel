"use client";

import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import { DIAGRAM as C } from "@/lib/theme";

export type Emphasis = "normal" | "active" | "dim";

export const opacityFor = (e: Emphasis, focusMode: boolean) =>
  e === "dim" ? (focusMode ? 0.08 : 0.2) : 1;

/** Data-flow connector with label, animated dash and a moving data packet when active. */
export function FlowPath({
  d,
  label,
  labelX,
  labelY,
  anchor = "middle",
  emphasis,
  focusMode,
  reducedMotion,
  delay = 0,
  fontSize = 17,
}: {
  d: string;
  label: string | string[];
  labelX: number;
  labelY: number;
  anchor?: "start" | "middle" | "end";
  emphasis: Emphasis;
  focusMode: boolean;
  reducedMotion: boolean;
  delay?: number;
  fontSize?: number;
}) {
  const active = emphasis === "active";
  const lines = Array.isArray(label) ? label : [label];
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: opacityFor(emphasis, focusMode) }}
      transition={{ duration: 0.5, delay: reducedMotion ? 0 : delay, ease: EASE_OUT }}
    >
      {/* Base line: drawn in once (pathLength), never combined with the dash animation */}
      <motion.path
        d={d}
        fill="none"
        stroke={active ? C.activeFlow : C.connector}
        strokeOpacity={active ? 1 : C.connectorOpacity}
        strokeWidth={active ? 3.5 : 2}
        markerEnd={active ? "url(#arrow-active)" : "url(#arrow-muted)"}
        initial={reducedMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay: reducedMotion ? 0 : delay, ease: EASE_OUT }}
      />
      {active && <path d={d} fill="none" stroke={C.paper} strokeWidth={1.5} className="flow-animated" />}
      {active && !reducedMotion && (
        <circle r={6} fill={C.highlight} stroke={C.paper} strokeWidth={2}>
          <animateMotion dur="2.2s" repeatCount="indefinite" path={d} />
        </circle>
      )}
      <text
        x={labelX}
        y={labelY}
        textAnchor={anchor}
        fontSize={fontSize}
        fontFamily="var(--font-sans)"
        fontWeight={active ? 600 : 500}
        fill={active ? C.highlight : C.text}
        stroke={C.paper}
        strokeWidth={6}
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {lines.map((l, i) => (
          <tspan key={i} x={labelX} dy={i === 0 ? 0 : fontSize * 1.2}>
            {l}
          </tspan>
        ))}
      </text>
    </motion.g>
  );
}

/** External entity (rectangle). */
export function EntityBox({
  x,
  y,
  w,
  h,
  label,
  sub,
  emphasis,
  focusMode,
  onClick,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  emphasis: Emphasis;
  focusMode: boolean;
  onClick?: () => void;
}) {
  const active = emphasis === "active";
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: opacityFor(emphasis, focusMode), scale: 1 }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
      style={{ transformOrigin: `${x + w / 2}px ${y + h / 2}px`, cursor: onClick ? "pointer" : undefined }}
      onClick={onClick}
    >
      {/* offset print shadow */}
      <rect x={x + 6} y={y + 6} width={w} height={h} fill={active ? C.highlight : C.muted} />
      <rect x={x} y={y} width={w} height={h} fill={C.paper} stroke={active ? C.highlight : C.stroke} strokeWidth={active ? 3.5 : 2} />
      <text
        x={x + w / 2}
        y={y + h / 2 + (sub ? -4 : 9)}
        textAnchor="middle"
        fontSize={30}
        fontFamily="var(--font-display)"
        fontWeight={700}
        letterSpacing={0.5}
        fill={active ? C.highlight : C.text}
      >
        {label.toUpperCase()}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 24} textAnchor="middle" fontSize={14} fill={C.text} fillOpacity={0.6} fontFamily="var(--font-mono)">
          {sub}
        </text>
      )}
    </motion.g>
  );
}

/** Process (circle) — the main node: forest fill, white text. */
export function ProcessNode({
  cx,
  cy,
  r,
  number,
  lines,
  emphasis,
  focusMode,
  onClick,
  fontSize = 22,
}: {
  cx: number;
  cy: number;
  r: number;
  number?: string;
  lines: string[];
  emphasis: Emphasis;
  focusMode: boolean;
  onClick?: () => void;
  fontSize?: number;
}) {
  const active = emphasis === "active";
  const total = lines.length + (number ? 1 : 0);
  const startY = cy - ((total - 1) * fontSize * 1.15) / 2 + fontSize * 0.35;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: opacityFor(emphasis, focusMode), scale: 1 }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
      style={{ transformOrigin: `${cx}px ${cy}px`, cursor: onClick ? "pointer" : undefined }}
      onClick={onClick}
    >
      {active && (
        <circle cx={cx} cy={cy} r={r + 12} fill="none" stroke={C.highlight} strokeWidth={2} strokeDasharray="4 6" />
      )}
      <circle cx={cx} cy={cy} r={r} fill={C.highlight} stroke={C.stroke} strokeWidth={active ? 4 : 2} />
      <text textAnchor="middle" fontFamily="var(--font-sans)" fontSize={fontSize} fill={C.textOnDark}>
        {number && (
          <tspan x={cx} y={startY} fontWeight={600} fill={C.soft} fontFamily="var(--font-mono)">
            {number}
          </tspan>
        )}
        {lines.map((l, i) => (
          <tspan key={i} x={cx} y={startY + (i + (number ? 1 : 0)) * fontSize * 1.15} fontWeight={600}>
            {l}
          </tspan>
        ))}
      </text>
    </motion.g>
  );
}

/** Data store: white with green border (cylinder, matches the reference drawings). */
export function DataStore({
  x,
  y,
  w,
  h,
  code,
  label,
  emphasis,
  focusMode,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  code: string;
  label: string;
  emphasis: Emphasis;
  focusMode: boolean;
}) {
  const active = emphasis === "active";
  const ry = 10;
  const sw = active ? 3.5 : 2;
  return (
    <motion.g
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: opacityFor(emphasis, focusMode), y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
    >
      <path
        d={`M${x},${y + ry} L${x},${y + h - ry} A${w / 2},${ry} 0 0 0 ${x + w},${y + h - ry} L${x + w},${y + ry}`}
        fill={C.paper}
        stroke={C.highlight}
        strokeWidth={sw}
      />
      <ellipse cx={x + w / 2} cy={y + ry} rx={w / 2} ry={ry} fill={active ? C.highlight : C.soft} stroke={C.highlight} strokeWidth={sw} />
      <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fontFamily="var(--font-sans)">
        <tspan fontSize={14} fill={C.highlight} fontFamily="var(--font-mono)" fontWeight={600}>
          {code}
        </tspan>
        <tspan dx={8} fontSize={20} fill={C.text} fontWeight={600}>
          {label}
        </tspan>
      </text>
    </motion.g>
  );
}
