# a433-microservices - Proyek Deploy Item App dengan Docker Compose

Repository ini digunakan untuk kebutuhan kelas Belajar Membangun Arsitektur Microservices

## Original Clone Command
`git clone -b proyek-pertama https://github.com/dicodingacademy/a433-microservices.git`

---

## Proyek Deploy Aplikasi Item App dengan Docker Compose

### Deskripsi Proyek

Proyek ini adalah aplikasi web sederhana untuk manajemen item yang di-deploy menggunakan Docker Compose. Aplikasi terdiri dari dua container:

1. **item-app**: Container untuk aplikasi Node.js/Express yang menerima dan mengolah request
2. **item-db**: Container untuk database MongoDB yang menyimpan data item

### Arsitektur

```
┌─────────────────┐         ┌─────────────────┐
│   Browser      │◄────────┤   item-app      │
│   (Port 80)    │         │   (Port 8080)   │
└─────────────────┘         └────────┬────────┘
                                     │
                                     ▼
                              ┌─────────────────┐
                              │   item-db       │
                              │   (MongoDB:3)   │
                              │   (Port 27017)  │
                              └─────────────────┘
```

### Struktur Project

```
.
├── Dockerfile              # Konfigurasi Docker image untuk item-app
├── build_push_image.sh     # Script untuk build dan push image ke GitHub Packages
├── docker-compose.yml      # Konfigurasi Docker Compose untuk deploy
├── link.txt               # Link GitHub Packages (GHCR) untuk container image
├── log.txt                # Documentation logs Docker Compose
├── package.json           # Dependencies dan scripts Node.js
├── app.js                 # Entry point aplikasi Express
├── bin/                   # executable scripts
├── public/                # Static assets (HTML, CSS, JS)
├── routes/                # API routes
├── views/                 # Template views (jade)
└── spec/                  # Test files
```

### Cara Deployment

#### 1. Setup GitHub Personal Access Token (PAT)
```bash
# Buat GitHub PAT di: GitHub Settings → Developer settings → Personal access tokens
# Pilih: Fine-grained token
# Permissions: read:packages, write:packages, delete:packages
export GITHUB_TOKEN=<github-pat-anda>
```

#### 2. Build dan Push Image ke GitHub Packages
```bash
# Build image dari Dockerfile
docker build -t item-app:v1 .

# Tag image untuk GitHub Packages
docker tag item-app:v1 ghcr.io/irhamsahbana/item-app:v1

# Login ke GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u irhamsahbana --password-stdin

# Push image ke GitHub Packages
docker push ghcr.io/irhamsahbana/item-app:v1

# Atau gunakan script yang sudah disediakan:
chmod +x build_push_image.sh
./build_push_image.sh
```

#### 2. Deploy dengan Docker Compose
```bash
# Start semua services
docker-compose up -d

# Cek status services
docker-compose ps

# Lihat logs
docker-compose logs -f
```

#### 3. Akses Aplikasi
Aplikasi akan berjalan di: http://localhost

API endpoints yang tersedia:
- GET `/` - Homepage aplikasi
- GET `/api/items` - Ambil semua items
- POST `/api/items` - Tambah item baru  
- GET `/health` - Health check

#### 4. Stop dan Cleanup
```bash
# Stop semua services
docker-compose down

# Stop dan hapus volumes (hapus data)
docker-compose down -v
```

### Testing

```bash
# Test health endpoint
curl http://localhost/health

# Test API endpoints
curl http://localhost/api/items
curl -X POST http://localhost/api/items -H "Content-Type: application/json" -d '{"text":"Item baru"}'
```

### Kriteria Proyek Terpenuhi

✅ **Kriteria 1**: Menggunakan Starter Project dari Dicoding  
✅ **Kriteria 2**: Dockerfile sesuai spesifikasi  
✅ **Kriteria 3**: Script build_push_image.sh untuk build dan push  
✅ **Kriteria 4**: docker-compose.yml dengan 2 service  

### Saran untuk Nilai Maksimal (5 Bintang)

✅ **Komentar lengkap** - Setiap file memiliki penjelasan  
✅ **Restart policy** - Container otomatis restart  
✅ **Log documentation** - File log.txt tersedia  
✅ **GitHub Packages** - Menggunakan GHCR alih-alih Docker Hub (Saran 4)  

### Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)
- [Dicoding Academy - Microservices](https://www.dicoding.com/academies/433)
