// Uji akurasi Tabel IV.85: memanggil kontrak kalkulator yang ter-deploy di Base Sepolia lewat eth_call.
import { ethers } from "ethers";

const rpc = process.env.RPC_URL;
const alamat = process.env.NEXT_PUBLIC_BKD_CONTRACT_ADDRESS;
const abi = [
  "function hitungPendidikanFormalDoktor(uint256) pure returns (uint256)",
  "function hitungPengajaran(uint256,uint256,uint256,bool,bool,uint256) pure returns (uint256)",
  "function hitungBimbinganSeminarMahasiswa(uint256) pure returns (uint256)",
  "function hitungBimbinganKKNPKLMagang(uint256) pure returns (uint256)",
  "function hitungPembimbinganTugasAkhir(uint8,uint8,uint256) pure returns (uint256)",
  "function hitungPengujiUjianAkhir(uint8,uint256) pure returns (uint256)",
  "function hitungPembinaKegiatanMahasiswa(uint256) pure returns (uint256)",
  "function hitungJabatanPimpinanPerguruanTinggi(uint8,uint256) pure returns (uint256)",
  "function jumlahkanSKS(uint256[]) pure returns (uint256)",
];

// [no, butir, parameter, rujukan x100 dari rubrik, fungsi, argumen]
const kasus = [
  [1, "Pendidikan formal doktor", "1 semester", 1200, "hitungPendidikanFormalDoktor", [1]],
  [2, "Pelaksanaan perkuliahan", "3 SKS, 16/16, dosen tunggal", 300, "hitungPengajaran", [3, 16, 16, true, false, 0]],
  [3, "Pelaksanaan perkuliahan", "3 SKS, 12/16, dosen tunggal", 225, "hitungPengajaran", [3, 16, 12, true, false, 0]],
  [4, "Pelaksanaan perkuliahan", "3 SKS, penuh, porsi 50", 150, "hitungPengajaran", [3, 16, 16, true, true, 50]],
  [5, "Pelaksanaan perkuliahan", "2 SKS, 8/16", 100, "hitungPengajaran", [2, 16, 8, true, false, 0]],
  [6, "Pelaksanaan perkuliahan", "2 SKS, 7/16", 0, "hitungPengajaran", [2, 16, 7, true, false, 0]],
  [7, "Membimbing seminar mahasiswa", "1 semester", 100, "hitungBimbinganSeminarMahasiswa", [1]],
  [8, "Membimbing KKN, PKL, magang", "1 semester", 200, "hitungBimbinganKKNPKLMagang", [1]],
  [9, "Membimbing tugas akhir", "Utama, disertasi, 2 mhs", 266, "hitungPembimbinganTugasAkhir", [0, 0, 2]],
  [10, "Membimbing tugas akhir", "Pendamping, tesis, 2 mhs", 150, "hitungPembimbinganTugasAkhir", [1, 1, 2]],
  [11, "Membimbing tugas akhir", "Utama, skripsi, 4 mhs", 200, "hitungPembimbinganTugasAkhir", [0, 2, 4]],
  [12, "Membimbing tugas akhir", "Pendamping, laporan akhir studi, 4 mhs", 100, "hitungPembimbinganTugasAkhir", [1, 3, 4]],
  [13, "Penguji ujian akhir", "Ketua, 4 mhs", 200, "hitungPengujiUjianAkhir", [0, 4]],
  [14, "Penguji ujian akhir", "Anggota, 4 mhs", 100, "hitungPengujiUjianAkhir", [1, 4]],
  [15, "Membina kegiatan mahasiswa", "1 semester", 200, "hitungPembinaKegiatanMahasiswa", [1]],
  [16, "Jabatan pimpinan PT", "Rektor, 1 semester", 600, "hitungJabatanPimpinanPerguruanTinggi", [0, 1]],
  [17, "Jabatan pimpinan PT", "Ketua jurusan, 1 semester", 300, "hitungJabatanPimpinanPerguruanTinggi", [4, 1]],
  [18, "Rekapitulasi total", "300, 150, 200", 650, "jumlahkanSKS", [[300, 150, 200]]],
];

const provider = new ethers.JsonRpcProvider(rpc);
const net = await provider.getNetwork();
const blok = await provider.getBlockNumber();
const kode = await provider.getCode(alamat);
const k = new ethers.Contract(alamat, abi, provider);

console.log(`# Waktu: ${new Date().toISOString()}`);
console.log(`# Jaringan chainId ${net.chainId}, blok ${blok}, kontrak ${alamat} (bytecode ${(kode.length - 2) / 2} byte)`);
console.log("| No. | Butir | Parameter | Rujukan x100 | Keluaran kontrak | Kesesuaian |");
console.log("|:-:|---|---|:-:|:-:|:-:|");
const hasil = [];
for (const [no, butir, param, rujukan, fn, args] of kasus) {
  let keluaran, sesuai;
  try {
    keluaran = await k[fn](...args, { blockTag: blok });
    sesuai = keluaran === BigInt(rujukan);
  } catch (e) {
    keluaran = `galat: ${e.shortMessage || e.message}`;
    sesuai = false;
  }
  hasil.push({ no, butir, param, rujukan, keluaran: String(keluaran), sesuai });
  console.log(`| ${no}. | ${butir} | ${param} | ${rujukan} | ${keluaran} | ${sesuai ? "Sesuai" : "TIDAK SESUAI"} |`);
}
const lulus = hasil.filter((h) => h.sesuai).length;
console.log(`# Rekap: ${lulus} sesuai, ${hasil.length - lulus} tidak sesuai, dari ${hasil.length} kasus`);
process.exitCode = lulus === hasil.length ? 0 : 1;
