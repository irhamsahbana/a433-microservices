# ===== Stage 1: builder =====
# Stage terpisah cuma buat install dependency; hasil akhirnya (node_modules)
# nanti di-copy ke stage runtime, jadi build cache/tools di stage ini gak
# ikut kebawa ke image final.
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json dan package-lock.json duluan (sebelum source code lain)
# supaya layer "npm ci" bisa di-cache Docker selama dependency-nya gak berubah
COPY package*.json ./

# Install dependency persis sesuai package-lock.json, dan skip devDependencies
# (nodemon) karena di production gak perlu auto-restart
RUN npm ci --omit=dev

# ===== Stage 2: runtime =====
# Mulai dari base image yang bersih lagi, jadi image final cuma berisi
# node_modules hasil install + source code, gak ada sisa apa pun dari stage builder
FROM node:18-alpine AS runtime

WORKDIR /app

# Ambil node_modules yang udah di-install dari stage builder
COPY --from=builder /app/node_modules ./node_modules

# Copy source code (index.js, dst) ke dalam image final
COPY . .

# Dokumentasi bahwa container ini listen di port 3000 (sesuai .env PORT)
EXPOSE 3000

# Perintah yang dijalankan saat container start
CMD ["node", "index.js"]
