#!/bin/bash
# NFR-04 Confidentiality. Hanya mencetak jumlah, tidak pernah nilai rahasia.
set -u
echo "# NFR-04 $(date -Is) host $(hostname)"
echo "## 1. Kolom password_hash (read-only)"
for DB in bkd_smart_contract bkd_test; do
  docker exec -i bkd-db psql -U postgres -d "$DB" -At -F ' | ' <<SQL
select '$DB' as db,
  count(*) || ' akun',
  count(password_hash) || ' berisi hash',
  count(*) filter (where password_hash ~ '^[\$]2[aby][\$][0-9]{2}[\$][./A-Za-z0-9]{53}$') || ' berformat bcrypt',
  count(*) filter (where password_hash in ('admin123','dosen123','asesor123','dosenuji123','asesoruji123')) || ' berisi sandi polos yang dikenal'
from pengguna;
SQL
done
echo "## 2. Rahasia pada keluaran build image bkd-web"
PK=$(grep -oP '^ADMIN_PRIVATE_KEY=\K.*' /opt/ledgerdik/.env | tr -d '"' | sed 's/^0x//')
MN=$(grep -oP '^WALLET_MNEMONIC=\K.*' /opt/ledgerdik/.env | tr -d '"')
BS=$(grep -oP '^BASESCAN_API_KEY=\K.*' /opt/ledgerdik/.env | tr -d '"')
NS=$(grep -oP '^NEXTAUTH_SECRET=\K.*' /opt/ledgerdik/.env | tr -d '"')
PA=$(grep -oP '^PARSER_API_KEY=\K.*' /opt/ledgerdik/.env | tr -d '"')
TMP=$(mktemp -d); docker create --name nfr04-cek bkd-web >/dev/null; docker cp nfr04-cek:/app "$TMP/app" >/dev/null; docker rm nfr04-cek >/dev/null
echo "- berkas diperiksa: $(find "$TMP/app" -type f | wc -l) (seluruh /app image), static klien: $(find "$TMP/app/.next/static" -type f | wc -l)"
for pasang in "ADMIN_PRIVATE_KEY:$PK" "WALLET_MNEMONIC:$MN" "BASESCAN_API_KEY:$BS" "NEXTAUTH_SECRET:$NS" "PARSER_API_KEY:$PA"; do
  nama=${pasang%%:*}; nilai=${pasang#*:}
  if [ -z "$nilai" ]; then echo "- $nama: kosong di .env, dilewati"; continue; fi
  n=$(grep -rlF -i -- "$nilai" "$TMP/app" 2>/dev/null | wc -l)
  echo "- $nama: ditemukan di $n berkas"
done
echo "- file .env di image: $(find "$TMP/app" -maxdepth 2 -name '.env*' | wc -l)"
rm -rf "$TMP"
