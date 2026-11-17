"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useDeck } from "@/lib/deck";
import { EASE_OUT } from "@/lib/motion";
import { DIAGRAM as C } from "@/lib/theme";
import { DiagramPanel, DIAGRAM_HINTS, type PanelItem } from "./DiagramPanel";
import DiagramViewport, { useDiagramView } from "./DiagramViewport";
import { opacityFor, type Emphasis } from "./primitives";
import { useDiagramKeys } from "./useDiagramKeys";

const W = 1880;
const H = 950;

type EntityId = "pelanggan" | "kamar" | "pegawai" | "reservasi";
type Attr = { name: string; pk?: boolean; fk?: EntityId };

/** Attributes exactly as in the reference ERD (typos normalised). */
const ENTITIES: Record<EntityId, { label: string; cx: number; cy: number; attrs: Attr[] }> = {
  pelanggan: {
    label: "Pelanggan",
    cx: 330,
    cy: 285,
    attrs: [{ name: "id_pelanggan", pk: true }, { name: "nama" }, { name: "NIK" }, { name: "telp" }, { name: "email" }, { name: "alamat" }],
  },
  kamar: {
    label: "Kamar",
    cx: 940,
    cy: 285,
    attrs: [{ name: "id_kamar", pk: true }, { name: "no_kamar" }, { name: "tipe_kamar" }, { name: "harga" }, { name: "status_kamar" }],
  },
  pegawai: {
    label: "Pegawai",
    cx: 1560,
    cy: 285,
    attrs: [{ name: "id_pegawai", pk: true }, { name: "nama_pegawai" }, { name: "alamat" }, { name: "no_telp" }, { name: "jabatan" }],
  },
  reservasi: {
    label: "Reservasi",
    cx: 940,
    cy: 670,
    attrs: [
      { name: "id_reservasi", pk: true },
      { name: "id_pelanggan", fk: "pelanggan" },
      { name: "id_kamar", fk: "kamar" },
      { name: "id_pegawai", fk: "pegawai" },
      { name: "tanggal_reservasi" },
      { name: "tanggal_checkin" },
      { name: "tanggal_checkout" },
      { name: "total_harga" },
      { name: "status_reservasi" },
      { name: "status_pembayaran" },
      { name: "metode_pembayaran" },
      { name: "tanggal_pembayaran" },
    ],
  },
};

const EW = 230;
const EH = 70;

type Relation = {
  key: 1 | 2 | 3;
  name: string;
  parent: Exclude<EntityId, "reservasi">;
  diamond: { cx: number; cy: number };
  /** parent → diamond → reservasi */
  path: string;
  one: { x: number; y: number };
  many: { x: number; y: number };
};

const RELATIONS: Relation[] = [
  {
    key: 1,
    name: "melakukan",
    parent: "pelanggan",
    diamond: { cx: 330, cy: 480 },
    path: "M330,320 L330,435 M330,525 L330,670 L825,670",
    one: { x: 354, y: 352 },
    many: { x: 795, y: 652 },
  },
  {
    key: 2,
    name: "dipesan",
    parent: "kamar",
    diamond: { cx: 940, cy: 480 },
    path: "M940,320 L940,435 M940,525 L940,635",
    one: { x: 964, y: 352 },
    many: { x: 964, y: 610 },
  },
  {
    key: 3,
    name: "memproses",
    parent: "pegawai",
    diamond: { cx: 1560, cy: 480 },
    path: "M1560,320 L1560,435 M1560,525 L1560,670 L1055,670",
    one: { x: 1584, y: 352 },
    many: { x: 1085, y: 652 },
  },
];

const FOCUS_RECT: Record<number, { x: number; y: number; w: number; h: number }> = {
  1: { x: 0, y: 20, w: 1000, h: 910 },
  2: { x: 440, y: 20, w: 1000, h: 910 },
  3: { x: 560, y: 20, w: 1320, h: 910 },
};

const ITEMS: PanelItem[] = [
  {
    key: 1,
    title: "Pelanggan — Reservasi",
    summary: "melakukan · 1 : N",
    details: (
      <div className="space-y-2">
        <p>
          Satu <b className="text-forest">pelanggan</b> dapat <i>melakukan</i> banyak reservasi; setiap reservasi
          dimiliki tepat satu pelanggan.
        </p>
        <p className="font-mono text-[15px] text-ink/75">reservasi.id_pelanggan → pelanggan.id_pelanggan</p>
      </div>
    ),
  },
  {
    key: 2,
    title: "Kamar — Reservasi",
    summary: "dipesan · 1 : N",
    details: (
      <div className="space-y-2">
        <p>
          Satu <b className="text-forest">kamar</b> dapat <i>dipesan</i> dalam banyak reservasi (pada waktu berbeda);
          setiap reservasi untuk tepat satu kamar.
        </p>
        <p className="font-mono text-[15px] text-ink/75">reservasi.id_kamar → kamar.id_kamar</p>
      </div>
    ),
  },
  {
    key: 3,
    title: "Pegawai — Reservasi",
    summary: "memproses · 1 : N",
    details: (
      <div className="space-y-2">
        <p>
          Satu <b className="text-forest">pegawai</b> (resepsionis) dapat <i>memproses</i> banyak reservasi; setiap
          reservasi diproses oleh satu pegawai.
        </p>
        <p className="font-mono text-[15px] text-ink/75">reservasi.id_pegawai → pegawai.id_pegawai</p>
      </div>
    ),
  },
];

function attrLayout(id: EntityId) {
  const e = ENTITIES[id];
  const n = e.attrs.length;
  if (id === "reservasi") {
    return e.attrs.map((a, i) => ({
      ...a,
      x: e.cx + (i - (n - 1) / 2) * 140,
      y: i % 2 === 0 ? 830 : 905,
    }));
  }
  const spacing = n === 6 ? 96 : 112;
  return e.attrs.map((a, i) => ({
    ...a,
    x: e.cx + (i - (n - 1) / 2) * spacing,
    y: i % 2 === 0 ? 45 : 120,
  }));
}

const pillWidth = (name: string) => Math.max(96, name.length * 11.2 + 30);

export default function Erd({ slideId, active }: { slideId: string; active: boolean }) {
  const { reducedMotion } = useDeck();
  const { view, zoomAt, pan, reset, focusRect } = useDiagramView();
  const [selected, setSelected] = useState<number | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    if (focusMode && selected) focusRect(FOCUS_RECT[selected], W, H);
    else if (focusMode && !selected) reset();
  }, [focusMode, selected, focusRect, reset]);

  const select = useCallback(
    (n: number | null) => {
      setSelected(n);
      if (!n && !focusMode) reset();
    },
    [focusMode, reset],
  );

  useDiagramKeys({
    slideId,
    active,
    maxNumber: 3,
    onNumber: (n) => select(selected === n ? null : n),
    onClear: () => {
      if (selected === null && !focusMode) return false;
      setSelected(null);
      setFocusMode(false);
      reset();
      return true;
    },
    onZoom: (f) => zoomAt(f, W / 2, H / 2),
    onPan: pan,
    onReset: reset,
    onToggleFocus: () => setFocusMode((v) => !v),
  });

  const rel = RELATIONS.find((r) => r.key === selected) ?? null;
  const entityEm = (id: EntityId): Emphasis =>
    !rel ? "normal" : id === "reservasi" || id === rel.parent ? "active" : "dim";
  const relEm = (r: Relation): Emphasis => (!rel ? "normal" : r.key === rel.key ? "active" : "dim");
  const attrEm = (owner: EntityId, a: Attr): Emphasis => {
    if (!rel) return "normal";
    if (owner === rel.parent && a.pk) return "active";
    if (owner === "reservasi" && a.fk === rel.parent) return "active";
    return "dim";
  };

  const layouts = {
    pelanggan: attrLayout("pelanggan"),
    kamar: attrLayout("kamar"),
    pegawai: attrLayout("pegawai"),
    reservasi: attrLayout("reservasi"),
  };

  /** Dashed PK → FK link for the selected relation. */
  const keyLink = (() => {
    if (!rel) return null;
    const pk = layouts[rel.parent].find((a) => a.pk)!;
    const fk = layouts.reservasi.find((a) => a.fk === rel.parent)!;
    const sx = pk.x;
    const sy = pk.y + 21;
    const ex = fk.x;
    const ey = fk.y - 23;
    const c: Record<Relation["parent"], [number, number, number, number]> = {
      pelanggan: [30, 450, 180, 700],
      kamar: [660, 380, 520, 640],
      pegawai: [1260, 450, 760, 650],
    };
    const [c1x, c1y, c2x, c2y] = c[rel.parent];
    return `M${sx},${sy} C${c1x},${c1y} ${c2x},${c2y} ${ex},${ey}`;
  })();

  return (
    <div className="grid h-full grid-cols-[1fr_360px] gap-6">
      <DiagramViewport
        width={W}
        height={H}
        view={view}
        onZoom={zoomAt}
        onPan={pan}
        onReset={() => {
          reset();
          setFocusMode(false);
        }}
        focusMode={focusMode}
        onToggleFocus={() => setFocusMode((v) => !v)}
        onBackgroundClick={() => select(null)}
        title="Entity Relationship Diagram Sistem Informasi Hotel"
      >
        {/* Attribute connectors */}
        {(Object.keys(ENTITIES) as EntityId[]).map((id) => {
          const e = ENTITIES[id];
          return layouts[id].map((a) => {
            const fromY = id === "reservasi" ? e.cy + EH / 2 : e.cy - EH / 2;
            const toY = id === "reservasi" ? a.y - 19 : a.y + 19;
            const midY = (fromY + toY) / 2;
            return (
              <motion.path
                key={`${id}-${a.name}-line`}
                d={`M${e.cx},${fromY} C${e.cx},${midY} ${a.x},${midY} ${a.x},${toY}`}
                fill="none"
                stroke={attrEm(id, a) === "active" ? C.highlight : C.stroke}
                strokeOpacity={attrEm(id, a) === "active" ? 1 : 0.35}
                strokeWidth={attrEm(id, a) === "active" ? 2.5 : 1.3}
                initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: opacityFor(attrEm(id, a), focusMode) }}
                transition={{ duration: 0.8, delay: reducedMotion ? 0 : 0.5, ease: EASE_OUT }}
              />
            );
          });
        })}

        {/* Relationship lines */}
        {RELATIONS.map((r) => {
          const em = relEm(r);
          const on = em === "active";
          return (
            <motion.g
              key={r.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: opacityFor(em, focusMode) }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              style={{ cursor: "pointer" }}
              onClick={() => select(selected === r.key ? null : r.key)}
            >
              <path d={r.path} fill="none" stroke={on ? C.highlight : C.stroke} strokeWidth={on ? 4 : 2} />
              {on && <path d={r.path} fill="none" stroke={C.paper} strokeWidth={1.5} className="flow-animated" />}
              {on && !reducedMotion && (
                <circle r={7} fill={C.highlight} stroke={C.paper} strokeWidth={2}>
                  <animateMotion dur="2.4s" repeatCount="indefinite" path={r.path.replace(/ M/g, " L")} />
                </circle>
              )}
              <polygon
                points={`${r.diamond.cx},${r.diamond.cy - 45} ${r.diamond.cx + 120},${r.diamond.cy} ${r.diamond.cx},${r.diamond.cy + 45} ${r.diamond.cx - 120},${r.diamond.cy}`}
                fill={on ? C.highlight : C.paper}
                stroke={on ? C.highlight : C.stroke}
                strokeWidth={2}
              />
              <text x={r.diamond.cx} y={r.diamond.cy + 7} textAnchor="middle" fontSize={23} fontWeight={600} fill={on ? C.textOnDark : C.text} fontFamily="var(--font-sans)">
                {r.name}
              </text>
              {/* Cardinality badges */}
              {[
                { p: r.one, t: "1" },
                { p: r.many, t: "N" },
              ].map(({ p, t }) => (
                <g key={t}>
                  {on && !reducedMotion && (
                    <circle cx={p.x} cy={p.y} r={16} fill="none" stroke={C.highlight} strokeWidth={2}>
                      <animate attributeName="r" values="16;26" dur="1.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0" dur="1.4s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={p.x} cy={p.y} r={16} fill={on ? C.highlight : C.paper} stroke={on ? C.highlight : C.stroke} strokeWidth={1.5} />
                  <text x={p.x} y={p.y + 6} textAnchor="middle" fontSize={17} fontWeight={700} fill={on ? C.textOnDark : C.text} fontFamily="var(--font-mono)">
                    {t}
                  </text>
                </g>
              ))}
            </motion.g>
          );
        })}

        {/* PK → FK link */}
        {keyLink && (
          <g>
            <path d={keyLink} fill="none" stroke={C.fk} strokeWidth={2.5} strokeDasharray="6 6" className="flow-animated" markerEnd="url(#arrow-active)" />
            {!reducedMotion && (
              <circle r={6} fill={C.highlight} stroke={C.paper} strokeWidth={2}>
                <animateMotion dur="2s" repeatCount="indefinite" path={keyLink} />
              </circle>
            )}
          </g>
        )}

        {/* Entities */}
        {(Object.keys(ENTITIES) as EntityId[]).map((id) => {
          const e = ENTITIES[id];
          const em = entityEm(id);
          const on = em === "active";
          return (
            <motion.g
              key={id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: opacityFor(em, focusMode), scale: 1 }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
              style={{ transformOrigin: `${e.cx}px ${e.cy}px` }}
            >
              <rect
                x={e.cx - EW / 2}
                y={e.cy - EH / 2}
                width={EW}
                height={EH}
                fill={on ? C.highlight : C.paper}
                stroke={on ? C.highlight : C.stroke}
                strokeWidth={2.5}
              />
              <text x={e.cx} y={e.cy + 11} textAnchor="middle" fontSize={32} fontWeight={700} letterSpacing={1} fill={on ? C.textOnDark : C.text} fontFamily="var(--font-display)">
                {e.label.toUpperCase()}
              </text>
            </motion.g>
          );
        })}

        {/* Attribute pills */}
        {(Object.keys(ENTITIES) as EntityId[]).map((id) =>
          layouts[id].map((a, i) => {
            const em = attrEm(id, a);
            const on = em === "active";
            const w = pillWidth(a.name);
            return (
              <motion.g
                key={`${id}-${a.name}`}
                initial={{ opacity: 0, y: id === "reservasi" ? 10 : -10 }}
                animate={{ opacity: opacityFor(em, focusMode), y: 0 }}
                transition={{ duration: 0.5, delay: reducedMotion ? 0 : 0.6 + i * 0.03, ease: EASE_OUT }}
              >
                <rect
                  x={a.x - w / 2}
                  y={a.y - 19}
                  width={w}
                  height={38}
                  rx={19}
                  fill={a.pk ? C.pk : a.fk ? C.fk : C.paper}
                  stroke={a.pk ? C.pk : a.fk ? C.stroke : C.stroke}
                  strokeOpacity={a.pk || a.fk ? 1 : 0.4}
                  strokeWidth={on ? 3 : 1.5}
                  strokeDasharray={a.fk ? "5 4" : undefined}
                />
                <text
                  x={a.x}
                  y={a.y + 6}
                  textAnchor="middle"
                  fontSize={18}
                  fontWeight={a.pk ? 700 : 500}
                  fill={a.pk ? C.textOnDark : C.text}
                  fontFamily="var(--font-mono)"
                  textDecoration={a.pk ? "underline" : undefined}
                >
                  {a.name}
                </text>
              </motion.g>
            );
          }),
        )}
      </DiagramViewport>

      <DiagramPanel
        items={ITEMS}
        selected={selected}
        onSelect={select}
        emptyHint={
          <div className="space-y-3">
            <p>
              Empat entitas. <b className="text-forest">Reservasi</b> menjadi pusat: menyimpan foreign key ke
              pelanggan, kamar dan pegawai.
            </p>
            <div className="flex flex-wrap gap-3 text-[15px]">
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-8 rounded-full bg-forest" /> Primary key
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-8 rounded-full border border-dashed border-forest" /> Foreign key
              </span>
            </div>
            <p className="text-ink/60">
              Tekan <kbd className="text-forest">1</kbd>–<kbd className="text-forest">3</kbd> untuk menyorot relasi
              1:N.
            </p>
          </div>
        }
        hints={DIAGRAM_HINTS}
      />
    </div>
  );
}
