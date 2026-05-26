#!/usr/bin/env bash
# Export a self-contained copy of everything the external web app (mind-api-frontend) uses.
# Output: ./external-web-bundle/  (sibling layout: monorepo UI + mind-api-frontend)
#
# Usage: ./scripts/export-external-web-bundle.sh [dest-dir]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-$ROOT/external-web-bundle}"

echo "Exporting external web bundle → $DEST"

rm -rf "$DEST"
mkdir -p "$DEST"

# ── 1. Vite app (external端入口) ─────────────────────────────────────────────
rsync -a \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude 'package.json.md5' \
  "$ROOT/mind-api-frontend/" \
  "$DEST/mind-api-frontend/"

# ── 2. Parent monorepo files resolved via @/ alias (vite-web-alias.ts) ───────
mkdir -p "$DEST/components" "$DEST/lib" "$DEST/app" "$DEST/public"

rsync -a "$ROOT/components/mind-v2/" "$DEST/components/mind-v2/"
rsync -a "$ROOT/components/mind-landing/" "$DEST/components/mind-landing/"
rsync -a "$ROOT/components/ui/" "$DEST/components/ui/"

rsync -a "$ROOT/lib/" "$DEST/lib/"

rsync -a \
  "$ROOT/app/globals.css" \
  "$ROOT/app/layout.tsx" \
  "$ROOT/app/providers.tsx" \
  "$DEST/app/"

rsync -a "$ROOT/app/web/" "$DEST/app/web/"
rsync -a "$ROOT/app/landing/" "$DEST/app/landing/"
rsync -a "$ROOT/app/sign-in/" "$DEST/app/sign-in/" 2>/dev/null || true
rsync -a "$ROOT/app/sign-up/" "$DEST/app/sign-up/" 2>/dev/null || true

rsync -a "$ROOT/public/" "$DEST/public/"

# Root build helpers referenced by Tailwind / Next-style tooling
for f in postcss.config.mjs tsconfig.json components.json; do
  [[ -f "$ROOT/$f" ]] && cp "$ROOT/$f" "$DEST/$f"
done

# ── 3. Manifest ─────────────────────────────────────────────────────────────
EXPORT_TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
FILE_COUNT="$(find "$DEST" -type f ! -path '*/.*' | wc -l | tr -d ' ')"

cat > "$DEST/README.md" <<EOF
# External Web Bundle (export)

Auto-generated snapshot of all code the **external web client** uses.

- **Generated:** $EXPORT_TS
- **Files:** $FILE_COUNT
- **Source repo:** \`$(basename "$ROOT")\`

## Layout

\`\`\`
external-web-bundle/
├── mind-api-frontend/     ← Vite SPA (React Router, /web /login /landing)
├── components/mind-v2/    ← Web product UI (MindAppWeb, plaza, libraries, chat)
├── components/mind-landing/
├── components/ui/
├── lib/
├── app/                   ← globals.css + reference Next routes
└── public/
\`\`\`

## Run (dev)

\`\`\`bash
cd mind-api-frontend
npm install
npm run dev
# → http://localhost:5173/web
\`\`\`

Vite resolves \`@/\` to files in this bundle's parent directories (same as monorepo).

## Regenerate

From repo root:

\`\`\`bash
./scripts/export-external-web-bundle.sh
\`\`\`
EOF

echo "Done: $DEST ($FILE_COUNT files)"
