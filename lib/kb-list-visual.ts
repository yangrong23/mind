import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import { coverVisualForVariant } from "@/lib/library-cover-visual"
import { libraryCoverVariantForId } from "@/lib/product-media"

/** Branded cover art — skip separate list icon, show cover or color block only */
export function kbHasRichCover(kb: Pick<KnowledgeBase, "id" | "name" | "coverVariant" | "coverImage">): boolean {
  if (kb.coverImage) return true
  const variant = kb.coverVariant ?? libraryCoverVariantForId(kb.id, kb.name)
  return variant !== "default"
}

export function kbCoverVisual(kb: Pick<KnowledgeBase, "id" | "name" | "coverVariant">) {
  const variant = kb.coverVariant ?? libraryCoverVariantForId(kb.id, kb.name)
  return coverVisualForVariant(variant)
}

/** Tailwind gradient classes for simple color-only thumbnails */
export function kbColorBlockClass(kb: Pick<KnowledgeBase, "id" | "name" | "coverVariant">): string {
  return `bg-gradient-to-br ${kbCoverVisual(kb).gradient}`
}
