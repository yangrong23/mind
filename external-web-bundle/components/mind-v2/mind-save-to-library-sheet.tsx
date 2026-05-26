"use client"

import { ChevronRight, X } from "lucide-react"
import { MOCK_KNOWLEDGE_BASES, type KnowledgeBase } from "@/lib/mock-knowledge-bases"
import { LibraryCoverFromKb } from "@/components/mind-v2/library-cover"

/** Libraries the user can save into (demo: mine + team). */
export const SAVE_TO_LIBRARY_KBS = MOCK_KNOWLEDGE_BASES.filter(
  (kb) => kb.category === "mine" || kb.category === "team"
)

export type MindSaveToLibrarySheetProps = {
  open: boolean
  onClose: () => void
  onSelect: (kb: KnowledgeBase) => void
  title?: string
  /** Shown under the title — e.g. note title or reply excerpt */
  preview?: string
  /** Current grounding library — listed first with a badge */
  preferredKbName?: string
}

function orderLibraries(preferredKbName?: string) {
  const rows = [...SAVE_TO_LIBRARY_KBS]
  if (!preferredKbName?.trim()) return rows
  const name = preferredKbName.trim()
  const idx = rows.findIndex((kb) => kb.name === name)
  if (idx <= 0) return rows
  const [hit] = rows.splice(idx, 1)
  return [hit, ...rows]
}

export function MindSaveToLibrarySheet({
  open,
  onClose,
  onSelect,
  title = "Save to library",
  preview,
  preferredKbName,
}: MindSaveToLibrarySheetProps) {
  if (!open) return null

  const libraries = orderLibraries(preferredKbName)

  return (
    <div className="absolute inset-0 z-[70] flex flex-col justify-end">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-to-library-title"
        className="relative max-h-[70vh] overflow-hidden rounded-t-[1.25rem] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.15)] dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
          <h2 id="save-to-library-title" className="text-[17px] font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 hover:bg-stone-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        {preview ? (
          <p className="border-b border-stone-100 px-4 py-2.5 text-[13px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <span className="line-clamp-3 font-medium text-zinc-700 dark:text-zinc-300">{preview}</span>
          </p>
        ) : null}
        <div className="max-h-[50vh] overflow-y-auto py-1">
          {libraries.map((kb) => {
            const isPreferred = Boolean(preferredKbName?.trim() && kb.name === preferredKbName.trim())
            return (
              <button
                key={kb.id}
                type="button"
                onClick={() => onSelect(kb)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-stone-50 active:bg-stone-100/80 dark:hover:bg-zinc-900"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                  <LibraryCoverFromKb kb={kb} showMiniUi={false} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[15px] font-medium text-zinc-900 dark:text-zinc-100">
                      {kb.name}
                    </span>
                    {isPreferred ? (
                      <span className="shrink-0 rounded-full bg-mind/10 px-2 py-0.5 text-[10px] font-semibold text-mind">
                        Current
                      </span>
                    ) : null}
                  </div>
                  <div className="truncate text-[12px] text-zinc-500">
                    {kb.count} items · {kb.category === "team" ? "Team" : "Mine"}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}