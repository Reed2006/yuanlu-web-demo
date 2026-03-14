#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "用法: $0 <target-directory>" >&2
  exit 1
fi

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="$1"

mkdir -p "$TARGET_DIR"

rsync -av --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude 'artifacts' \
  --exclude 'playwright-report' \
  --exclude 'test-results' \
  --exclude '.env' \
  --exclude '.env.*' \
  "$SOURCE_DIR"/ "$TARGET_DIR"/

rm -rf "$TARGET_DIR/.git"

echo "已导出到: $TARGET_DIR"
echo "下一步可执行:"
echo "  cd \"$TARGET_DIR\""
echo "  git init"
echo "  git add ."
echo "  git commit -m 'initial demo frontend'"
