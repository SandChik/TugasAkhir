import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import FlashBanner from "./FlashBanner";

/**
 * Kerangka halaman ber-sidebar sesuai mockup:
 * sidebar navy 240px + topbar 56px + area konten.
 */
export default async function AppShell({
  peran,
  nama,
  deskripsi,
  breadcrumb,
  title,
  subtitle,
  actions,
  children,
}: {
  peran: "dosen" | "asesor" | "admin";
  nama: string;
  deskripsi: string;
  breadcrumb: string[];
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  // Peran sidebar mengikuti sesi login, bukan halaman: asesor yang membuka
  // halaman /dosen/* (mengisi LKD-nya sendiri) tetap melihat menu asesor.
  const session = await getServerSession(authOptions);
  const peranSesi = (session?.user as any)?.peran as typeof peran | undefined;
  const peranAktif = peranSesi ?? peran;
  const deskripsiAktif =
    peranAktif === "asesor" && peran === "dosen"
      ? deskripsi.replace(/^Dosen\b/, "Asesor")
      : deskripsi;

  return (
    <div className="min-h-screen bg-white">
      <Sidebar peran={peranAktif} nama={nama} deskripsi={deskripsiAktif} />
      <div className="ml-60">
        <Topbar />
        <main className="px-6 py-5">
          <p className="text-[11px] text-crumb">{breadcrumb.join("  /  ")}</p>
          <div className="mt-4 flex items-start justify-between">
            <div>
              <h1 className="text-[19px] font-semibold text-navy">{title}</h1>
              {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
          <div className="mt-4">
            <Suspense fallback={null}>
              <FlashBanner />
            </Suspense>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
