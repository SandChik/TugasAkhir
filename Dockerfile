# syntax=docker/dockerfile:1

# ---------- Stage builder: install dependency, generate Prisma client, build Next.js ----------
FROM node:22-slim AS builder

WORKDIR /app

# openssl dibutuhkan engine Prisma pada image Debian slim.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Dependency dulu supaya layer ter-cache selama package-lock tak berubah.
# mkdir public: script postinstall menyalin pdf.worker.min.mjs ke public/.
COPY package.json package-lock.json ./
RUN mkdir -p public && npm ci

# Generate Prisma client sebelum build (dipakai server component & server action).
COPY prisma ./prisma
RUN npx prisma generate

COPY . .

# Jalankan ulang penyalinan pdf.worker: public/ dari build context tidak membawanya.
RUN npm run postinstall

RUN npm run build:web

# ---------- Stage runner: image produksi dari output standalone ----------
FROM node:22-slim AS runner

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/* \
  && useradd --create-home --uid 10001 appuser

COPY --from=builder --chown=appuser:appuser /app/.next/standalone ./
COPY --from=builder --chown=appuser:appuser /app/.next/static ./.next/static
COPY --from=builder --chown=appuser:appuser /app/public ./public
# Jaga-jaga bila file tracing standalone tidak membawa engine Prisma.
COPY --from=builder --chown=appuser:appuser /app/node_modules/.prisma ./node_modules/.prisma

# Direktori unggahan dibuat di image supaya named volume mewarisi ownership appuser.
RUN mkdir -p public/uploads && chown appuser:appuser public/uploads

USER appuser

EXPOSE 3000

# DATABASE_URL, NEXTAUTH_SECRET, RPC_URL, dst diinjeksi lewat env saat runtime
# (env_file & environment di docker-compose.yml).
CMD ["node", "server.js"]
