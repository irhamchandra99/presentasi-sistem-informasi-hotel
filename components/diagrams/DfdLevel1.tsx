"use client";

import { useCallback, useEffect, useState } from "react";
import { useDeck } from "@/lib/deck";
import { DiagramPanel, DIAGRAM_HINTS, type PanelItem } from "./DiagramPanel";
import DiagramViewport, { useDiagramView } from "./DiagramViewport";
import { DataStore, EntityBox, FlowPath, ProcessNode, type Emphasis } from "./primitives";
import { useDiagramKeys } from "./useDiagramKeys";

const W = 2000;
const H = 1000;

type NodeId = "R" | "M" | "P1" | "P2" | "P3" | "P4" | "P5" | "D1" | "D2" | "D3" | "D4";

type Flow = {
  id: string;
  process: number;
  d: string;
  label: string | string[];
  lx: number;
  ly: number;
  anchor?: "start" | "middle" | "end";
  fontSize?: number;
};

/**
 * Flows redrawn from the reference DFD Level 1. Directions follow the data:
 * input from Resepsionis goes into the process, confirmations come back.
 */
const FLOWS: Flow[] = [
  // 1.0 Kelola Pelanggan
  { id: "r-p1", process: 1, d: "M200,128 L641,128", label: "Data pelanggan", lx: 214, ly: 117, anchor: "start" },
  { id: "p1-r", process: 1, d: "M641,172 L200,172", label: "Konfirmasi data pelanggan", lx: 214, ly: 161, anchor: "start" },
  { id: "p1-d1", process: 1, d: "M802,150 L1040,150", label: ["Data pelanggan", "baru / pembaruan"], lx: 921, ly: 104 },

  // 2.0 Kelola Reservasi
  { id: "r-p2", process: 2, d: "M200,358 L641,358", label: "Data pemesanan", lx: 214, ly: 347, anchor: "start" },
  { id: "p2-r", process: 2, d: "M641,402 L200,402", label: "Konfirmasi reservasi & informasi kamar", lx: 214, ly: 391, anchor: "start" },
  { id: "d1-p2", process: 2, d: "M1062,186 C1010,260 880,300 782,322", label: "Informasi pelanggan", lx: 975, ly: 266 },
  { id: "d2-p2", process: 2, d: "M1040,366 L801,366", label: "Data reservasi aktif", lx: 921, ly: 355 },
  { id: "p2-d2", process: 2, d: "M801,394 L1040,394", label: "Data reservasi baru", lx: 921, ly: 420 },
  { id: "d3-p2", process: 2, d: "M1045,598 C960,560 850,480 788,432", label: "Informasi kamar", lx: 975, ly: 528 },
  { id: "d4-p2", process: 2, d: "M560,262 C630,262 655,285 668,316", label: "Data petugas", lx: 572, ly: 246, anchor: "start" },

  // 3.0 Kelola Check-in, Check-out dan Pembayaran
  { id: "r-p3", process: 3, d: "M200,598 L641,598", label: "Data check-in, check-out & pembayaran", lx: 214, ly: 587, anchor: "start" },
  { id: "p3-r", process: 3, d: "M641,642 L200,642", label: "Konfirmasi proses & pembayaran", lx: 214, ly: 631, anchor: "start" },
  { id: "d2-p3", process: 3, d: "M1072,416 C1010,480 870,540 786,570", label: "Informasi reservasi", lx: 845, ly: 498, anchor: "end" },
  { id: "p3-d2", process: 3, d: "M800,600 C930,575 1100,520 1150,418", label: ["Pembaruan reservasi", "& pembayaran"], lx: 1112, ly: 476, anchor: "start" },
  { id: "p3-d3", process: 3, d: "M801,632 L1040,632", label: ["Pembaruan status", "hunian kamar"], lx: 921, ly: 660 },

  // 4.0 Kelola Status Kamar
  { id: "r-p4", process: 4, d: "M200,810 L648,810", label: "Pembaruan status kamar setelah dibersihkan", lx: 214, ly: 799, anchor: "start", fontSize: 18 },
  { id: "p4-r", process: 4, d: "M638,850 L200,850", label: "Konfirmasi pembaruan status", lx: 214, ly: 839, anchor: "start" },
  { id: "p4-r2", process: 4, d: "M648,890 L200,890", label: "Informasi kamar kotor", lx: 214, ly: 879, anchor: "start" },
  { id: "d3-p4", process: 4, d: "M1062,656 C1010,740 880,790 790,808", label: "Data status kamar", lx: 905, ly: 756, anchor: "end" },
  { id: "p4-d3", process: 4, d: "M800,866 C940,866 1120,820 1150,658", label: "Data kamar terbaru", lx: 990, ly: 886, anchor: "start" },

  // 5.0 Kelola Laporan
  { id: "d1-p5", process: 5, d: "M1240,150 C1330,150 1395,240 1422,322", label: "Data pelanggan", lx: 1340, ly: 130 },
  { id: "d2-p5", process: 5, d: "M1240,380 L1398,380", label: ["Data reservasi", "& pembayaran"], lx: 1318, ly: 324 },
  { id: "d3-p5", process: 5, d: "M1240,620 C1330,620 1395,520 1422,438", label: "Data kamar", lx: 1310, ly: 650 },
  { id: "m-p5", process: 5, d: "M1780,402 L1559,402", label: ["Permintaan laporan", "& periode"], lx: 1670, ly: 432 },
  { id: "p5-m", process: 5, d: "M1559,358 L1780,358", label: ["Laporan hunian,", "pendapatan, riwayat tamu"], lx: 1662, ly: 296 },
];

const MEMBERS: Record<number, NodeId[]> = {
  1: ["R", "P1", "D1"],
  2: ["R", "P2", "D1", "D2", "D3", "D4"],
  3: ["R", "P3", "D2", "D3"],
  4: ["R", "P4", "D3"],
  5: ["M", "P5", "D1", "D2", "D3"],
};

const FOCUS_RECT: Record<number, { x: number; y: number; w: number; h: number }> = {
  1: { x: 20, y: 70, w: 1240, h: 160 },
  2: { x: 20, y: 150, w: 1240, h: 470 },
  3: { x: 20, y: 380, w: 1260, h: 300 },
  4: { x: 20, y: 600, w: 1260, h: 330 },
  5: { x: 1030, y: 100, w: 960, h: 580 },
};

const ITEMS: PanelItem[] = [
  {
    key: 1,
    title: "1.0 Kelola Pelanggan",
    summary: "Input & pembaruan data tamu",
    details: (
      <>
        <p>
          Resepsionis memasukkan <b className="text-forest">data pelanggan</b>. Proses menyimpan data baru atau
          pembaruan ke <b>D1 Data Pelanggan</b>, lalu mengirim konfirmasi ke resepsionis.
        </p>
      </>
    ),
  },
  {
    key: 2,
    title: "2.0 Kelola Reservasi",
    summary: "Pemesanan kamar yang tersedia",
    details: (
      <p>
        Dari <b className="text-forest">data pemesanan</b>, proses membaca informasi pelanggan (D1), informasi kamar
        (D3), reservasi aktif (D2) dan data petugas (D4), lalu menyimpan <b>reservasi baru</b> ke D2 dan
        mengirim konfirmasi reservasi &amp; informasi kamar.
      </p>
    ),
  },
  {
    key: 3,
    title: "3.0 Check-in, Check-out & Pembayaran",
    summary: "Transaksi saat tamu datang & pulang",
    details: (
      <p>
        Resepsionis mencatat <b className="text-forest">check-in, check-out &amp; pembayaran</b>. Proses membaca
        informasi reservasi (D2), memperbarui reservasi &amp; pembayaran di D2, dan memperbarui{" "}
        <b>status hunian kamar</b> di D3 (terisi saat check-in, kotor saat check-out).
      </p>
    ),
  },
  {
    key: 4,
    title: "4.0 Kelola Status Kamar",
    summary: "Kotor → tersedia setelah dibersihkan",
    details: (
      <p>
        Proses membaca status kamar (D3) dan memberi <b className="text-forest">informasi kamar kotor</b> ke
        resepsionis. Setelah housekeeping melapor kamar selesai dibersihkan, resepsionis mengirim pembaruan status;
        data kamar terbaru disimpan ke D3.
      </p>
    ),
  },
  {
    key: 5,
    title: "5.0 Kelola Laporan",
    summary: "Laporan hunian & pendapatan",
    details: (
      <p>
        Manajer mengirim <b className="text-forest">permintaan laporan &amp; periode</b>. Proses menggabungkan
        data pelanggan (D1), reservasi &amp; pembayaran (D2), dan data kamar (D3) menjadi laporan hunian,
        pendapatan, dan riwayat tamu.
      </p>
    ),
  },
];

export default function DfdLevel1({ slideId, active }: { slideId: string; active: boolean }) {
  const { reducedMotion } = useDeck();
  const { view, zoomAt, pan, reset, focusRect } = useDiagramView();
  const [selected, setSelected] = useState<number | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  // Focus mode zooms to the selected process.
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
    maxNumber: 5,
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

  const nodeEmphasis = (id: NodeId): Emphasis =>
    selected === null ? "normal" : MEMBERS[selected].includes(id) ? "active" : "dim";
  const flowEmphasis = (f: Flow): Emphasis =>
    selected === null ? "normal" : f.process === selected ? "active" : "dim";

  const processProps = (n: number) => ({
    emphasis: nodeEmphasis(`P${n}` as NodeId),
    focusMode,
    onClick: () => select(selected === n ? null : n),
  });

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
        title="DFD Level 1 Sistem Informasi Hotel"
      >
        {FLOWS.map((f, i) => (
          <FlowPath
            key={f.id}
            d={f.d}
            label={f.label}
            labelX={f.lx}
            labelY={f.ly}
            anchor={f.anchor}
            fontSize={f.fontSize ?? 20}
            emphasis={flowEmphasis(f)}
            focusMode={focusMode}
            reducedMotion={reducedMotion}
            delay={0.3 + i * 0.03}
          />
        ))}

        <EntityBox x={20} y={80} w={180} h={840} label="Resepsionis" sub="Entitas eksternal" emphasis={nodeEmphasis("R")} focusMode={focusMode} />
        <EntityBox x={1780} y={335} w={200} h={90} label="Manajer" emphasis={nodeEmphasis("M")} focusMode={focusMode} />

        <DataStore x={1040} y={115} w={200} h={70} code="D1" label="Data Pelanggan" emphasis={nodeEmphasis("D1")} focusMode={focusMode} />
        <DataStore x={1040} y={345} w={200} h={70} code="D2" label="Data Reservasi" emphasis={nodeEmphasis("D2")} focusMode={focusMode} />
        <DataStore x={1040} y={585} w={200} h={70} code="D3" label="Data Kamar" emphasis={nodeEmphasis("D3")} focusMode={focusMode} />
        <DataStore x={360} y={225} w={200} h={70} code="D4" label="Data Pegawai" emphasis={nodeEmphasis("D4")} focusMode={focusMode} />

        <ProcessNode cx={720} cy={150} r={82} number="1.0" lines={["Kelola", "Pelanggan"]} fontSize={23} {...processProps(1)} />
        <ProcessNode cx={720} cy={380} r={82} number="2.0" lines={["Kelola", "Reservasi"]} fontSize={23} {...processProps(2)} />
        <ProcessNode cx={720} cy={620} r={82} number="3.0" lines={["Check-in,", "Check-out &", "Pembayaran"]} fontSize={19} {...processProps(3)} />
        <ProcessNode cx={720} cy={850} r={82} number="4.0" lines={["Kelola Status", "Kamar"]} fontSize={20} {...processProps(4)} />
        <ProcessNode cx={1480} cy={380} r={82} number="5.0" lines={["Kelola", "Laporan"]} fontSize={23} {...processProps(5)} />
      </DiagramViewport>

      <DiagramPanel
        items={ITEMS}
        selected={selected}
        onSelect={select}
        emptyHint={
          <div className="space-y-3">
            <p>
              Dekomposisi proses tunggal DFD Level 0 menjadi <b className="text-forest">5 proses</b>,{" "}
              <b className="text-forest">4 data store</b> dan <b className="text-forest">2 entitas eksternal</b>.
            </p>
            <p className="text-ink/60">
              Tekan <kbd className="text-forest">1</kbd>–<kbd className="text-forest">5</kbd> atau klik proses untuk
              menyorot alur datanya.
            </p>
          </div>
        }
        hints={DIAGRAM_HINTS}
      />
    </div>
  );
}
