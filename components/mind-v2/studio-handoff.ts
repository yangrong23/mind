import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import { MOCK_KNOWLEDGE_BASES } from "@/components/mind-v2/knowledge-tab"

/** How Agent links libraries when opening Studio / content factory */
export type StudioLibraryLinkMode = "all" | "auto" | "pick"

export type StudioFromAgentHandoff = {
  factoryKind: FactoryModalKind
  libraryLinkMode: StudioLibraryLinkMode
  /** When `libraryLinkMode` is `pick`, these are the chosen mock KB ids */
  pickedKbIds: number[]
}

/** Empty pick list behaves like auto */
export function normalizeStudioFromAgentHandoff(h: StudioFromAgentHandoff): StudioFromAgentHandoff {
  const { factoryKind, libraryLinkMode, pickedKbIds } = h
  if (libraryLinkMode === "pick" && pickedKbIds.length === 0) {
    return { factoryKind, libraryLinkMode: "auto", pickedKbIds: [] }
  }
  if (libraryLinkMode === "pick") {
    return { factoryKind, libraryLinkMode: "pick", pickedKbIds }
  }
  return { factoryKind, libraryLinkMode, pickedKbIds: [] }
}

/** Single label for factory modals / UI (matches prior kb-detail synthetic titles) */
export function resolveAgentStudioLibraryName(h: StudioFromAgentHandoff): string {
  const n = normalizeStudioFromAgentHandoff(h)
  if (n.libraryLinkMode === "all") return "All libraries"
  if (n.libraryLinkMode === "auto") return "Auto"
  const rows = n.pickedKbIds
    .map((id) => MOCK_KNOWLEDGE_BASES.find((k) => k.id === id))
    .filter((x): x is (typeof MOCK_KNOWLEDGE_BASES)[number] => Boolean(x))
  if (rows.length === 0) return resolveAgentStudioLibraryName({ ...n, libraryLinkMode: "auto", pickedKbIds: [] })
  const [first, ...rest] = rows
  const extra = rest.length
  return extra > 0 ? `${first.name} +${extra}` : first.name
}
