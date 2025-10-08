#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

# 1. Pastikan Prisma Client digenerate (Membaca DATABASE_URL)
npx prisma generate

# 2. Jalankan build Next.js standar
npm run build 