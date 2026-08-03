# syntax=docker/dockerfile:1
FROM python:3.12-slim

# Tak menulis .pyc, log langsung ter-flush.
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Dependensi dulu supaya layer ini ter-cache selama requirements tak berubah.
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Hanya salin kode aplikasi. PDF, .env, hasil/, verify.py TIDAK ikut
# (lihat .dockerignore) supaya image kecil & tak membocorkan kunci/berkas uji.
COPY api.py \
     parse_st_pengajaran.py \
     parse_st_bimbingan.py \
     parse_st_pengujian.py \
     vlm_sk_pembinaan.py \
     parse_artefak_vlm.py \
     ./

# Jalankan sebagai non-root.
RUN useradd --create-home --uid 10001 appuser
USER appuser

EXPOSE 8000

# Konfigurasi (API_KEY, ROUTER_API_KEY, dst) diinjeksi lewat env saat runtime,
# mis. `docker run --env-file .env` atau `env_file:` di compose.
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
