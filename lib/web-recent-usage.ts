/** Persists recently opened libraries, agents, and notes for web quick access (demo). */

import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"

const STORAGE_KEY = "mind-web-recent-v2"
const MAX_RECENT = 10

export type KbRecentsBucket = "public" | "private"

type RecentStore = {
  publicKbIds: number[]
  privateKbIds: number[]
  agentIds: number[]
  noteIds: number[]
  /** @deprecated migrated into public/private */
  kbIds?: number[]
}

function emptyStore(): RecentStore {
  return { publicKbIds: [], privateKbIds: [], agentIds: [], noteIds: [] }
}

function readStore(): RecentStore {
  if (typeof window === "undefined") return emptyStore()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStore()
    const parsed = JSON.parse(raw) as Partial<RecentStore>
    const store: RecentStore = {
      publicKbIds: Array.isArray(parsed.publicKbIds)
        ? parsed.publicKbIds.filter((n) => typeof n === "number")
        : [],
      privateKbIds: Array.isArray(parsed.privateKbIds)
        ? parsed.privateKbIds.filter((n) => typeof n === "number")
        : [],
      agentIds: Array.isArray(parsed.agentIds)
        ? parsed.agentIds.filter((n) => typeof n === "number")
        : [],
      noteIds: Array.isArray(parsed.noteIds)
        ? parsed.noteIds.filter((n) => typeof n === "number")
        : [],
      kbIds: Array.isArray(parsed.kbIds) ? parsed.kbIds.filter((n) => typeof n === "number") : [],
    }
    if (store.publicKbIds.length === 0 && store.privateKbIds.length === 0 && store.kbIds?.length) {
      for (const id of store.kbIds) {
        store.privateKbIds = bumpId(store.privateKbIds, id)
      }
    }
    return store
  } catch {
    return emptyStore()
  }
}

function writeStore(store: RecentStore) {
  if (typeof window === "undefined") return
  try {
    const { kbIds: _legacy, ...payload } = store
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* quota / private mode */
  }
}

function bumpId(list: number[], id: number): number[] {
  return [id, ...list.filter((x) => x !== id)].slice(0, MAX_RECENT)
}

/** Public = followed / plaza libraries; private = personal, team, and published-by-you. */
export function kbRecentsBucket(
  kb: Pick<KnowledgeBase, "category" | "subscribedRole" | "isPublicPublished">
): KbRecentsBucket {
  if (kb.category === "subscribed" && kb.subscribedRole !== "published") return "public"
  return "private"
}

export function touchRecentKb(kbId: number, bucket?: KbRecentsBucket) {
  const store = readStore()
  const resolved = bucket ?? "private"
  if (resolved === "public") {
    writeStore({
      ...store,
      publicKbIds: bumpId(store.publicKbIds, kbId),
      privateKbIds: store.privateKbIds.filter((id) => id !== kbId),
    })
  } else {
    writeStore({
      ...store,
      privateKbIds: bumpId(store.privateKbIds, kbId),
      publicKbIds: store.publicKbIds.filter((id) => id !== kbId),
    })
  }
}

export function touchRecentKbFromBase(kb: KnowledgeBase) {
  touchRecentKb(kb.id, kbRecentsBucket(kb))
}

export function touchRecentAgent(agentId: number) {
  const store = readStore()
  writeStore({ ...store, agentIds: bumpId(store.agentIds, agentId) })
}

export function touchRecentNote(noteId: number) {
  const store = readStore()
  writeStore({ ...store, noteIds: bumpId(store.noteIds, noteId) })
}

export function readRecentPublicKbIds(): number[] {
  return readStore().publicKbIds
}

export function readRecentPrivateKbIds(): number[] {
  return readStore().privateKbIds
}

export function readRecentAgentIds(): number[] {
  return readStore().agentIds
}

export function readRecentNoteIds(): number[] {
  return readStore().noteIds
}

/** @deprecated Use readRecentPublicKbIds / readRecentPrivateKbIds */
export function readRecentKbIds(): number[] {
  const s = readStore()
  return [...s.publicKbIds, ...s.privateKbIds]
}

export const WEB_DEMO_RECENT_PUBLIC_KB_IDS = [5, 6] as const
export const WEB_DEMO_RECENT_PRIVATE_KB_IDS = [1, 2] as const
export const WEB_DEMO_RECENT_AGENT_IDS = [0, 201, 202] as const
export const WEB_DEMO_RECENT_NOTE_IDS = [9001, 100, 101] as const

export function resolveRecentPublicKbIds(stored: number[]): number[] {
  return stored.length > 0 ? stored : [...WEB_DEMO_RECENT_PUBLIC_KB_IDS]
}

export function resolveRecentPrivateKbIds(stored: number[]): number[] {
  return stored.length > 0 ? stored : [...WEB_DEMO_RECENT_PRIVATE_KB_IDS]
}

export function resolveRecentAgentIds(stored: number[]): number[] {
  return stored.length > 0 ? stored : [...WEB_DEMO_RECENT_AGENT_IDS]
}

export function resolveRecentNoteIds(stored: number[]): number[] {
  return stored.length > 0 ? stored : [...WEB_DEMO_RECENT_NOTE_IDS]
}

export function resolveRecentKbIds(stored: number[]): number[] {
  const pub = resolveRecentPublicKbIds(readRecentPublicKbIds())
  const priv = resolveRecentPrivateKbIds(readRecentPrivateKbIds())
  if (stored.length > 0) return stored
  return [...pub, ...priv]
}
