/** Pinned knowledge libraries for web sidebar (demo localStorage). */

const STORAGE_KEY = "mind-web-pinned-kbs"

function readIds(): number[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((n): n is number => typeof n === "number")
  } catch {
    return []
  }
}

function writeIds(ids: number[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    /* quota / private mode */
  }
}

export function readPinnedKbIds(): number[] {
  return readIds()
}

export function isKbPinned(kbId: number, pinnedIds: Iterable<number> = readIds()): boolean {
  const set = pinnedIds instanceof Set ? pinnedIds : new Set(pinnedIds)
  return set.has(kbId)
}

/** Toggle pin; returns the updated id list. */
export function togglePinnedKb(kbId: number): number[] {
  const current = readIds()
  const next = current.includes(kbId)
    ? current.filter((id) => id !== kbId)
    : [kbId, ...current]
  writeIds(next)
  return next
}

export function sortKbsPinnedFirst<T extends { id: number }>(items: T[], pinnedIds: Iterable<number>): T[] {
  const pinned = pinnedIds instanceof Set ? pinnedIds : new Set(pinnedIds)
  if (pinned.size === 0) return items
  return [...items].sort((a, b) => {
    const ap = pinned.has(a.id) ? 0 : 1
    const bp = pinned.has(b.id) ? 0 : 1
    return ap - bp
  })
}
