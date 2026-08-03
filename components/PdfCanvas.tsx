"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Render PDF ke <canvas> lewat pdf.js.
 *
 * <iframe>/<embed> tidak dipakai karena Chrome/Edge punya setelan "selalu unduh
 * berkas PDF" yang mematikan viewer bawaan — akibatnya membuka halaman malah
 * memicu unduhan. Menggambar sendiri membuat dokumen selalu tampil di halaman,
 * apa pun setelan browser pengguna.
 */
export default function PdfCanvas({ url }: { url: string }) {
  const wadah = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"muat" | "siap" | "galat">("muat");
  const [pesan, setPesan] = useState("");
  const [halaman, setHalaman] = useState(0);

  useEffect(() => {
    let batal = false;
    const kotak = wadah.current;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        // Worker disalin ke public/ oleh script postinstall.
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        // Berkas diambil sendiri lalu byte-nya disuapkan ke pdf.js. Berkas lokal
        // lewat /api/berkas supaya tidak terlihat sebagai PDF di jaringan —
        // download manager (IDM) menyambar permintaan PDF dan mengosongkannya.
        // ponytail: seluruh berkas masuk memori — cukup untuk SK/ST; pakai range
        // request lagi kalau nanti ada dokumen puluhan MB.
        const res = await fetch(
          url.startsWith("/uploads/") ? `/api/berkas?f=${encodeURIComponent(url)}` : url
        );
        if (!res.ok) throw new Error(`server menjawab ${res.status}`);
        const data = new Uint8Array(await res.arrayBuffer());
        if (batal) return;

        const doc = await pdfjs.getDocument({ data }).promise;
        if (batal) return;
        setHalaman(doc.numPages);

        const lebar = kotak?.clientWidth || 800;
        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          if (batal) return;
          const skala = lebar / page.getViewport({ scale: 1 }).width;
          const viewport = page.getViewport({ scale: skala });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "mb-2 w-full rounded border border-line bg-white";
          kotak?.appendChild(canvas);
          await page.render({ canvas, viewport }).promise;
          if (n === 1 && !batal) setStatus("siap");
        }
      } catch (e: any) {
        if (!batal) {
          setStatus("galat");
          setPesan(String(e?.message ?? e));
        }
      }
    })();

    return () => {
      batal = true;
      if (kotak) kotak.innerHTML = "";
    };
  }, [url]);

  return (
    <div>
      {status === "muat" && <p className="text-[11px] text-muted">Memuat dokumen…</p>}
      {status === "galat" && (
        <p className="text-[11px] text-danger">
          Dokumen tidak dapat ditampilkan ({pesan}).{" "}
          <a href={url} target="_blank" className="underline">
            Unduh berkasnya
          </a>
          .
        </p>
      )}
      {status === "siap" && halaman > 1 && (
        <p className="mb-2 text-[10.5px] text-muted">{halaman} halaman</p>
      )}
      <div ref={wadah} />
    </div>
  );
}
