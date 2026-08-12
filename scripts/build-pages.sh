#!/usr/bin/env bash
set -euo pipefail
rm -rf dist
mkdir -p dist

# Cloudflare's build image has no rsync — copy with tar instead.
tar -C . \
  --exclude='./.git' \
  --exclude='./.venv-ffmpeg' \
  --exclude='./.wrangler' \
  --exclude='./node_modules' \
  --exclude='./dist' \
  --exclude='./.DS_Store' \
  --exclude='./**/.DS_Store' \
  --exclude='./**/*.original.mp4' \
  --exclude='./images/_precompress' \
  --exclude='./.assetsignore' \
  --exclude='./_compress_renames.txt' \
  --exclude='./package.json' \
  --exclude='./package-lock.json' \
  --exclude='./scripts' \
  --exclude='./wrangler.toml' \
  -cf - . | tar -C dist -xf -
