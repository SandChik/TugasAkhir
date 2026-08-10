"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";

/**
 * R7: simulasi sinkronisasi Feeder PDDikti.
 * Membuat kegiatan sumber_data='pddikti' (diklaim=false) untuk setiap dosen
 * pada periode aktif. Idempoten (dicocokkan judul). Bukan teks dummy —
 * merepresentasikan data feeder yang menunggu diklaim dosen.
 */
export async function sinkronPddikti() {
  const periode = await prisma.periode_bkd.findFirst({ where: { status: "aktif" } });
  if (!periode) redirect(`/admin/sinkron?err=${encodeURIComponent("Belum ada periode aktif")}`);

  const dosenList = await prisma.pengguna.findMany({ where: { peran: "dosen", aktif: true } });
  const refP = await prisma.referensi_kegiatan.findUnique({ where: { kode_rule: "EDU101" } });
  const refBimb = await prisma.referensi_kegiatan.findUnique({ where: { kode_rule: "EDU203" } });
  const refUji = await prisma.referensi_kegiatan.findUnique({ where: { kode_rule: "EDU301" } });

  const template = [
    { ref: refP, judul: "Basis Data / 2CTI3",
      detail: { kelas: "2CTI3", jenis_mata_kuliah: "Wajib", bidang_keilmuan: "Rekayasa Perangkat Lunak", jumlah_mahasiswa: 28 },
      parameter: { sksMataKuliah: 3, jumlahPertemuanRencana: 16, jumlahPertemuanRealisasi: 16, semesterPenuh: true, teamTeaching: false, persenPorsiDosen: 100 }, sks: 300 },
    { ref: refP, judul: "Pemrograman Web / 1ATI2",
      detail: { kelas: "1ATI2", jenis_mata_kuliah: "Wajib", bidang_keilmuan: "Rekayasa Perangkat Lunak", jumlah_mahasiswa: 30 },
      parameter: { sksMataKuliah: 3, jumlahPertemuanRencana: 16, jumlahPertemuanRealisasi: 16, semesterPenuh: true, teamTeaching: false, persenPorsiDosen: 100 }, sks: 300 },
    { ref: refBimb, judul: "Bimbingan TA - Andi Pratama",
      detail: { bidang_keilmuan: "Sistem Informasi" },
      parameter: { peran: "PembimbingUtama", jenisTugasAkhir: "TugasAkhir", jumlahMahasiswa: 1 }, sks: 50 },
    { ref: refUji, judul: "Penguji Sidang TA (4 mahasiswa)",
      detail: { bidang_keilmuan: "Sistem Informasi", jenis_pengujian: "Sidang Tugas Akhir" },
      parameter: { peranPenguji: "Ketua", jumlahMahasiswa: 4 }, sks: 200 },
  ];

  let dibuat = 0;
  for (const dosen of dosenList) {
    let lkd = await prisma.lkd.findFirst({
      where: { id_pengguna: dosen.id_pengguna, id_periode: periode!.id_periode, jenis: "laporan" },
    });
    if (!lkd) {
      lkd = await prisma.lkd.create({
        data: { id_pengguna: dosen.id_pengguna, id_periode: periode!.id_periode, jenis: "laporan" },
      });
    }
    for (const t of template) {
      if (!t.ref) continue;
      const exists = await prisma.kegiatan.findFirst({ where: { id_lkd: lkd.id_lkd, judul: t.judul } });
      if (exists) continue;
      await prisma.kegiatan.create({
        data: {
          id_lkd: lkd.id_lkd,
          id_referensi: t.ref.id_referensi,
          judul: t.judul,
          detail_kegiatan: t.detail,
          parameter: t.parameter,
          sks_dihitung_x100: t.sks,
          status_perhitungan: "berhasil",
          status: "diajukan",
          sumber_data: "pddikti",
          diklaim: false,
        } as any,
      });
      dibuat++;
    }
  }
  redirect(`/admin/sinkron?ok=${encodeURIComponent(`Sinkronisasi selesai. ${dibuat} kegiatan baru dari PDDikti.`)}`);
}
