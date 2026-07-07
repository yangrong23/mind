"use client"

import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { LibraryCoverFromKb } from "@/components/mind-v2/library-cover"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"

export function AgentLibrarySearchSheet({
  open,
  libraries,
  selectedIds,
  onClose,
  onConfirm,
}: {
  open: boolean
  libraries: KnowledgeBase[]
  selectedIds: number[]
  onClose: () => void
  onConfirm: (ids: number[]) => void
}) {
  const [query, setQuery] = useState("")
  const [draft, setDraft] = useState<number[]>(selectedIds)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return libraries
    return libraries.filter(
      (kb) =>
        kb.name.toLowerCase().includes(q) ||
        kb.description.toLowerCase().includes(q) ||
        kb.category.toLowerCase().includes(q)
    )
  }, [libraries, query])

  if (!open) return null

  const toggle = (id: number) => {
    setDraft((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-[#f5f5f5] dark:bg-zinc-950">
      <div className="flex shrink-0 items-center gap-2 border-b border-stone-200/90 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
        <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-zinc-800" aria-label="Close">
          <X className="h-5 w-5 text-zinc-600" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-stone-100 px-3 py-2 dark:bg-zinc-800">
          <Search className="h-4 w-4 shrink-0 text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search libraries by name or topic…"
            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] outline-none dark:text-zinc-100"
            autoFocus
          />
        </div>
        <button
          type="button"
          onClick={() => {
            onConfirm(draft)
            onClose()
          }}
          className="shrink-0 rounded-lg px-3 py-1.5 text-[15px] font-semibold text-mind"
        >
          Done
        </button>
      </div>

      <p className="shrink-0 px-4 py-2 text-[12px] text-zinc-500 dark:text-zinc-400">
        {draft.length === 0
          ? "Pick libraries this assistant can reference with @."
          : `${draft.length} selected — answers stay scoped to these sources.`}
      </p>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-[14px] text-zinc-500">No libraries match your search.</p>
        ) : (
          <ul className="space-y-1">
            {filtered.map((kb) => {
              const selected = draft.includes(kb.id)
              return (
                <li key={kb.id}>
                  <button
                    type="button"
                    onClick={() => toggle(kb.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
                      selected ? "bg-sky-50 ring-1 ring-sky-200/80 dark:bg-sky-950/40 dark:ring-sky-800" : "bg-white dark:bg-zinc-900"
                    )}
                  >
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-stone-200/80 dark:ring-zinc-700">
                      <LibraryCoverFromKb kb={kb} showMiniUi={false} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">{kb.name}</p>
                      <p className="mt-0.5 line-clamp-1 text-[12px] text-zinc-500 capitalize">{kb.category}</p>
                    </div>
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
                        selected
                          ? "border-mind bg-mind text-white"
                          : "border-stone-300 text-transparent dark:border-zinc-600"
                      )}
                    >
                      ✓
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
