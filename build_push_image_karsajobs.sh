#!/bin/bash
# Build image Docker karsajobs (backend) dan push ke GitHub
# Container Registry (GHCR).
#
# Environment variable yang dibutuhkan:
#   GHCR_USERNAME - username GitHub pemilik token
#   GHCR_TOKEN    - GitHub PAT dengan scope write:packages
#
# Cara pakai: ./build_push_image_karsajobs.sh [tag]

set -euo pipefail

IMAGE="ghcr.io/irhamsahbana/karsajobs"
TAG="${1:-latest}"

# Login ke GHCR pakai PAT (disimpan di env var, gak muncul di shell history)
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

# Build image dari Dockerfile di direktori ini
docker build -t "$IMAGE:$TAG" .

# Push image yang udah dibuild ke registry
docker push "$IMAGE:$TAG"
