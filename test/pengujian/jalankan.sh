#!/bin/bash
# Jalankan Playwright di container resmi, jaringan host (akses port 3100-3103, 5433, 18545).
# Pemakaian: bash jalankan.sh <label> [argumen playwright...]
LABEL=$1; shift
PW=$(grep -oP 'POSTGRES_PASSWORD: \K\S+' /opt/ledgerdik/docker-compose.override.yml)
cd ~/uji/pengujian
rm -rf hasil/artefak
docker run --rm --network host --ipc host -e PW_DB="$PW" \
  -v ~/uji/pengujian:/uji -v ~/uji/dokumen:/uji/dokumen:ro -w /uji \
  mcr.microsoft.com/playwright:v1.62.1-noble npx playwright test "$@" > hasil-$LABEL.log 2>&1
echo "exit=$?" >> hasil-$LABEL.log
mkdir -p ~/uji/arsip/$LABEL && cp -r hasil hasil-$LABEL.log ~/uji/arsip/$LABEL/ 2>/dev/null
tail -60 hasil-$LABEL.log
