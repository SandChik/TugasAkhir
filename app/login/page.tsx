"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

/** Halaman login sesuai mockup Figma "Login - Sistem Penilaian BKD" (UID-01). */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email atau password salah, atau akun dinonaktifkan.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center bg-[#f5f7fb]">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-6 lg:grid-cols-2">
        {/* Hero kiri */}
        <div className="hidden flex-col justify-center lg:flex">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy text-lg font-bold text-white">
              L
            </div>
            <div>
              <p className="text-lg font-bold text-navy">LedgerDik</p>
              <p className="text-xs text-muted">
                Buku Besar Pendidikan &amp; Penilaian Dosen Berbasis Smart Contract
              </p>
            </div>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-navy">
            Selamat Datang di LedgerDik
          </h1>
          <h2 className="mt-6 text-lg font-semibold text-navy">
            Automasi Penilaian BKD, Tercatat di Blockchain
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Pantau dan validasi Beban Kinerja Dosen bidang pendidikan dalam satu platform
            yang transparan dan terotomatisasi. LedgerDik membantu dosen, asesor, dan admin
            mewujudkan proses penilaian dan pengesahan kredit SKS yang akurat, transparan,
            dan tercatat permanen dengan menggunakan smart contract di atas jaringan
            blockchain.
          </p>
          <div className="mt-6 flex gap-3">
            {["Transparan", "Terverifikasi On-chain", "Akurat"].map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-primary-soft px-4 py-2 text-xs font-medium text-primary"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Kartu login kanan */}
        <div className="flex items-center justify-center">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-md rounded-2xl bg-white p-10 shadow-[0_18px_40px_rgba(20,49,94,0.10)]"
          >
            <h3 className="text-lg font-semibold text-navy">Masuk ke Akun Anda</h3>
            <p className="mt-1 text-xs text-muted">
              Gunakan email dan password yang ditetapkan admin
            </p>

            <label className="mt-6 block text-xs font-medium text-cell">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@polban.ac.id"
              className="mt-1.5 w-full rounded-lg border border-line px-4 py-3 text-sm outline-none placeholder:text-crumb focus:border-primary"
            />

            <label className="mt-5 block text-xs font-medium text-cell">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="mt-1.5 w-full rounded-lg border border-line px-4 py-3 text-sm outline-none placeholder:text-crumb focus:border-primary"
            />

            <div className="mt-3 text-right">
              <a href="#" className="text-xs font-medium text-primary hover:underline">
                Lupa Password?
              </a>
            </div>

            {error && (
              <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-lg bg-primary py-3 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>

            <p className="mt-4 text-center text-[10px] text-crumb">
              Akun Dosen, Asesor, dan Admin dibuat oleh Administrator sistem.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
