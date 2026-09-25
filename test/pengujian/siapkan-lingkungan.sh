#!/bin/bash
# Menyiapkan lingkungan uji terpisah dari produksi:
#  - database bkd_test di container bkd-db (PostgreSQL 16)
#  - hardhat node lokal (chainId 31337) + deploy tiga kontrak
#  - tiga instance web uji dari image bkd-web: normal, RPC mati, parser mati
set -euo pipefail
PW=$(grep -oP 'POSTGRES_PASSWORD: \K\S+' /opt/ledgerdik/docker-compose.override.yml)
NET=bkd_default
MN="test test test test test test test test test test test junk"
PK0=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
DIR=~/uji/pengujian

echo "== reset database bkd_test"
docker exec bkd-db psql -U postgres -qc "DROP DATABASE IF EXISTS bkd_test WITH (FORCE)" -c "CREATE DATABASE bkd_test"
docker run --rm --network $NET -e DATABASE_URL="postgresql://postgres:$PW@db:5432/bkd_test?schema=public" -e WALLET_MNEMONIC="$MN" \
  -v /opt/ledgerdik/prisma:/src/prisma:ro bkd-web-builder sh -c 'rm -rf /app/prisma && cp -r /src/prisma /app/prisma && npx prisma migrate deploy 2>&1 | tail -3 && node prisma/seed.mjs 2>&1 | tail -8'

echo "== hardhat node"
docker rm -f bkd-uji-chain >/dev/null 2>&1 || true
docker run -d --name bkd-uji-chain --network $NET --network-alias chain -p 127.0.0.1:18545:8545 \
  -v /opt/ledgerdik/contracts:/src/contracts:ro -v /opt/ledgerdik/scripts:/src/scripts:ro -v /opt/ledgerdik/hardhat.config.js:/src/hardhat.config.js:ro \
  bkd-web-builder sh -c 'cp -r /src/contracts /src/scripts /src/hardhat.config.js /app/ && npx hardhat node --hostname 0.0.0.0 --port 8545' >/dev/null
for i in $(seq 1 60); do
  curl -s -X POST -H 'content-type: application/json' --data '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}' http://127.0.0.1:18545 | grep -q result && break; sleep 2
done
docker exec -e RPC_URL=http://127.0.0.1:8545 bkd-uji-chain npx hardhat run scripts/deploy.js --network localhost | tee $DIR/deploy-lokal.log
KAL=$(grep -oP 'KalkulatorBKDPendidikan: \K0x\w+' $DIR/deploy-lokal.log)
TOK=$(grep -oP 'BKDSKSToken: \K0x\w+' $DIR/deploy-lokal.log)
REG=$(grep -oP 'BKDDokumenRegistri: \K0x\w+' $DIR/deploy-lokal.log)

echo "== env web uji"
KEY_OVR='^(DATABASE_URL|NEXTAUTH_URL|PARSER_API_URL|RPC_URL|RPC_LOGS_URL|RPC_MAX_BLOCK_RANGE|NEXT_PUBLIC_CHAIN_ID|NEXT_PUBLIC_BKD_CONTRACT_ADDRESS|NEXT_PUBLIC_SKS_TOKEN_ADDRESS|NEXT_PUBLIC_SKS_TOKEN_DEPLOY_BLOCK|NEXT_PUBLIC_DOKUMEN_REGISTRI_ADDRESS|NEXT_PUBLIC_DOKUMEN_REGISTRI_DEPLOY_BLOCK|ADMIN_PRIVATE_KEY|WALLET_MNEMONIC)='
buat_env() { # $1 berkas, $2 port, $3 RPC_URL, $4 PARSER_API_URL
  { grep -vE "$KEY_OVR" /opt/ledgerdik/.env | grep -E '^[A-Z_]+='
    echo "DATABASE_URL=postgresql://postgres:$PW@db:5432/bkd_test?schema=public"
    echo "NEXTAUTH_URL=http://localhost:$2"
    echo "PARSER_API_URL=$4"
    echo "RPC_URL=$3"
    echo "RPC_LOGS_URL="
    echo "RPC_MAX_BLOCK_RANGE=0"
    echo "NEXT_PUBLIC_CHAIN_ID=31337"
    echo "NEXT_PUBLIC_BKD_CONTRACT_ADDRESS=$KAL"
    echo "NEXT_PUBLIC_SKS_TOKEN_ADDRESS=$TOK"
    echo "NEXT_PUBLIC_SKS_TOKEN_DEPLOY_BLOCK=0"
    echo "NEXT_PUBLIC_DOKUMEN_REGISTRI_ADDRESS=$REG"
    echo "NEXT_PUBLIC_DOKUMEN_REGISTRI_DEPLOY_BLOCK=0"
    echo "ADMIN_PRIVATE_KEY=$PK0"
    echo "WALLET_MNEMONIC=$MN"
  } > $1
}
buat_env $DIR/web-normal.env 3100 http://chain:8545 http://api:8000
buat_env $DIR/web-rpcmati.env 3101 http://127.0.0.1:1 http://api:8000
buat_env $DIR/web-parsermati.env 3102 http://chain:8545 http://127.0.0.1:1

echo "== web uji"
jalan_web() { # $1 nama, $2 port, $3 env
  docker rm -f $1 >/dev/null 2>&1 || true
  docker volume create $1-uploads >/dev/null
  docker run -d --name $1 --network $NET -p 127.0.0.1:$2:3000 --env-file $3 -v $1-uploads:/app/public/uploads --memory 450m bkd-web >/dev/null
}
jalan_web bkd-uji-web 3100 $DIR/web-normal.env
jalan_web bkd-uji-web-rpcmati 3101 $DIR/web-rpcmati.env
jalan_web bkd-uji-web-parsermati 3102 $DIR/web-parsermati.env
for p in 3100 3101 3102; do
  for i in $(seq 1 60); do curl -sf -o /dev/null http://127.0.0.1:$p/login && break; sleep 2; done
  echo "port $p: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:$p/login)"
done
echo "KAL=$KAL TOK=$TOK REG=$REG" > $DIR/alamat-lokal.txt
cat $DIR/alamat-lokal.txt

echo "== web uji baca Base Sepolia (IT-018, hanya baca event)"
{ grep -vE '^(DATABASE_URL|NEXTAUTH_URL|PARSER_API_URL)=' /opt/ledgerdik/.env | grep -E '^[A-Z_]+='
  echo "DATABASE_URL=postgresql://postgres:$PW@db:5432/bkd_test?schema=public"
  echo "NEXTAUTH_URL=http://localhost:3103"
  echo "PARSER_API_URL=http://api:8000"
} > $DIR/web-sepolia.env
jalan_web bkd-uji-web-sepolia 3103 $DIR/web-sepolia.env
for i in $(seq 1 60); do curl -sf -o /dev/null http://127.0.0.1:3103/login && break; sleep 2; done
echo "port 3103: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3103/login)"

echo "== web uji baca Base Sepolia lewat RPC publik, window 50.000 blok (IT-018)"
{ grep -vE '^(DATABASE_URL|NEXTAUTH_URL|PARSER_API_URL|RPC_LOGS_URL|RPC_MAX_BLOCK_RANGE)=' /opt/ledgerdik/.env | grep -E '^[A-Z_]+='
  echo "DATABASE_URL=postgresql://postgres:$PW@db:5432/bkd_test?schema=public"
  echo "NEXTAUTH_URL=http://localhost:3104"
  echo "PARSER_API_URL=http://api:8000"
  echo "RPC_LOGS_URL="
  echo "RPC_MAX_BLOCK_RANGE=50000"
} > $DIR/web-sepolia-publik.env
jalan_web bkd-uji-web-sepolia-publik 3104 $DIR/web-sepolia-publik.env
for i in $(seq 1 60); do curl -sf -o /dev/null http://127.0.0.1:3104/login && break; sleep 2; done
echo "port 3104: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3104/login)"
