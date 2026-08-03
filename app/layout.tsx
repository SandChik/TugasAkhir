import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LedgerDik - Sistem Penilaian BKD",
  description:
    "Sistem Penilaian Beban Kinerja Dosen bidang pendidikan berbasis smart contract",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
