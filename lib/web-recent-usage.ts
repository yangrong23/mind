/** Persists recently opened knowledge bases and agents for web quick access (demo). */

const STORAGE_KEY = "mind-web-recent-v1"
const MAX_RECENT = 6

type RecentStore = {
  kbIds: number[]
  agentIds: number[]
}

function readStore(): RecentStore {
  if (typeof window === "undefined") return { kbIds: [], agentIds: [] }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { kbIds: [], agentIds: [] }
    const parsed = JSON.parse(raw) as Partial<RecentStore>
    return {
      kbIds: Array.isArray(parsed.kbIds) ? parsed.kbIds.filter((n) => typeof n === "number") : [],
      agentIds: Array.isArray(parsed.agentIds)
        ? parsed.agentIds.filter((n) => typeof n === "number")
        : [],
    }
  } catch {
    return { kbIds: [], agentIds: [] }
  }
}

function writeStore(store: RecentStore) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* quota / private mode */
  }
}

function bumpId(list: number[], id: number): number[] {
  return [id, ...list.filter((x) => x !== id)].slice(0, MAX_RECENT)
}

export function touchRecentKb(kbId: number) {
  const store = readStore()
  writeStore({ ...store, kbIds: bumpId(store.kbIds, kbId) })
}

export function touchRecentAgent(agentId: number) {
  const store = readStore()
  writeStore({ ...store, agentIds: bumpId(store.agentIds, agentId) })
}

export function readRecentKbIds(): number[] {
  return readStore().kbIds
}

export function readRecentAgentIds(): number[] {
  return readStore().agentIds
}

/** Default recents when store is empty (demo onboarding). */
export const WEB_DEMO_RECENT_KB_IDS = [1, 2, 5] as const
export const WEB_DEMO_RECENT_AGENT_IDS = [0, 201, 202] as const

export function resolveRecentKbIds(stored: number[]): number[] {
  return stored.length > 0 ? stored : [...WEB_DEMO_RECENT_KB_IDS]
}

export function resolveRecentAgentIds(stored: number[]): number[] {
  return stored.length > 0 ? stored : [...WEB_DEMO_RECENT_AGENT_IDS]
}
