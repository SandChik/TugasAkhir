#!/bin/bash
# Jalankan npx hardhat test dengan pseudo-TTY supaya node:test memakai reporter spec (tampilan terminal).
set -e
OUT=~/uji/gambar; mkdir -p $OUT
docker volume create hh-cache-uji >/dev/null
# pemanasan: unduh solc ke cache supaya baris "Downloading solc" tidak ikut ke tangkapan
docker run --rm -v hh-cache-uji:/root/.cache/hardhat-nodejs -v ~/uji/repo:/src bkd-web-builder \
  sh -c 'rm -rf /app/test && cp -r /src/contracts /src/test /src/hardhat.config.js /app/ && npx hardhat compile >/dev/null 2>&1' || true
docker run --rm -t --hostname ledgerdik-uji -e COLUMNS=140 -e LINES=100 \
  -v hh-cache-uji:/root/.cache/hardhat-nodejs -v ~/uji/repo:/src bkd-web-builder \
  sh -c 'rm -rf /app/test && cp -r /src/contracts /src/test /src/hardhat.config.js /app/ && npx hardhat test' > $OUT/unit-tty.ansi 2>&1 || echo "exit=$?"
date -Is > $OUT/waktu.txt
echo "baris: $(wc -l < $OUT/unit-tty.ansi), kolom terpanjang: $(sed 's/\x1b\[[0-9;]*[A-Za-z]//g' $OUT/unit-tty.ansi | tr -d '\r' | awk '{ if (length($0)>m) m=length($0) } END {print m}')"
sed 's/\x1b\[[0-9;]*[A-Za-z]//g' $OUT/unit-tty.ansi | tr -d '\r' > $OUT/unit-tty.txt
cat $OUT/unit-tty.txt
