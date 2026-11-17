// Exports all slides to public/<PDF_FILENAME> (one 16:9 page per slide).
//
// Usage: npm run export:pdf   (builds first, then runs this script)
//
// How it works: starts `next start` on a free port, opens the deck in the
// locally installed Chrome (or Edge) via playwright-core, captures each slide
// at 1920×1080 (×1.5 for sharp print), and prints those captures into a PDF.
// Captures include the three.js scenes exactly as they appear on screen.
// Set CHROME_PATH to use a specific browser executable.

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILENAME = "Presentasi-SIH-Kelompok-10.pdf"; // keep in sync with lib/pdf.ts
const OUT = path.join(root, "public", FILENAME);
const SLIDE_COUNT = 11;
const W = 1920;
const H = 1080;

const freePort = () =>
  new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
    srv.on("error", reject);
  });

async function waitForServer(url, ms = 60000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server did not start: ${url}`);
}

async function launchBrowser() {
  const args = ["--ignore-gpu-blocklist", "--enable-gpu"];
  const explicit = process.env.CHROME_PATH;
  if (explicit) return chromium.launch({ executablePath: explicit, args });
  const candidates = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  const found = candidates.find((p) => existsSync(p));
  if (found) return chromium.launch({ executablePath: found, args });
  for (const channel of ["chrome", "msedge"]) {
    try {
      return await chromium.launch({ channel, args });
    } catch {}
  }
  throw new Error("Chrome/Edge tidak ditemukan. Set CHROME_PATH ke file executable browser.");
}

const port = await freePort();
const base = `http://localhost:${port}`;
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const server = spawn(process.execPath, [nextBin, "start", "-p", String(port)], { cwd: root, stdio: "ignore" });

let browser;
try {
  await waitForServer(base);
  browser = await launchBrowser();
  const page = await browser.newPage({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1.5,
    // Reduced motion: camera snaps, no moving packets — deterministic frames.
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto(`${base}/#1`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "[data-export-hide]{display:none!important}" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3000); // three.js chunk + first scene

  const shots = [];
  for (let i = 1; i <= SLIDE_COUNT; i++) {
    if (i > 1) {
      await page.evaluate((n) => (location.hash = `#${n}`), i);
      await page.waitForTimeout(1800);
    }
    const buf = await page.screenshot({ type: "jpeg", quality: 90 });
    shots.push(buf.toString("base64"));
    process.stdout.write(`  slide ${i}/${SLIDE_COUNT}\n`);
  }
  if (errors.length) throw new Error("Page errors:\n" + errors.join("\n"));

  const html = `<!doctype html><html><head><style>
    @page { size: ${W}px ${H}px; margin: 0 }
    html, body { margin: 0; padding: 0 }
    img { display: block; width: ${W}px; height: ${H}px; page-break-after: always; break-after: page }
    img:last-child { page-break-after: auto; break-after: auto }
  </style></head><body>${shots.map((b) => `<img src="data:image/jpeg;base64,${b}">`).join("")}</body></html>`;

  const printPage = await browser.newPage();
  await printPage.setContent(html, { waitUntil: "load" });
  const pdf = await printPage.pdf({ width: `${W}px`, height: `${H}px`, printBackground: true, pageRanges: `1-${SLIDE_COUNT}` });
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, pdf);
  console.log(`PDF tersimpan: ${path.relative(root, OUT)} (${(pdf.length / 1048576).toFixed(1)} MB, ${SLIDE_COUNT} halaman)`);
} finally {
  await browser?.close();
  server.kill();
}
