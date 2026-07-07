#!/usr/bin/env bash
# Sync this repo (Minder web UI root) → MedrixAI/ui-demo, branch ui-init
# Prereq: SSH key with push access to git@github.com:MedrixAI/ui-demo.git
# Usage: from repo root —  ./scripts/sync-to-ui-demo.sh [path-to-ui-demo-clone]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UI_DEMO_CLONE="${1:-${UI_DEMO_CLONE:-/tmp/ui-demo-sync}}"

if [[ ! -d "$UI_DEMO_CLONE/.git" ]]; then
  echo "Cloning MedrixAI/ui-demo into $UI_DEMO_CLONE …"
  git clone git@github.com:MedrixAI/ui-demo.git "$UI_DEMO_CLONE"
fi

cd "$UI_DEMO_CLONE"
git fetch origin
git checkout ui-init 2>/dev/null || git checkout -b ui-init origin/ui-init
git pull origin ui-init

rsync -a --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.pnpm-store' \
  --exclude 'tsconfig.tsbuildinfo' \
  --exclude '.DS_Store' \
  --exclude '__v0_*' \
  --exclude '.vercel' \
  --exclude '.cursor' \
  "$ROOT/" \
  "$UI_DEMO_CLONE/"

git add -A
if git diff --cached --quiet; then
  echo "No changes; nothing to commit."
  exit 0
fi

git commit -m "Sync full Minder web UI from local workspace ($(date -u +%Y-%m-%d))."
git push origin ui-init
echo "Done. See: https://github.com/MedrixAI/ui-demo/tree/ui-init"
