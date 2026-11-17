"use client";

import {
  ArrowRight,
  BedDouble,
  BellRing,
  BookOpenCheck,
  CalendarCheck,
  CircleDollarSign,
  ClipboardList,
  Database,
  FileBarChart2,
  FileText,
  Gauge,
  KeyRound,
  LogIn,
  LogOut,
  MonitorCheck,
  PenLine,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import DfdLevel0 from "@/components/diagrams/DfdLevel0";
import DfdLevel1 from "@/components/diagrams/DfdLevel1";
import Erd from "@/components/diagrams/Erd";
import { useDeck } from "@/lib/deck";
import { EASE_OUT, fadeIn, fadeUp, scaleIn, slideFromLeft, slideFromRight, stagger } from "@/lib/motion";
import { Card, Headline, IconBadge, Kicker, SlideShell } from "./ui";

export type SlideProps = { id: string; active: boolean };

/* ───────────────────────────── 01 · COVER ───────────────────────────── */

export function CoverSlide() {
  const members = [
    { name: "Abdul Afif Aiman", nim: "25051130045" },
    { name: "Muhammad Abrar Akmal", nim: "25051130050" },
    { name: "Irham Kadarusman", nim: "25051130056" },
  ];
  return (
    <SlideShell className="justify-center">
      {/* Left-side vignette so text stays readable over the 3D scene */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[1150px]"
        style={{ background: "linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 45%, transparent 100%)" }}
      />
      <div className="relative w-[960px]">
        <Kicker number="01">Rekayasa Perangkat Lunak · Kelompok 10</Kicker>
        <Headline text="Sistem Informasi Hotel" accent={["Hotel"]} className="mt-10 text-[150px]" />
        <motion.p variants={fadeUp} className="mt-8 max-w-[760px] text-[30px] font-light leading-snug text-ink/80">
          Satu sistem terpusat untuk data tamu, kamar, reservasi, pembayaran, dan laporan hotel.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-14 flex w-[640px] items-center gap-3"><span className="h-px flex-1 bg-ink" /><span className="font-mono text-[14px] tracking-[0.2em] text-ink/60">TIM PENYUSUN</span></motion.div>
        <motion.ul variants={stagger(0.1, 0)} className="mt-10 flex gap-6">
          {members.map((m) => (
            <motion.li
              key={m.nim}
              variants={fadeUp}
              className="glass rounded-md px-6 py-4"
              whileHover={{ y: -4 }}
            >
              <div className="text-[22px] font-semibold text-ink">{m.name}</div>
              <div className="mt-1 font-mono text-[18px] text-forest">{m.nim}</div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
      <motion.div
        data-export-hide
        variants={fadeIn}
        className="absolute bottom-[130px] right-[120px] flex items-center gap-3 text-[18px] text-ink/75"
      >
        Tekan <kbd className="rounded-md border border-forest/40 px-2 py-0.5 text-forest">→</kbd> untuk mulai
      </motion.div>
    </SlideShell>
  );
}

/* ─────────────────────────── 02 · DESKRIPSI ─────────────────────────── */

export function DescriptionSlide() {
  const before = ["Pencatatan manual di buku", "Data tamu & kamar tercecer", "Rawan salah & pesanan ganda", "Laporan disusun manual"];
  const after = [
    "Data tamu, kamar & reservasi terpusat",
    "Pemesanan, check-in, check-out lebih cepat",
    "Rapi & minim kesalahan",
    "Laporan hunian & pendapatan otomatis",
  ];
  return (
    <SlideShell>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 55%, transparent 100%)" }}
      />
      <div className="relative">
        <Kicker number="02">Deskripsi Sistem</Kicker>
        <Headline text="Dari buku catatan ke sistem terpusat" accent={["terpusat"]} className="mt-6 max-w-[1200px] text-[88px]" />
        <motion.p variants={fadeUp} className="mt-6 max-w-[1080px] text-[27px] leading-relaxed text-ink/80">
          Aplikasi untuk membantu hotel mengelola <b className="font-semibold text-ink">data tamu, kamar, dan reservasi</b>{" "}
          dalam satu sistem, menggantikan pencatatan manual, serta menyiapkan laporan otomatis untuk manajer.
        </motion.p>
      </div>

      <div className="relative mt-auto grid grid-cols-[1fr_auto_1fr] items-stretch gap-8">
        <Card className="p-9" hover={false}>
          <div className="flex items-center gap-4">
            <IconBadge className="!bg-paper !text-ink border border-ink">
              <PenLine size={28} />
            </IconBadge>
            <div className="text-[30px] font-semibold text-ink/75">Sebelum · Manual</div>
          </div>
          <ul className="mt-6 space-y-3.5">
            {before.map((b) => (
              <li key={b} className="flex items-center gap-3 text-[23px] text-ink/75">
                <span className="h-2 w-2 rounded-full bg-olive" />
                {b}
              </li>
            ))}
          </ul>
        </Card>
        <motion.div variants={scaleIn} className="grid place-items-center">
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="grid h-20 w-20 place-items-center rounded-full border border-forest/50 bg-forest/10 text-forest"
          >
            <ArrowRight size={36} />
          </motion.div>
        </motion.div>
        <Card className="border-forest/40 p-9">
          <div className="flex items-center gap-4">
            <IconBadge>
              <MonitorCheck size={28} />
            </IconBadge>
            <div className="text-[30px] font-semibold text-forest">Sesudah · Sistem Informasi</div>
          </div>
          <ul className="mt-6 space-y-3.5">
            {after.map((a) => (
              <li key={a} className="flex items-center gap-3 text-[23px] text-ink">
                <ShieldCheck size={22} className="shrink-0 text-forest" />
                {a}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </SlideShell>
  );
}

/* ─────────────────────────── 03 · KEBUTUHAN ─────────────────────────── */

export function NeedsSlide() {
  const needs = [
    { icon: UserPlus, title: "Mencatat data tamu baru", text: "Identitas, kontak, dan alamat tamu tersimpan rapi dan mudah dicari." },
    { icon: CalendarCheck, title: "Memproses reservasi", text: "Pemesanan hanya pada kamar yang berstatus tersedia." },
    { icon: Gauge, title: "Memantau status kamar", text: "Tersedia, terisi, atau kotor terlihat secara langsung." },
    { icon: CircleDollarSign, title: "Mencatat pembayaran", text: "Pembayaran dikonfirmasi saat check-out dan masuk ke laporan." },
  ];
  return (
    <SlideShell>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 60%, transparent 100%)" }}
      />
      <div className="relative">
        <Kicker number="03">Kebutuhan Utama</Kicker>
        <Headline text="Empat hal yang wajib dikerjakan sistem" accent={["Empat"]} className="mt-6 max-w-[1150px] text-[84px]" />
      </div>
      <motion.div variants={stagger(0.1, 0.2)} className="relative mt-12 grid grid-cols-2 gap-6 pr-[420px]">
        {needs.map((n, i) => (
          <Card key={n.title} className="flex gap-6 p-8">
            <IconBadge>
              <n.icon size={28} />
            </IconBadge>
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[18px] text-forest">0{i + 1}</span>
                <h3 className="text-[29px] font-semibold text-ink">{n.title}</h3>
              </div>
              <p className="mt-2 text-[22px] leading-snug text-ink/75">{n.text}</p>
            </div>
          </Card>
        ))}
      </motion.div>
      <motion.div variants={fadeUp} className="relative mt-auto flex max-w-[1260px] items-center gap-6 rounded-md border border-forest/25 bg-soft px-8 py-5 text-[23px] text-ink">
        <Sparkles size={26} className="shrink-0 text-forest" />
        <span>
          Hasilnya: <b className="text-forest">resepsionis</b> selalu tahu kamar mana yang siap disewakan, dan{" "}
          <b className="text-forest">manajer</b> mengambil keputusan dari data yang akurat.
        </span>
      </motion.div>
    </SlideShell>
  );
}

/* ──────────────────────────── 04 · PENGGUNA ─────────────────────────── */

export function UsersSlide() {
  const roles = [
    {
      icon: UserRound,
      name: "Resepsionis",
      badge: "Akses langsung · pengguna utama",
      direct: true,
      tasks: ["Memasukkan data tamu baru", "Memproses reservasi", "Mencatat check-in & check-out", "Mengonfirmasi pembayaran", "Memperbarui status kamar"],
    },
    {
      icon: Sparkles,
      name: "Staf Housekeeping",
      badge: "Tidak mengakses aplikasi",
      direct: false,
      tasks: [
        "Menjaga kesiapan kamar",
        "Membersihkan kamar setelah check-out (status: kotor)",
        "Melapor ke resepsionis setelah selesai",
        "Resepsionis yang mengubah status menjadi tersedia",
      ],
    },
    {
      icon: FileBarChart2,
      name: "Manajer",
      badge: "Akses langsung · laporan",
      direct: true,
      tasks: ["Mengawasi sirkulasi tamu & kamar", "Melihat riwayat pelanggan", "Melihat tingkat hunian kamar", "Menerima laporan pendapatan"],
    },
  ];
  return (
    <SlideShell>
      <Kicker number="04">Pengguna & Peran</Kicker>
      <Headline text="Siapa memakai sistem, dan untuk apa" accent={["Siapa"]} className="mt-6 text-[84px]" />
      <motion.div variants={stagger(0.12, 0.2)} className="mt-12 grid flex-1 grid-cols-3 gap-7">
        {roles.map((r) => (
          <Card
            key={r.name}
            className={`relative flex flex-col overflow-hidden p-9 ${r.direct ? "" : "border-dashed border-ink/40"}`}
          >
            <IconBadge className={r.direct ? "" : "!bg-paper !text-ink border border-dashed border-ink"}>
              <r.icon size={28} />
            </IconBadge>
            <h3 className="mt-6 font-display text-[54px] font-bold uppercase leading-none text-ink">{r.name}</h3>
            <span
              className={`mt-4 inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-[17px] font-semibold ${
                r.direct ? "bg-forest/10 text-forest" : "bg-ink/10 text-ink/75"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${r.direct ? "bg-forest" : "bg-olive"}`} />
              {r.badge}
            </span>
            <ul className="mt-6 space-y-3">
              {r.tasks.map((t) => (
                <li key={t} className="flex gap-3 text-[22px] leading-snug text-ink/80">
                  <span className={`mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full ${r.direct ? "bg-forest" : "bg-olive"}`} />
                  {t}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </motion.div>
    </SlideShell>
  );
}

/* ─────────────────────────── 05–07 · DIAGRAMS ───────────────────────── */

function DiagramSlide({
  number,
  kicker,
  title,
  children,
}: {
  number: string;
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={stagger(0.07, 0.05)}
      initial="hidden"
      animate="show"
      className="flex h-full w-full flex-col px-[56px] pb-[96px] pt-[48px]"
    >
      <div className="flex items-end justify-between">
        <div>
          <Kicker number={number}>{kicker}</Kicker>
          <Headline text={title} className="mt-2 text-[56px]" />
        </div>
      </div>
      <motion.div variants={fadeIn} className="mt-5 min-h-0 flex-1">
        {children}
      </motion.div>
    </motion.div>
  );
}

export function Dfd0Slide({ id, active }: SlideProps) {
  return (
    <DiagramSlide number="05" kicker="Data Flow Diagram" title="DFD Level 0 — Diagram Konteks">
      <DfdLevel0 slideId={id} active={active} />
    </DiagramSlide>
  );
}

export function Dfd1Slide({ id, active }: SlideProps) {
  return (
    <DiagramSlide number="06" kicker="Data Flow Diagram" title="DFD Level 1 — Proses Utama">
      <DfdLevel1 slideId={id} active={active} />
    </DiagramSlide>
  );
}

export function ErdSlide({ id, active }: SlideProps) {
  return (
    <DiagramSlide number="07" kicker="Rancangan Data" title="Entity Relationship Diagram">
      <Erd slideId={id} active={active} />
    </DiagramSlide>
  );
}

/* ─────────────────────────── 08 · DATABASE ──────────────────────────── */

type Col = { name: string; note?: string; key?: "PK" | "FK" };

export function DatabaseSlide() {
  const tables: { name: string; icon: typeof Users; desc: string; cols: Col[] }[] = [
    {
      name: "pelanggan",
      icon: Users,
      desc: "Data tamu hotel",
      cols: [
        { name: "id_pelanggan", key: "PK" },
        { name: "nama" },
        { name: "NIK", note: "no. identitas (KTP)" },
        { name: "telp" },
        { name: "email" },
        { name: "alamat" },
      ],
    },
    {
      name: "kamar",
      icon: BedDouble,
      desc: "Data kamar hotel",
      cols: [
        { name: "id_kamar", key: "PK" },
        { name: "no_kamar" },
        { name: "tipe_kamar", note: "standar · deluxe · suite" },
        { name: "harga", note: "per malam" },
        { name: "status_kamar", note: "tersedia · terisi · kotor" },
      ],
    },
    {
      name: "pegawai",
      icon: KeyRound,
      desc: "Data pegawai hotel",
      cols: [
        { name: "id_pegawai", key: "PK" },
        { name: "nama_pegawai" },
        { name: "alamat" },
        { name: "no_telp" },
        { name: "jabatan", note: "resepsionis · cleaning service · manajer" },
      ],
    },
    {
      name: "reservasi",
      icon: ClipboardList,
      desc: "Transaksi pemesanan & pembayaran",
      cols: [
        { name: "id_reservasi", key: "PK" },
        { name: "id_pelanggan", key: "FK" },
        { name: "id_kamar", key: "FK" },
        { name: "id_pegawai", key: "FK" },
        { name: "tanggal_reservasi" },
        { name: "tanggal_checkin" },
        { name: "tanggal_checkout" },
        { name: "total_harga" },
        { name: "status_reservasi", note: "selesai saat check-out" },
        { name: "status_pembayaran" },
        { name: "metode_pembayaran" },
        { name: "tanggal_pembayaran" },
      ],
    },
  ];
  return (
    <SlideShell className="!pt-[64px]">
      <Kicker number="08">Rancangan Database</Kicker>
      <Headline text="Empat tabel yang saling terhubung" accent={["Empat"]} className="mt-4 text-[70px]" />
      <motion.div variants={stagger(0.1, 0.2)} className="mt-8 grid grid-cols-[1fr_1fr_1fr_1.25fr] items-start gap-5">
        {tables.map((t) => (
          <Card key={t.name} className="flex flex-col overflow-hidden p-0">
            <div className="flex items-center gap-3 border-b border-forest/20 bg-soft px-6 py-4">
              <t.icon size={24} className="text-forest" />
              <div>
                <div className="font-mono text-[24px] font-semibold text-ink">{t.name}</div>
                <div className="text-[15px] text-ink/60">{t.desc}</div>
              </div>
            </div>
            <ul className="flex-1 px-6 py-3">
              {t.cols.map((c) => (
                <li key={c.name} className="flex items-baseline gap-3 border-b border-line py-[7px] last:border-0">
                  <span
                    className={`w-9 shrink-0 text-center font-mono text-[12px] font-bold ${
                      c.key === "PK" ? "rounded bg-forest text-paper" : c.key === "FK" ? "rounded border border-dashed border-forest text-forest" : ""
                    }`}
                  >
                    {c.key ?? ""}
                  </span>
                  <span className="min-w-0">
                    <span className={`font-mono text-[18px] ${c.key ? "font-semibold text-ink" : "text-ink"}`}>{c.name}</span>
                    {c.note && <span className="block text-[14px] leading-tight text-ink/60">{c.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </motion.div>
      <motion.div
        variants={fadeUp}
        className="absolute bottom-[110px] left-[120px] w-[1180px] rounded-md border border-forest/25 bg-soft px-7 py-5 text-ink"
      >
        <div className="text-[17px] uppercase tracking-[0.2em] text-ink/60">Relasi 1 : N · semua mengarah ke reservasi</div>
        <div className="mt-3 flex items-center justify-between">
        {["pelanggan", "kamar", "pegawai"].map((t) => (
          <span key={t} className="flex items-center gap-3 whitespace-nowrap font-mono text-[20px]">
            {t}
            <span className="rounded bg-forest px-1.5 text-[13px] font-bold text-paper">1</span>
            <ArrowRight size={18} className="text-forest" />
            <span className="rounded border border-dashed border-forest px-1.5 text-[13px] font-bold text-forest">N</span>
            reservasi
          </span>
        ))}
        </div>
      </motion.div>
    </SlideShell>
  );
}

/* ─────────────────────────── 09 · ALUR KERJA ────────────────────────── */

export function WorkflowSlide({ active }: SlideProps) {
  const { reducedMotion } = useDeck();
  const steps = [
    { icon: UserPlus, title: "Data tamu", text: "Resepsionis memasukkan data tamu baru", status: null },
    { icon: CalendarCheck, title: "Reservasi", text: "Dibuat pada kamar yang tersedia", status: "tersedia" },
    { icon: LogIn, title: "Check-in", text: "Tamu datang, check-in dicatat", status: "terisi" },
    { icon: LogOut, title: "Check-out & bayar", text: "Pembayaran dikonfirmasi, reservasi selesai", status: "kotor" },
    { icon: Sparkles, title: "Dibersihkan", text: "Housekeeping lapor, resepsionis memperbarui", status: "tersedia" },
  ] as const;
  const [hover, setHover] = useState<number | null>(null);

  const statusStyle: Record<string, string> = {
    tersedia: "bg-forest text-paper border-forest",
    terisi: "bg-ink text-paper border-ink",
    kotor: "bg-olive text-ink border-olive",
  };

  return (
    <SlideShell>
      <Kicker number="09">Alur Kerja</Kicker>
      <Headline text="Satu siklus tamu, satu siklus kamar" accent={["siklus"]} className="mt-6 text-[84px]" />

      <div className="relative my-auto">
        {/* rail */}
        <div className="absolute left-[90px] right-[90px] top-[44px] h-[2px] bg-ink/10" />
        <motion.div
          className="absolute left-[90px] top-[44px] h-[3px] origin-left bg-forest"
          style={{ right: 90 }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: active ? 1 : 0 }}
          transition={{ duration: reducedMotion ? 0 : 2.2, delay: 0.4, ease: EASE_OUT }}
        />
        <motion.ol variants={stagger(0.18, 0.3)} className="relative grid grid-cols-5 gap-5">
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              variants={fadeUp}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                animate={{ scale: hover === i ? 1.08 : 1 }}
                className="relative grid h-[88px] w-[88px] place-items-center rounded-full border-2 border-ink bg-paper text-forest"
              >
                <s.icon size={36} />
                <span className="absolute -top-2 -right-2 grid h-8 w-8 place-items-center rounded-full bg-forest font-mono text-[15px] font-bold text-paper">
                  {i + 1}
                </span>
              </motion.div>
              <div className="mt-6 text-[29px] font-semibold text-ink">{s.title}</div>
              <p className="mt-2 max-w-[290px] text-[21px] leading-snug text-ink/75">{s.text}</p>
              {s.status && (
                <span className={`mt-4 rounded-full border px-4 py-1 font-mono text-[17px] ${statusStyle[s.status]}`}>
                  status_kamar: {s.status}
                </span>
              )}
            </motion.li>
          ))}
        </motion.ol>
      </div>

      <motion.div variants={fadeUp} className="glass mx-auto flex items-center justify-center gap-5 rounded-full px-10 py-5 text-[22px]">
        <span className="text-ink/60">Siklus status kamar</span>
        {(["tersedia", "terisi", "kotor", "tersedia"] as const).map((s, i, arr) => (
          <span key={i} className="flex items-center gap-5">
            <span className={`rounded-full border px-5 py-1.5 font-mono ${statusStyle[s]}`}>{s}</span>
            {i < arr.length - 1 && (
              <span className="flex items-center gap-2 text-[16px] text-ink/60">
                <ArrowRight size={20} className="text-forest" />
                {["check-in", "check-out", "dibersihkan"][i]}
                <ArrowRight size={20} className="text-forest" />
              </span>
            )}
          </span>
        ))}
      </motion.div>
    </SlideShell>
  );
}

/* ──────────────────────────── 10 · LAPORAN ──────────────────────────── */

export function ReportSlide() {
  const periods = ["Harian", "Mingguan", "Bulanan"] as const;
  const [period, setPeriod] = useState<(typeof periods)[number]>("Bulanan");
  const occupancy = [
    { label: "Stok kamar", text: "Ketersediaan seluruh kamar hotel", icon: Database },
    { label: "Kamar disewa", text: "Detail kamar yang sedang terisi", icon: BedDouble },
    { label: "Kamar kosong", text: "Kamar yang siap disewakan", icon: BookOpenCheck },
    { label: "Tamu menginap", text: "Beserta tanggal masuk & keluar", icon: Users },
  ];
  const revenueSteps = [
    { icon: CalendarCheck, text: "Manajer memilih periode laporan" },
    { icon: ClipboardList, text: "Sistem merekap reservasi yang sudah selesai (check-out)" },
    { icon: CircleDollarSign, text: "Total pendapatan dihitung, laporan dapat dicetak" },
  ];
  return (
    <SlideShell>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 60%, transparent 100%)" }}
      />
      <div className="relative">
        <Kicker number="10">Sistem Report</Kicker>
        <Headline text="Laporan untuk manajer" className="mt-6 text-[84px]" />
      </div>
      <div className="relative mt-12 grid flex-1 grid-cols-2 items-start gap-8">
        <motion.div variants={slideFromLeft} className="glass flex flex-col rounded-md p-10">
          <div className="flex items-center gap-4">
            <IconBadge>
              <BellRing size={28} />
            </IconBadge>
            <div>
              <h3 className="text-[36px] font-semibold text-ink">Laporan Tingkat Hunian</h3>
              <p className="text-[19px] text-ink/60">Kondisi kamar & tamu saat ini</p>
            </div>
          </div>
          <motion.ul variants={stagger(0.08, 0.4)} className="mt-8 grid grid-cols-2 gap-4">
            {occupancy.map((o) => (
              <motion.li
                key={o.label}
                variants={fadeUp}
                className="flex flex-col gap-3 rounded-md border border-line bg-soft px-6 py-6"
              >
                <o.icon size={30} className="text-forest" />
                <span className="text-[25px] font-semibold text-ink">{o.label}</span>
                <span className="text-[20px] leading-snug text-ink/75">{o.text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div variants={slideFromRight} className="glass flex flex-col rounded-md p-10">
          <div className="flex items-center gap-4">
            <IconBadge>
              <FileText size={28} />
            </IconBadge>
            <div>
              <h3 className="text-[36px] font-semibold text-ink">Laporan Pendapatan</h3>
              <p className="text-[19px] text-ink/60">Rekap transaksi reservasi yang sudah check-out</p>
            </div>
          </div>
          <div className="mt-8 flex gap-2 rounded-full border border-forest/25 bg-paper/60 p-1.5" role="tablist" aria-label="Periode laporan">
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={period === p}
                onClick={(e) => {
                  setPeriod(p);
                  (e.currentTarget as HTMLButtonElement).blur();
                }}
                className="relative flex-1 rounded-full px-5 py-3 text-[21px] font-semibold"
              >
                {period === p && (
                  <motion.span
                    layoutId="period-pill"
                    className="absolute inset-0 rounded-full bg-forest"
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                  />
                )}
                <span className={`relative ${period === p ? "text-paper" : "text-ink/80"}`}>{p}</span>
              </button>
            ))}
          </div>
          <ol className="mt-7 flex flex-col gap-3">
            {revenueSteps.map((r, i) => (
              <motion.li
                key={r.text}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.12, ease: EASE_OUT }}
                className="flex items-center gap-5 rounded-md border border-line bg-soft px-6 py-4"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest font-mono text-[16px] font-bold text-paper">
                  {i + 1}
                </span>
                <r.icon size={26} className="shrink-0 text-forest" />
                <span className="text-[21px] leading-snug text-ink">
                  {i === 0 ? (
                    <>
                      Manajer memilih periode <b className="text-forest">{period.toLowerCase()}</b>
                    </>
                  ) : (
                    r.text
                  )}
                </span>
              </motion.li>
            ))}
          </ol>
        </motion.div>
      </div>
    </SlideShell>
  );
}

/* ──────────────────────────── 11 · PENUTUP ──────────────────────────── */

export function ClosingSlide() {
  const benefits = [
    { icon: SearchCheck, text: "Data hotel tersimpan rapi & mudah dicari" },
    { icon: Zap, text: "Pelayanan meja resepsionis lebih cepat" },
    { icon: ShieldCheck, text: "Risiko kamar terpesan ganda berkurang" },
    { icon: FileBarChart2, text: "Manajer mudah memantau kinerja hotel" },
  ];
  return (
    <SlideShell className="items-end">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-[1100px]"
        style={{ background: "linear-gradient(270deg, #FFFFFF 0%, #FFFFFF 50%, transparent 100%)" }}
      />
      <div className="relative w-[860px]">
        <Kicker number="11">Manfaat</Kicker>
        <Headline text="Hotel yang lebih tertata" accent={["tertata"]} className="mt-6 text-[90px]" />
        <motion.ul variants={stagger(0.1, 0.2)} className="mt-10 space-y-4">
          {benefits.map((b) => (
            <motion.li
              key={b.text}
              variants={fadeUp}
              whileHover={{ x: 8 }}
              className="glass flex items-center gap-5 rounded-md px-6 py-4"
            >
              <IconBadge className="h-12 w-12">
                <b.icon size={24} />
              </IconBadge>
              <span className="text-[25px] text-ink">{b.text}</span>
            </motion.li>
          ))}
        </motion.ul>
        <motion.div variants={fadeUp} className="mt-12 h-px w-full bg-ink" />
        <motion.div variants={fadeUp} className="mt-8 flex items-baseline justify-between">
          <span className="font-display text-[92px] font-bold uppercase leading-none text-forest">Terima kasih</span>
          <span className="text-[22px] text-ink/75">Kelompok 10 · Sesi tanya jawab</span>
        </motion.div>
      </div>
    </SlideShell>
  );
}

/* Re-export motion constant used by registry for convenience */
export const slideEase = EASE_OUT;
