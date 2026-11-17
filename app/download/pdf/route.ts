import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDF_FILENAME } from "@/lib/pdf";

// Read at request time so a PDF regenerated after `next build` is served without rebuilding.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const file = await readFile(path.join(process.cwd(), "public", PDF_FILENAME));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${PDF_FILENAME}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("PDF belum dibuat. Jalankan: npm run export:pdf", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
