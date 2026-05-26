# Mindar Web — React migration plan

## Current architecture (after settings step)

| Route | Shell | Product UI | Backend |
|-------|--------|------------|---------|
| `/web` | React | `components/mind-v2/*` via `mind-app-web-connected` | `@/api/*` |
| `/login`, `/landing` | React | `MindAuthWeb`, `MindLandingPage` | `@/api/auth`, session |
| `/platform/settings` | **React** | Vue panels via `settings-panel-bridge` (unchanged API calls) | Same as before |
| `/platform/knowledge-bases/*`, `/platform/chat/*`, … | React router → **Vue island** | Legacy `src/views/*` | `@/api/*` |

Entry: `src/main.tsx` → `react/App.tsx` → `react/router.tsx`.

## Principles

1. **UI**: Match parent repo `components/mind-v2` (Mind web design).
2. **Settings**: Keep Vue `Settings.vue` **navigation structure** (13 sections); panel logic stays in existing `.vue` files until ported panel-by-panel.
3. **APIs**: Reuse `src/api/*`, `src/utils/request.ts`, auth session — no endpoint changes during shell migration.

## Phases

### Done — Phase A: System settings shell

- `PlatformSettingsPage` (React) replaces Vue route host for `/platform/settings`.
- `SettingsPanelHost.vue` + `settings-panel-bridge.ts` mount original panels (General, Models, MCP, Tenant, …).
- `openSystemSettings()` uses React Router (`/platform/settings?section=…`).
- `settings-nav` window event still works for deep links from Vue KB/chat.

### Next — Phase B: Knowledge base admin

- `/platform/knowledge-bases/:id` → React `KnowledgeDetail` / web-connected (already partially in `/web`).
- KB chunking/embeddings: bridge or port `KnowledgeBaseEditorModal` / `KBParserSettings.vue`.
- Keep `openKnowledgeBaseSettings()` on API id mapping (`web-api/kb-id.ts`).

### Phase C: Chat & agents

- `/platform/chat/:id`, `/platform/agents` → React agent workspace (`web-agent-*`).
- SSE: reuse `Input-field.vue` stream logic in React hook first, then delete Vue chat page.

### Phase D: Organizations & insights

- `/platform/organizations`, `/platform/insights` → React or defer if low traffic.

### Phase E: Remove Vue platform

- Delete `VuePlatformHost`, `vue-platform/bootstrap.ts`, `PlatformApp.vue`, `menu.vue` when no route uses them.
- Drop `tdesign-vue-next` from critical path (optional keep for bridged panels until full port).

## Verification checklist (per phase)

- [ ] Login / OIDC / auto-setup unchanged
- [ ] List/create/update/delete KB
- [ ] Model + MCP + Ollama settings save/load
- [ ] Chat stream + file upload on KB
- [ ] Tenant / API keys read-only screens

## Local dev

```bash
cd mind-api-frontend && npm run dev
# React product: http://localhost:5173/web
# System settings: http://localhost:5173/platform/settings?section=models
```
