# BE Automation — Parser Dokumen POLBAN JTK

Mengubah PDF surat/SK POLBAN JTK menjadi JSON per-dosen untuk dashboard BKD.
Tersedia sebagai **REST API** (`api.py`, FastAPI) maupun **CLI** (skrip parser langsung).

`verify.py` adalah skrip uji parser Pengajaran (golden + mutation test), **bukan**
bagian dari API.

---

## Daftar parser

| Endpoint API | Skrip CLI | Dokumen | Mesin |
|---|---|---|---|
| `POST /parse/pengajaran` | `parse_st_pengajaran.py` | Surat Penugasan Pengajaran (beban SKS TE/PR) | pdfplumber (offline) |
| `POST /parse/bimbingan` | `parse_st_bimbingan.py` | ST Pembimbing PKL **atau** SK Pembimbing Tugas Akhir (dideteksi otomatis) | pdfplumber (offline) |
| `POST /parse/pengujian` | `parse_st_pengujian.py` | ST Penguji Tugas Akhir | pdfplumber (offline) |
| `POST /parse/sk-pembinaan` | `vlm_sk_pembinaan.py` | SK Pembina Ormawa (dokumen pindai) | VLM 9router |
| `POST /parse/artefak` | `parse_artefak_vlm.py` | Artefak umum (formulir/surat/berita acara) | VLM 9router |

Parser **offline** tidak butuh jaringan. Parser **VLM** memanggil model di endpoint
9router dan butuh `ROUTER_API_KEY`.

---

## Instalasi

```bash
pip install -r requirements.txt
```

## Konfigurasi (`.env`)

Salin `.env.example` menjadi `.env` lalu isi:

```dotenv
# Kunci auth KLIEN — wajib dikirim di header X-API-Key
API_KEY=be_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Kunci model 9router (upstream VLM) — server-side, tak pernah dikirim ke klien
ROUTER_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx

# Origin frontend yang diizinkan (CORS), dipisah koma
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Opsional
BASE_URL=https://9router.tmfadhli.my.id/v1
MODEL=ag/gemini-3.7-flash-medium
```

Generate kunci klien acak:

```bash
python -c "import secrets; print('be_'+secrets.token_urlsafe(32))"
```

Ada **dua kunci berbeda**:
- **`API_KEY`** — melindungi API ini. Klien mengirimnya lewat header `X-API-Key`.
- **`ROUTER_API_KEY`** — kunci model 9router untuk endpoint VLM. Tetap di server.

---

## Menjalankan API

```bash
uvicorn api:app --reload --port 8000
```

- Dokumentasi interaktif (Swagger UI): <http://localhost:8000/docs> — klik **Authorize**, masukkan `X-API-Key`.
- Dokumentasi alternatif (ReDoc): <http://localhost:8000/redoc>

### Autentikasi

Semua endpoint `/parse/*` butuh header:

```
X-API-Key: <nilai API_KEY dari .env>
```

Tanpa header atau salah → `401`. Endpoint `GET /health` tidak butuh auth.

---

## Menjalankan dengan Docker

Butuh `.env` yang sudah terisi (lihat [Konfigurasi](#konfigurasi-env)).

### docker compose (disarankan)

```bash
docker compose up --build -d      # build + jalan di latar belakang
docker compose logs -f            # lihat log
docker compose down               # hentikan
```

API tersedia di <http://localhost:8000/docs>. Compose memuat `.env` lewat
`env_file` dan sudah menyertakan healthcheck ke `/health`.

### docker langsung (tanpa compose)

```bash
docker build -t be-automation-api .
docker run --rm -p 8000:8000 --env-file .env be-automation-api
```

Catatan:
- `.env` **tidak** ikut ke dalam image (di-ignore lewat `.dockerignore`); kunci
  diinjeksi saat runtime lewat `--env-file` / `env_file`.
- PDF contoh, `hasil/`, dan `verify.py` juga tidak ikut ke image (image kecil,
  tak membocorkan berkas uji). Kirim PDF lewat request upload seperti biasa.
- Container jalan sebagai user non-root.
- Ganti origin di `ALLOWED_ORIGINS` sesuai domain frontend produksi Anda.

---

## Contoh pemakaian

Set kunci sekali (contoh bash):

```bash
KEY=be_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Cek kesehatan

```bash
curl http://localhost:8000/health
# {"status":"ok","auth_dikonfigurasi":true,"vlm_aktif":true,"cors_origins":[...]}
```

### Pengajaran (offline)

```bash
curl -H "X-API-Key: $KEY" \
     -F "file=@st_pengajaran.pdf" \
     http://localhost:8000/parse/pengajaran
```

Ringkasan respons:

```json
{
  "surat": { "sumber_file": "st_pengajaran.pdf", "sha256": "…", "nomor": "…" },
  "ringkasan": { "terekstrak": 110, "valid": 110, "ditolak": 0,
                 "jumlah_mk": 26, "jumlah_dosen": 33,
                 "slot_team_teaching": 8, "temuan": 0 },
  "penugasan": [ … ], "mata_kuliah": [ … ], "beban_dosen": [ … ], "temuan": [ … ]
}
```

Opsi query `drop_invalid=true` untuk membuang baris gagal (tidak disarankan):

```bash
curl -H "X-API-Key: $KEY" -F "file=@st_pengajaran.pdf" \
     "http://localhost:8000/parse/pengajaran?drop_invalid=true"
```

### Bimbingan / PKL (offline)

```bash
curl -H "X-API-Key: $KEY" -F "file=@st_bimbingan.pdf" \
     http://localhost:8000/parse/bimbingan
# ringkasan: {"mahasiswa":58,"valid":58,"ditolak":0,"jumlah_dosen":24}
```

### Pengujian (offline)

```bash
curl -H "X-API-Key: $KEY" -F "file=@st_pengujian.pdf" \
     http://localhost:8000/parse/pengujian
# ringkasan: {"grup_sidang":31,"valid":31,"ditolak":0,"total_mahasiswa":59,"jumlah_dosen":27}
```

### SK Pembina Ormawa (VLM)

```bash
curl -H "X-API-Key: $KEY" \
     -F "file=@sk_pembinaan.pdf" \
     -F "dpi=200" \
     http://localhost:8000/parse/sk-pembinaan
```

Field form opsional: `model`, `dpi`, `jpeg`, `nomor_sk`, `tanggal_sk`,
`halaman_l1`, `halaman_l2`. Respons: `gabungan`, `temuan`, `pembina_jtk`, `ringkasan`.

### Artefak umum (VLM)

```bash
curl -H "X-API-Key: $KEY" \
     -F "file=@fta9_2.pdf" \
     -F "halaman=1,2" \
     http://localhost:8000/parse/artefak
```

Field form opsional: `model`, `dpi`, `jpeg`, `halaman` (`all` atau `1,2`),
`gaya_gambar`. Respons: `dokumen`, `temuan`, `per_dosen`, `ringkasan`.

> **Catatan endpoint VLM:** berjalan **sinkron** dan bisa memakan beberapa menit
> (memanggil model beberapa kali). Bila `ROUTER_API_KEY` kosong → `503`.

---

## Kode status HTTP

| Kode | Arti |
|---|---|
| `200` | Sukses, body JSON hasil parse |
| `400` | Berkas bukan PDF / kosong, atau parameter salah (mis. halaman di luar rentang) |
| `401` | `X-API-Key` tidak ada / salah |
| `422` | Layout PDF berubah / 0 baris terekstrak (parser menolak diam-diam) |
| `502` | Galat memanggil model 9router (endpoint VLM) |
| `503` | Server belum dikonfigurasi (`API_KEY` atau `ROUTER_API_KEY` kosong) |
| `500` | Galat internal tak terduga |

---

## Pemakaian CLI (tanpa API)

Setiap parser tetap bisa dijalankan langsung:

```bash
# Pengajaran
python parse_st_pengajaran.py st_pengajaran.pdf -o hasil.json

# Bimbingan / PKL
python parse_st_bimbingan.py st_bimbingan.pdf -o hasil_bimbing.json
python parse_st_bimbingan.py st_bimbingan_TA_D3.pdf -o hasil_bimbing_ta.json  # SK Pembimbing TA

# Pengujian
python parse_st_pengujian.py st_pengujian.pdf -o hasil_uji.json

# SK Pembina Ormawa (VLM) — butuh ROUTER_API_KEY di environment
export ROUTER_API_KEY=sk-...
python vlm_sk_pembinaan.py sk_pembinaan.pdf -o hasil/

# Artefak umum (VLM)
python parse_artefak_vlm.py fta9_2.pdf -o hasil/ --halaman 1,2

# Uji parser Pengajaran (golden + mutation)
python verify.py st_pengajaran.pdf
```

---

## Struktur proyek

```
api.py                    aplikasi FastAPI (CORS + X-API-Key + 5 endpoint)
parse_st_pengajaran.py    parser Pengajaran   (fungsi library: parse_pdf)
parse_st_bimbingan.py     parser PKL + TA     (fungsi library: bangun_hasil)
parse_st_pengujian.py     parser Pengujian    (fungsi library: bangun_hasil)
vlm_sk_pembinaan.py       parser SK Ormawa    (fungsi library: ekstrak)
parse_artefak_vlm.py      parser artefak umum (fungsi library: ekstrak)
verify.py                 uji parser Pengajaran (bukan bagian API)
requirements.txt          dependensi
.env / .env.example       konfigurasi
Dockerfile                image API (python:3.12-slim, non-root)
docker-compose.yml        orkestrasi + healthcheck
.dockerignore             berkas yang tak ikut ke image (kunci, PDF, verify.py)
```

Tiap parser mengekspos satu fungsi library yang mengembalikan `dict`; `api.py`
memanggilnya di threadpool dan meng-serialize hasilnya ke JSON. Logika
parsing/validasi tidak diubah — hanya dibungkus.

Jalankan dengan: 
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
buka http://localhost:8000/docs.