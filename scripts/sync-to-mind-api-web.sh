#!/usr/bin/env bash
# Sync Mindar web UI (app + landing + shared deps) → MedrixAI/mind-api/web on main
# Excludes mobile-only routes and shells (app/mobile, MindAppV2, bottom nav).
# Prereq: SSH push access to git@github.com:MedrixAI/mind-api.git
# Usage: ./scripts/sync-to-mind-api-web.sh [path-to-mind-api-clone]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIND_API_CLONE="${1:-${MIND_API_CLONE:-/tmp/mind-api-sync}}"
WEB_DEST="$MIND_API_CLONE/web"

if [[ ! -d "$MIND_API_CLONE/.git" ]]; then
  echo "Cloning MedrixAI/mind-api into $MIND_API_CLONE …"
  git clone git@github.com:MedrixAI/mind-api.git "$MIND_API_CLONE"
fi

cd "$MIND_API_CLONE"
git fetch origin
git checkout main
git pull origin main

mkdir -p "$WEB_DEST"

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
  --exclude 'agent-transcripts' \
  --exclude 'scripts/sync-to-ui-demo.sh' \
  --exclude 'scripts/sync-to-mind-api-web.sh' \
  --exclude 'scripts/setup-github-ssh.sh' \
  --exclude 'scripts/test-ark-chat.mjs' \
  --exclude 'app/mobile' \
  --exclude 'app/page.tsx' \
  --exclude 'components/mind' \
  --exclude 'components/mind-v2/mind-app-v2.tsx' \
  --exclude 'components/mind-v2/bottom-nav.tsx' \
  --exclude 'docs/mind-v2-pages' \
  "$ROOT/" \
  "$WEB_DEST/"

# Web entry: marketing landing at /, product at /web
cat > "$WEB_DEST/app/page.tsx" <<'EOF'
import { redirect } from "next/navigation"

export default function Home() {
  redirect("/landing")
}
EOF

cat > "$WEB_DEST/README.md" <<'EOF'
# Mindar Web UI

Next.js web client for Medrix Mind: product shell (`/web`), marketing landing (`/landing`), and auth (`/sign-in`, `/sign-up`).

Mobile prototype routes (`/mobile`, `MindAppV2`) are intentionally excluded from this tree.

## Develop

```bash
pnpm install   # or npm install
pnpm dev
```

Open [http://localhost:3000/landing](http://localhost:3000/landing) for the About / marketing page, or [http://localhost:3000/web](http://localhost:3000/web) for the app shell.
EOF

cd "$MIND_API_CLONE"
git add -A web/
if git diff --cached --quiet; then
  echo "No changes under web/; nothing to commit."
  exit 0
fi

git commit -m "$(cat <<EOF
Add Mindar web UI under web/ (landing + product shell).

Sync Next.js web routes and shared components; exclude mobile-only app/mobile and MindAppV2 shell.
EOF
)"
git push origin main
echo "Done. See: https://github.com/MedrixAI/mind-api/tree/main/web"
