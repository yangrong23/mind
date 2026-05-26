import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"

const STORAGE_KEY = "mind-v2-plaza-subscriptions"

type StoredPlazaKb = KnowledgeBase & { subscribedAt: string }

function readRaw(): StoredPlazaKb[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredPlazaKb[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRaw(rows: StoredPlazaKb[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
  } catch {
    /* ignore quota */
  }
}

export function readPlazaSubscriptions(): KnowledgeBase[] {
  return readRaw().map(({ subscribedAt: _s, ...kb }) => kb)
}

export function isPlazaSubscribed(kbId: number): boolean {
  return readRaw().some((k) => k.id === kbId)
}

export function subscribePlazaLibrary(kb: KnowledgeBase): KnowledgeBase {
  const entry: StoredPlazaKb = {
    ...kb,
    category: "subscribed",
    subscribedRole: kb.subscribedRole ?? "followed",
    subscribedAt: new Date().toISOString(),
  }
  const next = readRaw().filter((k) => k.id !== kb.id)
  next.unshift(entry)
  writeRaw(next)
  return entry
}

export function unsubscribePlazaLibrary(kbId: number): void {
  writeRaw(readRaw().filter((k) => k.id !== kbId))
}

/** Mock KB ids 6–9 ship as pre-subscribed in demo */
export const DEMO_PRESUBSCRIBED_KB_IDS = new Set([6, 7, 8, 9])

export function isLibrarySubscribed(kb: Pick<KnowledgeBase, "id" | "category" | "subscribedRole">): boolean {
  if (kb.category === "subscribed" && DEMO_PRESUBSCRIBED_KB_IDS.has(kb.id)) return true
  if (kb.subscribedRole === "published") return true
  return isPlazaSubscribed(kb.id)
}
