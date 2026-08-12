#!/usr/bin/env bash
set -euo pipefail
rm -rf dist
mkdir -p dist
rsync -a \
  --exclude '.git' \
  --exclude '.venv-ffmpeg' \
  --exclude '.wrangler' \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.DS_Store' \
  --exclude '**/.DS_Store' \
  --exclude '*.original.mp4' \
  --exclude '.assetsignore' \
  ./ dist/
