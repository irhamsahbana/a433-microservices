#!/bin/bash
# Build image Docker karsajobs-ui (frontend) dan push ke GitHub
# Container Registry (GHCR).
#
# Environment variable yang dibutuhkan:
#   GHCR_USERNAME - username GitHub pemilik token
#   GHCR_TOKEN    - GitHub PAT dengan scope write:packages
#
# Cara pakai: ./build_push_image_karsajobs_ui.sh [tag]

set -euo pipefail

IMAGE="ghcr.io/irhamsahbana/karsajobs-ui"
TAG="${1:-latest}"

# Login ke GHCR pakai PAT (disimpan di env var, gak muncul di shell history)
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

# Build image-nya; VUE_APP_BACKEND harus udah di-set di .env sebelum ini jalan
docker build -t "$IMAGE:$TAG" .

# Push image yang udah dibuild ke registry
docker push "$IMAGE:$TAG"
