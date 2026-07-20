import type { Config } from "tailwindcss";

/**
 * Token desain diekstrak langsung dari mockup Figma LedgerDik
 * agar tampilan web identik dengan desain.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#14315e", // sidebar, heading
        "navy-border": "#2c4670", // garis pemisah di sidebar
        primary: "#2d6cdf", // aksi utama, nav aktif, link
        "primary-soft": "#eaf1fc", // latar tombol aksi sekunder
        line: "#d7deea", // border tabel/kartu/input
        "line-grid": "#d0d7e3", // garis kolom tabel
        "head-bg": "#eef1f5", // latar header tabel
        "head-tx": "#4a5a6f", // teks header tabel
        cell: "#33465c", // teks sel tabel
        muted: "#5b6b82", // teks sekunder
        crumb: "#98a3b8", // breadcrumb / placeholder
        "side-muted": "#a9b7ce", // menu sidebar nonaktif
        "side-sub": "#8fa0bd", // subjudul di sidebar
        success: "#4bb58a", // chip hijau
        "success-deep": "#3a9d6b", // tombol hijau
        "success-tx": "#2f9e5f",
        danger: "#dc4c4c",
        "danger-soft": "#fdeff0",
        warning: "#e0a53a",
        "warning-deep": "#e8862f",
        info: "#3a90d0",
        "info-bg": "#eaf3fb",
        "info-tx": "#3a5a86",
        zebra: "#fafbfc",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
