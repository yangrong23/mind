#!/usr/bin/env bash
# Sync this repo (Mind V2 app root) → MedrixAI/Mind repo, branch main, folder app_demo/
# Prereq: SSH key with push access to git@github.com:MedrixAI/Mind.git
# Usage: from repo root —  ./scripts/sync-to-medrix-app-demo.sh [path-to-Mind-clone]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIND_CLONE="${1:-${MIND_CLONE:-$ROOT/../Mind}}"

if [[ ! -d "$MIND_CLONE/.git" ]]; then
  echo "Expected a clone of MedrixAI/Mind at: $MIND_CLONE"
  echo "Usage: $0 /path/to/Mind"
  echo "Or:    MIND_CLONE=/path/to/Mind $0"
  exit 1
fi

cd "$MIND_CLONE"
git pull origin main

rsync -a \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.pnpm-store' \
  --exclude 'tsconfig.tsbuildinfo' \
  --exclude '.DS_Store' \
  "$ROOT/" \
  "$MIND_CLONE/app_demo/"

git add app_demo
if git diff --cached --quiet; then
  echo "No changes under app_demo; nothing to commit."
  exit 0
fi

git commit -m "chore(app_demo): sync from local Mind V2 workspace ($(date -u +%Y-%m-%d))"
git push origin main
echo "Done. See: https://github.com/MedrixAI/Mind/tree/main/app_demo"
