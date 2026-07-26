# Image dasar Node.js versi 18, varian alpine biar ukurannya kecil
FROM node:18-alpine

# Direktori kerja di dalam container tempat semua file app diletakkan
WORKDIR /app

# Copy package.json dan package-lock.json duluan (sebelum source code lain)
# supaya layer "npm ci" bisa di-cache Docker selama dependency-nya gak berubah
COPY package*.json ./

# Install dependency persis sesuai package-lock.json, dan skip devDependencies
# (nodemon) karena di production gak perlu auto-restart
RUN npm ci --omit=dev

# Copy sisa source code (index.js, dst) ke dalam container
COPY . .

# Dokumentasi bahwa container ini listen di port 3000 (sesuai .env PORT)
EXPOSE 3000

# Perintah yang dijalankan saat container start
CMD ["node", "index.js"]
