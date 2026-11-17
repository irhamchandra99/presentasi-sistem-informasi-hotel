"use client";

import { useCallback, useState } from "react";
import { useDeck } from "@/lib/deck";
import { DiagramPanel, DIAGRAM_HINTS, type PanelItem } from "./DiagramPanel";
import DiagramViewport, { useDiagramView } from "./DiagramViewport";
import { EntityBox, FlowPath, ProcessNode, type Emphasis } from "./primitives";
import { useDiagramKeys } from "./useDiagramKeys";

const W = 1600;
const H = 860;

type Flow = {
  id: string;
  entity: 1 | 2;
  d: string;
  label: string[];
  lx: number;
  ly: number;
};

/**
 * Context diagram. Flow directions are aligned with DFD Level 1 (balancing):
 * Manajer sends the report request; the system returns the reports.
 */
const FLOWS: Flow[] = [
  {
    id: "r-s",
    entity: 1,
    d: "M240,500 C240,650 470,690 640,566",
    label: ["Data tamu, reservasi, transaksi", "& pembaruan status kamar"],
    lx: 400,
    ly: 690,
  },
  {
    id: "s-r",
    entity: 1,
    d: "M596,380 C520,340 450,300 300,360",
    label: ["Konfirmasi reservasi, pembayaran,", "informasi & status kamar"],
    lx: 430,
    ly: 262,
  },
  {
    id: "m-s",
    entity: 2,
    d: "M1360,360 C1360,240 1110,220 986,333",
    label: ["Permintaan laporan", "& periode"],
    lx: 1200,
    ly: 196,
  },
  {
    id: "s-m",
    entity: 2,
    d: "M1004,480 C1100,620 1300,650 1360,500",
    label: ["Laporan hunian, pendapatan,", "riwayat tamu"],
    lx: 1190,
    ly: 678,
  },
];

const ITEMS: PanelItem[] = [
  {
    key: 1,
    title: "Resepsionis",
    summary: "Pengguna utama sistem",
    details: (
      <p>
        Memberi <b className="text-forest">data tamu, reservasi, transaksi</b> dan pembaruan status kamar. Menerima
        konfirmasi reservasi, pembayaran, serta informasi &amp; status kamar.
      </p>
    ),
  },
  {
    key: 2,
    title: "Manajer",
    summary: "Penerima laporan",
    details: (
      <p>
        Mengirim <b className="text-forest">permintaan laporan &amp; periode</b> (harian, mingguan, bulanan).
        Menerima laporan tingkat hunian, pendapatan, dan riwayat tamu.
      </p>
    ),
  },
];

export default function DfdLevel0({ slideId, active }: { slideId: string; active: boolean }) {
  const { reducedMotion } = useDeck();
  const { view, zoomAt, pan, reset } = useDiagramView();
  const [selected, setSelected] = useState<number | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  const select = useCallback((n: number | null) => setSelected(n), []);

  useDiagramKeys({
    slideId,
    active,
    maxNumber: 2,
    onNumber: (n) => select(selected === n ? null : n),
    onClear: () => {
      if (selected === null && !focusMode) return false;
      setSelected(null);
      setFocusMode(false);
      return true;
    },
    onZoom: (f) => zoomAt(f, W / 2, H / 2),
    onPan: pan,
    onReset: reset,
    onToggleFocus: () => setFocusMode((v) => !v),
  });

  const em = (entity: 1 | 2): Emphasis => (selected === null ? "normal" : selected === entity ? "active" : "dim");

  return (
    <div className="grid h-full grid-cols-[1fr_360px] gap-6">
      <DiagramViewport
        width={W}
        height={H}
        view={view}
        onZoom={zoomAt}
        onPan={pan}
        onReset={reset}
        focusMode={focusMode}
        onToggleFocus={() => setFocusMode((v) => !v)}
        onBackgroundClick={() => select(null)}
        title="DFD Level 0 (diagram konteks) Sistem Informasi Hotel"
      >
        {FLOWS.map((f, i) => (
          <FlowPath
            key={f.id}
            d={f.d}
            label={f.label}
            labelX={f.lx}
            labelY={f.ly}
            emphasis={em(f.entity)}
            focusMode={focusMode}
            reducedMotion={reducedMotion}
            delay={0.4 + i * 0.12}
            fontSize={20}
          />
        ))}
        <EntityBox x={90} y={360} w={300} h={140} label="Resepsionis" sub="Entitas eksternal" emphasis={em(1)} focusMode={focusMode} onClick={() => select(selected === 1 ? null : 1)} />
        <EntityBox x={1210} y={360} w={300} h={140} label="Manajer" sub="Entitas eksternal" emphasis={em(2)} focusMode={focusMode} onClick={() => select(selected === 2 ? null : 2)} />
        <ProcessNode
          cx={800}
          cy={430}
          r={210}
          number="0"
          lines={["Sistem Informasi", "Hotel"]}
          fontSize={38}
          emphasis={selected === null ? "normal" : "active"}
          focusMode={focusMode}
        />
      </DiagramViewport>

      <DiagramPanel
        items={ITEMS}
        selected={selected}
        onSelect={select}
        emptyHint={
          <div className="space-y-3">
            <p>
              Diagram konteks: seluruh sistem sebagai <b className="text-forest">satu proses</b> dengan dua entitas
              eksternal.
            </p>
            <p className="text-ink/60">
              Housekeeping <b className="text-ink">tidak mengakses aplikasi</b> secara langsung, sehingga bukan
              entitas eksternal. Laporan kebersihan kamar diteruskan lewat resepsionis.
            </p>
          </div>
        }
        hints={DIAGRAM_HINTS}
      />
    </div>
  );
}
