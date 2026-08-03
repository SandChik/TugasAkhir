import { educationRules } from "./bkdRules";

export const dashboardStats = {
  totalSubmissions: 12,
  submitted: 4,
  approved: 6,
  tokenizedSks: 18.5,
};

export const sampleSubmissions = [
  { id: "SUB-001", lecturer: "Dr. Contoh Dosen", activity: "Melaksanakan perkuliahan", status: "APPROVED", sks: 3, tx: "0x..." },
  { id: "SUB-002", lecturer: "Dr. Contoh Dosen", activity: "Pembimbing utama skripsi", status: "SUBMITTED", sks: 1, tx: "-" },
];

export { educationRules };
