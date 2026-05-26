# External Web Bundle (export)

Auto-generated snapshot of all code the **external web client** uses.

- **Generated:** 2026-05-25T13:12:56Z
- **Files:** 556
- **Source repo:** `b_r1cr2nXDcby (1)`

## Layout

```
external-web-bundle/
├── mind-api-frontend/     ← Vite SPA (React Router, /web /login /landing)
├── components/mind-v2/    ← Web product UI (MindAppWeb, plaza, libraries, chat)
├── components/mind-landing/
├── components/ui/
├── lib/
├── app/                   ← globals.css + reference Next routes
└── public/
```

## Run (dev)

```bash
cd mind-api-frontend
npm install
npm run dev
# → http://localhost:5173/web
```

Vite resolves `@/` to files in this bundle's parent directories (same as monorepo).

## Regenerate

From repo root:

```bash
./scripts/export-external-web-bundle.sh
```
