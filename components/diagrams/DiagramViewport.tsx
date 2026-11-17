"use client";

import { Focus, Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { DIAGRAM as C } from "@/lib/theme";

export type ViewState = { x: number; y: number; k: number };

const MIN_K = 0.6;
const MAX_K = 3.2;
const IDENTITY: ViewState = { x: 0, y: 0, k: 1 };

/**
 * Zoom/pan container for an SVG diagram. Coordinates are in viewBox units,
 * so it works regardless of the CSS scale applied to the 16:9 stage.
 */
export function useDiagramView() {
  const [view, setView] = useState<ViewState>(IDENTITY);

  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    setView((v) => {
      const k = Math.min(MAX_K, Math.max(MIN_K, v.k * factor));
      const f = k / v.k;
      return { k, x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f };
    });
  }, []);

  const pan = useCallback((dx: number, dy: number) => {
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  }, []);

  const reset = useCallback(() => setView(IDENTITY), []);

  /** Zoom so that the given viewBox rect fills the view. */
  const focusRect = useCallback((rect: { x: number; y: number; w: number; h: number }, vbW: number, vbH: number) => {
    const k = Math.min(MAX_K, Math.max(1, Math.min(vbW / rect.w, vbH / rect.h) * 0.85));
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    setView({ k, x: vbW / 2 - cx * k, y: vbH / 2 - cy * k });
  }, []);

  return { view, setView, zoomAt, pan, reset, focusRect };
}

type Props = {
  width: number;
  height: number;
  view: ViewState;
  onZoom: (factor: number, cx: number, cy: number) => void;
  onPan: (dx: number, dy: number) => void;
  onReset: () => void;
  focusMode: boolean;
  onToggleFocus: () => void;
  onBackgroundClick?: () => void;
  title: string;
  children: ReactNode;
  defs?: ReactNode;
};

export default function DiagramViewport({
  width,
  height,
  view,
  onZoom,
  onPan,
  onReset,
  focusMode,
  onToggleFocus,
  onBackgroundClick,
  title,
  children,
  defs,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  /** Converts a screen delta into viewBox units (accounts for stage scaling). */
  const unitsPerPx = () => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 1;
    // preserveAspectRatio="xMidYMid meet": uniform scale = max of both ratios
    return Math.max(width / rect.width, height / rect.height);
  };

  const toViewBox = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const u = unitsPerPx();
    const offsetX = (rect.width * u - width) / 2;
    const offsetY = (rect.height * u - height) / 2;
    return {
      x: (clientX - rect.left) * u - offsetX,
      y: (clientY - rect.top) * u - offsetY,
    };
  };

  return (
    <div className="relative h-full w-full">
    <div className="relative h-full w-full overflow-hidden rounded-md border border-ink bg-paper">
      {/* subtle blueprint grid */}
      <div aria-hidden className="tech-grid pointer-events-none absolute inset-0 opacity-50" />
      <svg
        ref={svgRef}
        role="img"
        aria-label={title}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="relative h-full w-full touch-none select-none"
        style={{ cursor: drag.current ? "grabbing" : "grab" }}
        onWheel={(e) => {
          const p = toViewBox(e.clientX, e.clientY);
          onZoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, p.x, p.y);
        }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          drag.current = { x: e.clientX, y: e.clientY, moved: false };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const dx = e.clientX - drag.current.x;
          const dy = e.clientY - drag.current.y;
          if (!drag.current.moved && Math.hypot(dx, dy) < 4) return;
          if (!drag.current.moved) {
            drag.current.moved = true;
            (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
          }
          const u = unitsPerPx();
          onPan(dx * u, dy * u);
          drag.current.x = e.clientX;
          drag.current.y = e.clientY;
        }}
        onPointerUp={(e) => {
          const wasDrag = drag.current?.moved;
          drag.current = null;
          if (!wasDrag && e.target === e.currentTarget) onBackgroundClick?.();
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <defs>
          <marker id="arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={C.activeFlow} />
          </marker>
          <marker id="arrow-muted" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={C.connector} fillOpacity={C.connectorOpacity} />
          </marker>
          <marker id="arrow-ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={C.stroke} />
          </marker>
          {defs}
        </defs>
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`} style={{ transition: drag.current ? "none" : "transform 450ms cubic-bezier(0.22,1,0.36,1)" }}>
          {children}
        </g>
      </svg>
    </div>

      {/* Toolbar sits in the slide header row, so it never covers the diagram */}
      <div data-export-hide className="absolute -top-[74px] right-0 flex items-center gap-1 rounded-md border border-ink bg-paper p-1">
        <span className="px-3 font-mono text-[15px] text-ink/70">{Math.round(view.k * 100)}%</span>
        <ToolButton label="Perbesar (+)" onClick={() => onZoom(1.25, width / 2, height / 2)}>
          <Plus size={18} />
        </ToolButton>
        <ToolButton label="Perkecil (−)" onClick={() => onZoom(1 / 1.25, width / 2, height / 2)}>
          <Minus size={18} />
        </ToolButton>
        <ToolButton label="Reset tampilan (0)" onClick={onReset}>
          <RotateCcw size={18} />
        </ToolButton>
        <ToolButton label="Focus mode (M)" onClick={onToggleFocus} active={focusMode}>
          {focusMode ? <Focus size={18} /> : <Maximize2 size={18} />}
        </ToolButton>
      </div>
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  children,
  active,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={(e) => {
        onClick();
        (e.currentTarget as HTMLButtonElement).blur();
      }}
      className={`grid h-10 w-10 place-items-center rounded transition-colors ${
        active ? "bg-forest text-paper" : "text-ink hover:bg-soft hover:text-forest"
      }`}
    >
      {children}
    </button>
  );
}
