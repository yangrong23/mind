"use client"

import type { ReactNode } from "react"
import { Check, ChevronRight, Clock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { knowledgeBaseIconForTitle } from "@/components/mind-v2/knowledge-base-icon"
import { LibraryCoverFromKb } from "@/components/mind-v2/library-cover"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"

export type SuggestedLibrary = {
  id: number
  name: string
  reason: string
  match?: number
  color: string
  category?: string
}

type KnowledgeLibraryPickerContentProps = {
  suggested?: SuggestedLibrary[]
  libraries: KnowledgeBase[]
  selectedId: number | null
  onSelect: (id: number) => void
  /** Library ids to show under「最近使用」 */
  recentIds?: number[]
}

function LibraryRow({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-0 py-3 text-left transition-colors",
        "border-b border-stone-100/90 last:border-b-0 dark:border-zinc-800/80",
        selected ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-800 hover:text-zinc-900 dark:text-zinc-200"
      )}
    >
      {children}
      {selected ? (
        <Check className="ml-auto h-4 w-4 shrink-0 text-mind" strokeWidth={2.25} aria-hidden />
      ) : (
        <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-zinc-300" aria-hidden />
      )}
    </button>
  )
}

export function KnowledgeLibraryPickerContent({
  suggested = [],
  libraries,
  selectedId,
  onSelect,
  recentIds = [],
}: KnowledgeLibraryPickerContentProps) {
  const suggestedIds = new Set(suggested.map((s) => s.id))
  const recent = libraries.filter((kb) => recentIds.includes(kb.id))
  const rest = libraries.filter((kb) => !recentIds.includes(kb.id) && !suggestedIds.has(kb.id))

  return (
    <div className="min-w-0">
      {suggested.length > 0 ? (
        <section className="mb-4">
          <p className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-zinc-500">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Recommended for you
          </p>
          <div>
            {suggested.map((kb) => {
              const KbIcon = knowledgeBaseIconForTitle(kb.name, kb.reason)
              return (
                <LibraryRow
                  key={`rec-${kb.id}`}
                  selected={selectedId === kb.id}
                  onClick={() => onSelect(kb.id)}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br",
                      kb.color
                    )}
                  >
                    <KbIcon className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-medium">{kb.name}</span>
                      {kb.match != null ? (
                        <span className="text-[11px] text-zinc-400">{kb.match}% match</span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[12px] text-zinc-500">{kb.reason}</p>
                  </div>
                </LibraryRow>
              )
            })}
          </div>
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section className="mb-4">
          <p className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-zinc-500">
            <Clock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Recently used
          </p>
          <div>
            {recent.map((kb) => (
              <LibraryRow key={kb.id} selected={selectedId === kb.id} onClick={() => onSelect(kb.id)}>
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                  <LibraryCoverFromKb kb={kb} showMiniUi={false} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium">{kb.name}</p>
                  <p className="mt-0.5 truncate text-[12px] text-zinc-500">
                    {kb.count} items · {kb.category === "team" ? "Team" : "Personal"}
                  </p>
                </div>
              </LibraryRow>
            ))}
          </div>
        </section>
      ) : null}

      {rest.length > 0 ? (
        <section>
          <p className="mb-2 text-[12px] font-medium text-zinc-500">All libraries</p>
          <div>
            {rest.map((kb) => (
              <LibraryRow key={kb.id} selected={selectedId === kb.id} onClick={() => onSelect(kb.id)}>
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                  <LibraryCoverFromKb kb={kb} showMiniUi={false} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium">{kb.name}</p>
                  <p className="mt-0.5 truncate text-[12px] text-zinc-500">
                    {kb.count} items · {kb.category === "team" ? "Team" : "Personal"}
                  </p>
                </div>
              </LibraryRow>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
