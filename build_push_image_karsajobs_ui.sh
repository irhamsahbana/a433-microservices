#!/bin/bash
# Builds the karsajobs-ui (frontend) Docker image and pushes it to GitHub
# Container Registry (GHCR).
#
# Required environment variables:
#   GHCR_USERNAME - GitHub username that owns the token
#   GHCR_TOKEN    - GitHub PAT with the write:packages scope
#
# Usage: ./build_push_image_karsajobs_ui.sh [tag]

set -euo pipefail

IMAGE="ghcr.io/irhamsahbana/karsajobs-ui"
TAG="${1:-latest}"

# Log in to GHCR using the PAT (kept out of shell history via env var)
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

# Build the image; VUE_APP_BACKEND must already be set in .env before this runs
docker build -t "$IMAGE:$TAG" .

# Push the built image to the registry
docker push "$IMAGE:$TAG"
