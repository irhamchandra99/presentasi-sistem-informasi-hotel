# Presentasi Sistem Informasi Hotel — Kelompok 10

Website presentasi interaktif (11 slide) dibangun dengan Next.js 15 (App Router), React 19, TypeScript,
Tailwind CSS 4, Three.js via React Three Fiber + Drei, Motion for React, dan Lucide React.

Tema visual: **Modern Retro Technical Editorial** — palet tunggal di `lib/theme.ts` (dicerminkan di `app/globals.css`):
`#FFFFFF` putih, `#191919` ink black, `#244D3B` forest green, `#87977A` olive green, `#F3F4F2` soft gray, `#DADDD8` light gray.
Font: Barlow Condensed (heading), IBM Plex Sans (body), IBM Plex Mono (label teknis).
Tailwind default palette dimatikan (`--color-*: initial`), sehingga hanya token di atas yang bisa dipakai.

## Menjalankan

```bash
npm install
npm run build
npm run start        # buka http://localhost:3000
```

Mode pengembangan: `npm run dev`. Pemeriksaan tipe: `npm run typecheck`.

Untuk presentasi, gunakan `build` + `start` (lebih ringan daripada `dev`), lalu tekan **F** untuk fullscreen.
Slide bisa dibuka langsung lewat URL, misalnya `http://localhost:3000/#6` untuk DFD Level 1.

## Download PDF

Tombol **Download** di kontrol kanan bawah (atau tekan **D**) mengunduh `Presentasi-SIH-Kelompok-10.pdf`
(11 halaman 16:9, termasuk tampilan 3D). File disimpan di `public/` dan dilayani lewat `/download/pdf`.

Setelah mengubah isi slide, buat ulang PDF-nya:

```bash
npm run export:pdf   # build + render tiap slide lewat Chrome/Edge lokal -> public/Presentasi-SIH-Kelompok-10.pdf
```

Butuh Google Chrome atau Microsoft Edge terpasang (atau set `CHROME_PATH`).
Isi PDF berupa gambar per slide, jadi teksnya tidak bisa diseleksi.

## Kontrol

| Tombol | Fungsi |
| --- | --- |
| → / PgDn / Space | slide berikutnya |
| ← / PgUp | slide sebelumnya |
| Home / End | slide pertama / terakhir |
| O | overview semua slide (Esc menutup) |
| F | fullscreen |
| D | download PDF |
| ? | daftar pintasan |
| 1–2 | DFD Level 0: sorot entitas |
| 1–5 | DFD Level 1: sorot proses |
| 1–3 | ERD: sorot relasi 1:N |
| + / − / 0 | zoom diagram / reset |
| Shift + panah | geser diagram |
| M | focus mode diagram |
| Esc | lepas sorotan (jika tidak ada sorotan: buka overview) |

Angka hanya ditangani oleh diagram pada slide aktif, sehingga tidak pernah memindahkan slide.

## Struktur

```
app/                      layout (font), halaman, global CSS (token warna)
components/presentation/  Presentation (state, keyboard, hash URL), Chrome (progress, kontrol, overview, bantuan), skala stage 16:9
components/slides/        isi 11 slide + registry (urutan, judul, mode scene 3D)
components/three/         canvas WebGL tunggal (lazy, ssr:false), model hotel prosedural, dekorasi, fallback statis
components/diagrams/      DFD Level 0, DFD Level 1, ERD dalam SVG + viewport zoom/pan + panel penjelasan
lib/                      variant animasi, konteks deck (key handler per slide), deteksi WebGL
```

## Catatan performa

- Satu canvas WebGL dipakai bersama; kamera terbang antar-komposisi dengan easing.
- Slide diagram/tabel tidak memakai 3D: canvas di-fade lalu render loop dihentikan (`frameloop="never"`).
- Render loop juga berhenti saat overview terbuka atau tab tidak terlihat.
- `dpr` dibatasi `[1, 1.5]`; jendela memakai satu `InstancedMesh`, partikel satu draw call.
- `prefers-reduced-motion`: animasi kamera, partikel, dan indikator data bergerak dimatikan.
- Tanpa WebGL: latar statis (gradien + siluet SVG) otomatis dipakai.

## Penyesuaian terhadap gambar referensi

- DFD Level 0: arah aliran Manajer dibalik agar seimbang dengan DFD Level 1
  (Manajer → sistem: *permintaan laporan & periode*; sistem → Manajer: *laporan hunian, pendapatan, riwayat tamu*).
- DFD Level 1 proses 3.0: arah dua aliran Resepsionis dibalik
  (Resepsionis → 3.0: *data check-in, check-out & pembayaran*; 3.0 → Resepsionis: *konfirmasi proses & pembayaran*).
- Typo dirapikan: "priode" → "periode", "pendapattan" → "pendapatan", "tanggal_reservsi" → "tanggal_reservasi".
- Housekeeping tidak digambarkan sebagai entitas eksternal; pembaruan status kamar setelah dibersihkan dilakukan resepsionis.
