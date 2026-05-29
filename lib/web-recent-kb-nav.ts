import {
  readRecentPrivateKbIds,
  readRecentPublicKbIds,
  resolveRecentPrivateKbIds,
  resolveRecentPublicKbIds,
} from "@/lib/web-recent-usage"

/** MRU order for shell nav — private libraries first, then plaza/subscribed. */
export function recentKbIdsForNav(limit = 5): number[] {
  const priv = resolveRecentPrivateKbIds(readRecentPrivateKbIds())
  const pub = resolveRecentPublicKbIds(readRecentPublicKbIds())
  const seen = new Set<number>()
  const merged: number[] = []
  for (const id of [...priv, ...pub]) {
    if (seen.has(id)) continue
    seen.add(id)
    merged.push(id)
    if (merged.length >= limit) break
  }
  return merged
}
