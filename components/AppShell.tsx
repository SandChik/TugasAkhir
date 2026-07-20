import { Suspense } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import FlashBanner from "./FlashBanner";

/**
 * Kerangka halaman ber-sidebar sesuai mockup:
 * sidebar navy 240px + topbar 56px + area konten.
 */
export default function AppShell({
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
  return (
    <div className="min-h-screen bg-white">
      <Sidebar peran={peran} nama={nama} deskripsi={deskripsi} />
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
