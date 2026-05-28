import type { KbLibraryDocument } from "@/components/mind-v2/knowledge-detail"

const KEY_PREFIX = "mindar-web-kb-doc:"

function cacheKey(kbId: number, docId: number) {
  return `${KEY_PREFIX}${kbId}:${docId}`
}

/** Persist article metadata for doc URLs (refresh-safe demo). */
export function cacheKbDocument(kbId: number, doc: KbLibraryDocument) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(cacheKey(kbId, doc.id), JSON.stringify(doc))
  } catch {
    /* quota / private mode */
  }
}

export function readCachedKbDocument(kbId: number, docId: number): KbLibraryDocument | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(cacheKey(kbId, docId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as KbLibraryDocument
    if (typeof parsed.id !== "number" || typeof parsed.title !== "string") return null
    return parsed
  } catch {
    return null
  }
}

export function hubItemToLibraryDocument(item: {
  id: number
  title: string
  source: string
  author: string
  date: string
  excerpt?: string
}): KbLibraryDocument {
  return {
    id: item.id,
    title: item.title,
    excerpt: item.excerpt ?? "",
    source: item.source,
    author: item.author,
    date: item.date,
  }
}
