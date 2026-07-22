# Menggunakan base image Node.js versi 14 sesuai kriteria
FROM node:14

# Menentukan working directory untuk container adalah /app
WORKDIR /app

# Menyalin seluruh source code ke working directory di container
COPY . /app

# Menentukan environment variables untuk production mode dan database host
ENV NODE_ENV=production
ENV DB_HOST=item-db

# Menginstal dependencies untuk production dan kemudian build aplikasi
RUN npm install --production --unsafe-perm && npm run build

# Ekspos port yang digunakan oleh aplikasi adalah 8080
EXPOSE 8080

# Saat container diluncurkan, jalankan server dengan perintah npm start
CMD ["npm", "start"]
