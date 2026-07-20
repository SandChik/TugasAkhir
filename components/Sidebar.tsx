"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Peran = "dosen" | "asesor" | "admin";

type MenuItem = { label: string; href: string };
type MenuSection = { title?: string; items: MenuItem[] };

const MENUS: Record<Peran, MenuSection[]> = {
  dosen: [
    { items: [{ label: "Profil", href: "/dosen/profil" }] },
    {
      title: "Pelaksanaan pendidikan",
      items: [
        { label: "Pengajaran", href: "/dosen/pengajaran" },
        { label: "Bimbingan mahasiswa", href: "/dosen/bimbingan-mahasiswa" },
        { label: "Pengujian mahasiswa", href: "/dosen/pengujian-mahasiswa" },
        { label: "Bahan ajar", href: "/dosen/bahan-ajar" },
        { label: "Pembinaan mahasiswa", href: "/dosen/pembinaan-mahasiswa" },
        { label: "Visiting scientist", href: "/dosen/visiting-scientist" },
        { label: "Detasering", href: "/dosen/detasering" },
        { label: "Orasi ilmiah", href: "/dosen/orasi-ilmiah" },
        { label: "Pembimbing dosen", href: "/dosen/pembimbing-dosen" },
        { label: "Tugas tambahan", href: "/dosen/tugas-tambahan" },
      ],
    },
    {
      title: "Layanan BKD",
      items: [{ label: "Rekap kegiatan", href: "/dosen/rekap-kegiatan" }],
    },
  ],
  asesor: [
    { items: [{ label: "Profil", href: "/asesor/profil" }] },
    {
      title: "Layanan BKD",
      items: [
        { label: "Rekap kegiatan", href: "/asesor/rekap-kegiatan" },
        { label: "Asesor BKD", href: "/asesor/asesor-bkd" },
      ],
    },
  ],
  admin: [
    { items: [{ label: "Profil", href: "/admin/profil" }] },
    {
      title: "Administrasi",
      items: [
        { label: "Manajemen Pengguna", href: "/admin/pengguna" },
        { label: "Konfigurasi Wallet", href: "/admin/wallet" },
        { label: "Periode BKD", href: "/admin/periode" },
        { label: "Referensi Kegiatan", href: "/admin/referensi" },
        { label: "Sinkronisasi PDDikti", href: "/admin/sinkron" },
      ],
    },
    {
      title: "Blockchain",
      items: [
        { label: "Operasi Token", href: "/admin/token" },
        { label: "Log Blockchain", href: "/admin/log-blockchain" },
      ],
    },
    {
      title: "Laporan",
      items: [{ label: "Rekapitulasi", href: "/admin/rekapitulasi" }],
    },
  ],
};

function Logo() {
  return (
    <div className="flex items-center gap-2 px-5 py-4">
      <div className="flex h-7 w-7 items-center justify-center rounded-md border border-white/40 text-sm font-bold text-white">
        L
      </div>
      <span className="text-sm font-semibold text-white">LedgerDik</span>
    </div>
  );
}

export default function Sidebar({
  peran,
  nama,
  deskripsi,
}: {
  peran: Peran;
  nama: string;
  deskripsi: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 w-60 overflow-y-auto bg-navy">
      <Logo />
      <div className="border-y border-navy-border px-5 py-3">
        <p className="text-xs font-medium text-white">{nama}</p>
        <p className="mt-0.5 text-[10px] text-side-sub">{deskripsi}</p>
      </div>
      <nav className="px-5 py-3">
        {MENUS[peran].map((section, si) => (
          <div key={si}>
            {section.title && (
              <p className="mb-1 mt-4 text-xs font-semibold text-white">{section.title}</p>
            )}
            <ul>
              {section.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-md px-3 py-2 text-[11.5px] ${
                        active
                          ? "bg-primary text-white"
                          : "text-side-muted hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
