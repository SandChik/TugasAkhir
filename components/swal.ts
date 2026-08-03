"use client";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/**
 * Satu tempat konfigurasi SweetAlert2 supaya notifikasi, konfirmasi, dan
 * warna tombolnya seragam dengan token desain aplikasi (tailwind.config.ts).
 */
const WARNA = {
  primary: "#2d6cdf",
  danger: "#dc4c4c",
  navy: "#14315e",
  muted: "#5b6b82",
  line: "#d7deea",
};

/** Notifikasi ringkas di pojok kanan atas (hasil aksi server). */
export const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timerProgressBar: true,
  width: "26rem",
  customClass: { popup: "text-[12px]" },
  didOpen: (el) => {
    el.addEventListener("mouseenter", Swal.stopTimer);
    el.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export const notifSukses = (pesan: string) =>
  toast.fire({ icon: "success", title: pesan, timer: 4000 });

/** Galat tidak hilang sendiri — pesan kesalahan harus sempat dibaca. */
export const notifGagal = (pesan: string) =>
  toast.fire({ icon: "error", title: pesan, showCloseButton: true, timer: undefined });

/** Dialog konfirmasi untuk aksi yang sulit dibatalkan. */
export function konfirmasiAksi(opts: {
  judul?: string;
  teks: string;
  tombol?: string;
  bahaya?: boolean;
}) {
  return Swal.fire({
    icon: "warning",
    title: opts.judul ?? "Lanjutkan?",
    text: opts.teks,
    showCancelButton: true,
    reverseButtons: true,
    focusCancel: true,
    confirmButtonText: opts.tombol ?? "Ya, lanjutkan",
    cancelButtonText: "Batal",
    confirmButtonColor: opts.bahaya ? WARNA.danger : WARNA.primary,
    cancelButtonColor: WARNA.muted,
    customClass: { title: "!text-[16px]", htmlContainer: "!text-[13px]" },
  });
}

export default Swal;
