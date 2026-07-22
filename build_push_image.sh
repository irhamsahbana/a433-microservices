#!/bin/bash

# Kriteria 3: Script untuk Build dan Push Docker Image
# Saran 4: Menggunakan GitHub Packages (GitHub Container Registry) bukan Docker Hub
# Script ini berisi perintah untuk membuat Docker image dan mengunggahnya ke GHCR

echo "=== Building Docker Image ==="
# Perintah untuk membuat Docker image dari Dockerfile dengan nama item-app dan tag v1
docker build -t item-app:v1 .

echo ""
echo "=== Listing Local Images ==="
# Melihat daftar image di lokal
docker images

echo ""
echo "=== Tagging Image for GitHub Packages (GHCR) ==="
# Mengubah nama image agar sesuai dengan format GitHub Packages (ghcr.io/username/repository:tag)
# Ganti 'irhamsahbana' dengan username GitHub Anda
docker tag item-app:v1 ghcr.io/irhamsahbana/item-app:v1

echo ""
echo "=== Login to GitHub Packages (GHCR) ==="
# Login ke GitHub Packages menggunakan GitHub Personal Access Token (PAT)
# Rekomendasi: Gunakan PAT karena lebih aman
# Cara membuat PAT: GitHub Settings → Developer settings → Personal access tokens → Fine-grained token
# - Pastikan token memiliki permissions: read:packages, write:packages
echo "Masukkan GitHub PAT Anda:"
echo $GITHUB_TOKEN | docker login ghcr.io -u irhamsahbana --password-stdin

echo ""
echo "=== Pushing Image to GitHub Packages ==="
# Mengunggah image ke GitHub Packages (GHCR)
docker push ghcr.io/irhamsahbana/item-app:v1

echo ""
echo "=== Build and Push Complete ==="
echo "Image berhasil di-push ke: ghcr.io/irhamsahbana/item-app:v1"
echo ""
echo "Pull command:"
echo "  docker pull ghcr.io/irhamsahbana/item-app:v1"
