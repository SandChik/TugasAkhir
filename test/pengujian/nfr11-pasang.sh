#!/bin/bash
# NFR-11 Installability: pasang ulang dari clone bersih mengikuti SETUP.md, di container Node 22 kosong.
# Penyimpangan yang disengaja (dicatat): database memakai bkd_nfr11 di container bkd-db, port web 3200.
set -x
PW=$(grep -oP 'POSTGRES_PASSWORD: \K\S+' /opt/ledgerdik/docker-compose.override.yml)
docker exec bkd-db psql -U postgres -qc "DROP DATABASE IF EXISTS bkd_nfr11 WITH (FORCE)" -c "CREATE DATABASE bkd_nfr11"
docker rm -f nfr11 >/dev/null 2>&1
docker run --rm --name nfr11 --network bkd_default -p 127.0.0.1:3200:3000 -v /opt/ledgerdik:/sumber:ro \
  -e DBURL="postgresql://postgres:$PW@db:5432/bkd_nfr11?schema=public" node:22-slim bash -c '
set -x
apt-get update -qq >/dev/null && apt-get install -y -qq git openssl curl >/dev/null
git config --global --add safe.directory "*"
git clone -q /sumber /app && cd /app || exit 1 && git log --oneline -1
mulai=$(date +%s)
echo "## 1. npm install"; npm install --no-audit --no-fund 2>&1 | tail -3
echo "## 2. .env dari .env.example"; cp .env.example .env
sed -i "s#^NEXTAUTH_SECRET=.*#NEXTAUTH_SECRET=$(openssl rand -base64 32)#" .env
sed -i "s#^DATABASE_URL=.*#DATABASE_URL=\"$DBURL\"#" .env
grep -E "^NEXT_PUBLIC_CHAIN_ID=" .env
echo "## 3. database"; npx prisma migrate dev 2>&1 | tail -4; npx prisma db seed 2>&1 | tail -2
echo "## 4. blockchain lokal"; (npx hardhat node > /tmp/node.log 2>&1 &) ; sleep 25
npm run deploy:local 2>&1 | tail -4 | tee /tmp/deploy.log
KAL=$(grep -oP "KalkulatorBKDPendidikan: \K0x\w+" /tmp/deploy.log); TOK=$(grep -oP "BKDSKSToken: \K0x\w+" /tmp/deploy.log)
sed -i "s#^NEXT_PUBLIC_BKD_CONTRACT_ADDRESS=.*#NEXT_PUBLIC_BKD_CONTRACT_ADDRESS=$KAL#; s#^NEXT_PUBLIC_SKS_TOKEN_ADDRESS=.*#NEXT_PUBLIC_SKS_TOKEN_ADDRESS=$TOK#" .env
sed -i "s#^ADMIN_PRIVATE_KEY=.*#ADMIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80#" .env
echo "## 6. npm run dev"; (npm run dev > /tmp/dev.log 2>&1 &)
for i in $(seq 1 90); do curl -sf -o /dev/null http://127.0.0.1:3000/login && break; sleep 5; done
echo "login: $(curl -s -o /dev/null -w %{http_code} http://127.0.0.1:3000/login)"
echo "api/rules: $(curl -s -o /dev/null -w %{http_code} http://127.0.0.1:3000/api/rules)"
CSRF=$(curl -s -c /tmp/c http://127.0.0.1:3000/api/auth/csrf | grep -oP "\"csrfToken\":\"\K[^\"]+")
curl -s -b /tmp/c -c /tmp/c -o /dev/null -X POST http://127.0.0.1:3000/api/auth/callback/credentials -d "csrfToken=$CSRF&email=admin@polban.ac.id&password=admin123&json=true"
echo "sesi admin: $(curl -s -b /tmp/c http://127.0.0.1:3000/api/auth/session)"
echo "halaman /admin/periode: $(curl -s -b /tmp/c -o /dev/null -w %{http_code} http://127.0.0.1:3000/admin/periode)"
echo "durasi_total_detik: $(( $(date +%s) - mulai ))"
grep -iE "error|warn" /tmp/dev.log | head -5
'
docker exec bkd-db psql -U postgres -qc "DROP DATABASE IF EXISTS bkd_nfr11 WITH (FORCE)"
