import { readFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { authOptions } from "../../../lib/auth";

/**
 * Sajikan berkas unggahan sebagai byte mentah untuk viewer PDF di halaman.
 *
 * `Content-Type` sengaja BUKAN `application/pdf` dan URL-nya tanpa akhiran
 * `.pdf`: download manager (IDM dkk.) membajak setiap permintaan yang terlihat
 * seperti berkas PDF — permintaan viewer ikut disambar sehingga isinya kosong
 * dan browser malah memunculkan dialog unduhan.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Tidak berwenang", { status: 401 });

  const f = req.nextUrl.searchParams.get("f") ?? "";
  // Hanya berkas di public/uploads, tanpa penelusuran direktori.
  if (!/^\/uploads\/[A-Za-z0-9._/-]+$/.test(f) || f.includes(".."))
    return new Response("Berkas tidak valid", { status: 400 });

  try {
    const data = await readFile(path.join(process.cwd(), "public", f.slice(1)));
    return new Response(new Uint8Array(data), {
      headers: {
        "content-type": "application/x-pdf-embed",
        "cache-control": "private, max-age=300",
      },
    });
  } catch {
    return new Response("Berkas tidak ditemukan", { status: 404 });
  }
}
