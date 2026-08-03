#!/usr/bin/env python3
"""
api.py — REST API untuk parser dokumen BE Automation (POLBAN JTK).

Membungkus kelima parser CLI menjadi satu layanan HTTP:

  POST /parse/pengajaran   Surat Penugasan Pengajaran   (pdfplumber, offline)
  POST /parse/bimbingan    ST Pembimbing PKL / SK Pembimbing TA (pdfplumber)
  POST /parse/pengujian    ST Penguji Tugas Akhir       (pdfplumber, offline)
  POST /parse/sk-pembinaan SK Pembina Ormawa            (VLM 9router)
  POST /parse/artefak      Artefak dokumen umum         (VLM 9router)
  GET  /health             Cek kesehatan layanan

Semua endpoint mengembalikan JSON. Endpoint /parse/* diproteksi API key klien
lewat header `X-API-Key` (dicek terhadap env `API_KEY`). Endpoint VLM memakai
kunci model 9router dari env `ROUTER_API_KEY` (server-side, tak pernah dikirim
ke klien).

Menjalankan:
    pip install -r requirements.txt
    uvicorn api:app --reload --port 8000

Dokumentasi interaktif: http://localhost:8000/docs  (dan /redoc)
"""

from __future__ import annotations

import os
import secrets
import shutil
import tempfile
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, HTTPException, Security, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader

import parse_st_pengajaran as pengajaran
import parse_st_bimbingan as bimbingan
import parse_st_pengujian as pengujian
import vlm_sk_pembinaan as sk_pembinaan
import parse_artefak_vlm as artefak

# ---------------------------------------------------------------------------
# Konfigurasi (dari .env)
# ---------------------------------------------------------------------------

load_dotenv()

API_KEY = os.getenv("API_KEY", "").strip()                 # kunci auth KLIEN
ROUTER_API_KEY = (os.getenv("ROUTER_API_KEY")              # kunci model 9router
                  or os.getenv("API_KEY_9ROUTER", "")).strip()
BASE_URL = os.getenv("BASE_URL", "https://9router.tmfadhli.my.id/v1").strip()
MODEL_DEFAULT = os.getenv("MODEL", "ag/gemini-3.5-flash-low").strip()
ALLOWED_ORIGINS = [o.strip() for o in os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:3000").split(",") if o.strip()]


# ---------------------------------------------------------------------------
# Aplikasi + CORS
# ---------------------------------------------------------------------------

app = FastAPI(
    title="BE Automation — API Parser Dokumen POLBAN JTK",
    version="1.0.0",
    description=(
        "API untuk mengekstrak PDF surat/SK POLBAN JTK menjadi JSON per-dosen "
        "(dashboard BKD). Tiga endpoint offline berbasis pdfplumber, dua "
        "endpoint berbasis VLM (9router).\n\n"
        "**Autentikasi:** semua endpoint `/parse/*` butuh header `X-API-Key`. "
        "Klik **Authorize** di kanan atas dan masukkan kunci Anda.\n\n"
        "**Catatan:** endpoint VLM (`/parse/sk-pembinaan`, `/parse/artefak`) "
        "berjalan sinkron dan bisa memakan waktu hingga beberapa menit karena "
        "memanggil model beberapa kali."
    ),
    contact={"name": "BE Automation"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    # "*" tidak boleh digabung dengan kredensial; matikan bila origin wildcard.
    allow_credentials="*" not in ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Autentikasi klien (X-API-Key)
# ---------------------------------------------------------------------------

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def verify_api_key(key: Optional[str] = Security(_api_key_header)) -> str:
    """Verifikasi header X-API-Key terhadap env API_KEY (fail-closed)."""
    if not API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Server belum dikonfigurasi: env API_KEY kosong.",
        )
    if not key or not secrets.compare_digest(key, API_KEY):
        raise HTTPException(
            status_code=401,
            detail="API key tidak valid atau tidak disertakan (header X-API-Key).",
        )
    return key


# ---------------------------------------------------------------------------
# Utilitas
# ---------------------------------------------------------------------------


async def simpan_upload(file: UploadFile) -> Path:
    """Validasi upload PDF, tulis ke berkas sementara, kembalikan path-nya."""
    nama = file.filename or "upload.pdf"
    is_pdf = nama.lower().endswith(".pdf") or file.content_type == "application/pdf"
    if not is_pdf:
        raise HTTPException(400, "Berkas harus PDF (.pdf).")
    data = await file.read()
    if not data:
        raise HTTPException(400, "Berkas kosong.")
    fd, tmp = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    Path(tmp).write_bytes(data)
    return Path(tmp)


def _bersihkan(*paths: Path) -> None:
    """Hapus berkas/direktori sementara secara best-effort.

    Beberapa parser (mis. parse_st_pengajaran.parse_pdf) membiarkan handle
    `open(path, "rb")` terbuka sampai GC; di Windows unlink bisa gagal dengan
    PermissionError. Kegagalan cleanup diabaikan supaya tidak menutupi hasil.
    """
    for p in paths:
        try:
            if p.is_dir():
                shutil.rmtree(p, ignore_errors=True)
            else:
                p.unlink(missing_ok=True)
        except OSError:
            pass


async def _guard(coro, *, runtime_status: int = 422):
    """Jalankan coroutine parser, terjemahkan galat jadi HTTP yang wajar.

    - ValueError  -> 400 (mis. halaman di luar rentang)
    - RuntimeError-> `runtime_status` (422 layout berubah / 502 galat VLM)
    - lainnya     -> 500
    Pesan galat tak pernah memuat API key (parser tak menaruh key di pesan).
    """
    try:
        return await coro
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(400, str(e))
    except RuntimeError as e:
        raise HTTPException(runtime_status, str(e))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(500, f"Galat internal: {type(e).__name__}: {e}")


def _kwargs_vlm(**opsional) -> dict:
    """Buang nilai None supaya default fungsi ekstrak() yang dipakai."""
    return {k: v for k, v in opsional.items() if v is not None}


# ---------------------------------------------------------------------------
# Endpoint: offline (pdfplumber)
# ---------------------------------------------------------------------------


@app.post(
    "/parse/pengajaran",
    tags=["Offline (pdfplumber)"],
    summary="Parse Surat Penugasan Pengajaran",
    description=(
        "Ekstrak beban SKS mengajar (TE/PR) per dosen per kelas dari Surat "
        "Penugasan Pengajaran. Respons JSON: `surat`, `ringkasan`, `penugasan`, "
        "`mata_kuliah`, `beban_dosen`, `temuan`, dan `ditolak` (bila ada)."
    ),
    dependencies=[Depends(verify_api_key)],
)
async def parse_pengajaran(
    file: UploadFile = File(..., description="PDF Surat Penugasan Pengajaran"),
    drop_invalid: bool = False,
):
    path = await simpan_upload(file)

    def _kerja():
        out, _bad = pengajaran.parse_pdf(str(path), drop_invalid)
        out["surat"]["sumber_file"] = file.filename
        return out

    try:
        return await _guard(run_in_threadpool(_kerja), runtime_status=422)
    finally:
        _bersihkan(path)


@app.post(
    "/parse/bimbingan",
    tags=["Offline (pdfplumber)"],
    summary="Parse ST Pembimbing PKL / SK Pembimbing Tugas Akhir",
    description=(
        "Ekstrak surat pembimbing, dikelompokkan per dosen. Menerima **dua** "
        "jenis surat dan mengenalinya sendiri dari isi halaman 1:\n\n"
        "- Surat Tugas Pembimbing Praktik Kerja Lapangan (PKL)\n"
        "- SK Pembimbing Tugas Akhir (D3 maupun Sarjana Terapan)\n\n"
        "Respons JSON: `surat` (memuat `jenis_bimbingan`: `pkl`/`ta`), "
        "`ringkasan`, `beban_dosen`, `mahasiswa`, dan `ditolak` (bila ada). "
        "Pada jenis `ta` tiap penugasan membawa `peran` (Pembimbing 1/2) dan "
        "`kelompok`."
    ),
    dependencies=[Depends(verify_api_key)],
)
async def parse_bimbingan(
    file: UploadFile = File(..., description="PDF ST Pembimbing PKL atau SK Pembimbing TA"),
):
    path = await simpan_upload(file)

    def _kerja():
        data, _bad = bimbingan.bangun_hasil(str(path), nama_asli=file.filename)
        return data

    try:
        return await _guard(run_in_threadpool(_kerja), runtime_status=422)
    finally:
        _bersihkan(path)


@app.post(
    "/parse/pengujian",
    tags=["Offline (pdfplumber)"],
    summary="Parse ST Penguji Tugas Akhir",
    description=(
        "Ekstrak Surat Tugas Penguji Tugas Akhir, dikelompokkan per dosen "
        "penguji. Respons JSON: `surat`, `ringkasan`, `beban_dosen`, `sidang`, "
        "dan `ditolak` (bila ada)."
    ),
    dependencies=[Depends(verify_api_key)],
)
async def parse_pengujian(
    file: UploadFile = File(..., description="PDF ST Penguji Tugas Akhir"),
):
    path = await simpan_upload(file)

    def _kerja():
        data, _bad = pengujian.bangun_hasil(str(path), nama_asli=file.filename)
        return data

    try:
        return await _guard(run_in_threadpool(_kerja), runtime_status=422)
    finally:
        _bersihkan(path)


# ---------------------------------------------------------------------------
# Endpoint: VLM (9router)
# ---------------------------------------------------------------------------


@app.post(
    "/parse/sk-pembinaan",
    tags=["VLM (9router)"],
    summary="Parse SK Pembina Organisasi Kemahasiswaan",
    description=(
        "Ekstrak SK Pembina Ormawa (dokumen pindai) memakai VLM. Memproses "
        "dua lampiran, memvalidasi NIP/honorarium, merekonsiliasi antar "
        "lampiran, lalu memfilter dosen JTK. Respons JSON: `gabungan`, "
        "`temuan`, `pembina_jtk`, `ringkasan`.\n\n"
        "Butuh `ROUTER_API_KEY` terpasang di server (503 bila kosong). "
        "Proses sinkron; bisa memakan beberapa menit."
    ),
    dependencies=[Depends(verify_api_key)],
)
async def parse_sk_pembinaan(
    file: UploadFile = File(..., description="PDF SK Pembina Ormawa"),
    model: Optional[str] = Form(None, description="Override model VLM"),
    dpi: Optional[int] = Form(None, description="Resolusi rasterisasi (default 200)"),
    jpeg: bool = Form(False, description="Kirim JPEG (payload lebih kecil)"),
    nomor_sk: Optional[str] = Form(None),
    tanggal_sk: Optional[str] = Form(None, description="Format YYYY-MM-DD"),
    halaman_l1: Optional[int] = Form(None, description="Halaman lampiran 1 (default 4)"),
    halaman_l2: Optional[int] = Form(None, description="Halaman lampiran 2 (default 5)"),
):
    if not ROUTER_API_KEY:
        raise HTTPException(503, "ROUTER_API_KEY belum diset; endpoint VLM nonaktif.")
    path = await simpan_upload(file)
    out_dir = Path(tempfile.mkdtemp(prefix="sk_pembinaan_"))
    kwargs = _kwargs_vlm(
        model=model or MODEL_DEFAULT, dpi=dpi, jpeg=jpeg, nomor_sk=nomor_sk,
        tanggal_sk=tanggal_sk, halaman_l1=halaman_l1, halaman_l2=halaman_l2,
    )
    try:
        return await _guard(
            run_in_threadpool(
                sk_pembinaan.ekstrak, path, out_dir,
                base_url=BASE_URL, api_key=ROUTER_API_KEY, **kwargs,
            ),
            runtime_status=502,
        )
    finally:
        _bersihkan(path, out_dir)


@app.post(
    "/parse/artefak",
    tags=["VLM (9router)"],
    summary="Parse artefak dokumen umum",
    description=(
        "Ekstrak artefak dokumen dosen (formulir, surat tugas, SK, berita "
        "acara, lembar persetujuan) memakai VLM dengan skema umum. Respons "
        "JSON: `dokumen`, `temuan`, `per_dosen`, `ringkasan`.\n\n"
        "Butuh `ROUTER_API_KEY` terpasang di server (503 bila kosong). "
        "Proses sinkron; bisa memakan beberapa menit."
    ),
    dependencies=[Depends(verify_api_key)],
)
async def parse_artefak(
    file: UploadFile = File(..., description="PDF artefak dokumen"),
    model: Optional[str] = Form(None, description="Override model VLM"),
    dpi: Optional[int] = Form(None, description="Resolusi rasterisasi (default 150)"),
    jpeg: bool = Form(False, description="Kirim JPEG (payload lebih kecil)"),
    halaman: str = Form("all", description="'all' atau daftar seperti '1,2'"),
    gaya_gambar: str = Form(
        "openai_objek",
        description="Format blok gambar: openai_objek | openai_teks | anthropic | anthropic_messages",
    ),
):
    if not ROUTER_API_KEY:
        raise HTTPException(503, "ROUTER_API_KEY belum diset; endpoint VLM nonaktif.")
    path = await simpan_upload(file)
    out_dir = Path(tempfile.mkdtemp(prefix="artefak_"))
    kwargs = _kwargs_vlm(model=model or MODEL_DEFAULT, dpi=dpi, jpeg=jpeg,
                         halaman=halaman, gaya_gambar=gaya_gambar)
    try:
        return await _guard(
            run_in_threadpool(
                artefak.ekstrak, path, out_dir,
                base_url=BASE_URL, api_key=ROUTER_API_KEY, **kwargs,
            ),
            runtime_status=502,
        )
    finally:
        _bersihkan(path, out_dir)


# ---------------------------------------------------------------------------
# Umum
# ---------------------------------------------------------------------------


@app.get("/health", tags=["Umum"], summary="Cek kesehatan layanan")
async def health():
    """Status layanan. Tidak membutuhkan autentikasi dan tidak membocorkan key."""
    return {
        "status": "ok",
        "auth_dikonfigurasi": bool(API_KEY),
        "vlm_aktif": bool(ROUTER_API_KEY),
        "cors_origins": ALLOWED_ORIGINS,
    }
