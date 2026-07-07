"use client"

import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import type { MemoSortMode, MemoTimeSpan } from "@/lib/memo-list-filter"

const TIME_SPANS: { id: MemoTimeSpan; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "older", label: "Older" },
]

const SORT_MODES: { id: MemoSortMode; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "az", label: "A → Z" },
  { id: "za", label: "Z → A" },
]

export function MemosSearchSheet({
  open,
  query,
  timeSpan,
  sortMode,
  resultCount,
  onQueryChange,
  onTimeSpanChange,
  onSortModeChange,
  onClose,
  onClear,
}: {
  open: boolean
  query: string
  timeSpan: MemoTimeSpan
  sortMode: MemoSortMode
  resultCount: number
  onQueryChange: (q: string) => void
  onTimeSpanChange: (span: MemoTimeSpan) => void
  onSortModeChange: (mode: MemoSortMode) => void
  onClose: () => void
  onClear: () => void
}) {
  if (!open) return null

  return (
    <div className="absolute inset-0 z-[46] flex flex-col justify-end">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close search" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="memos-search-title"
        className="relative max-h-[min(82vh,640px)] overflow-hidden rounded-t-[1.35rem] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] dark:bg-zinc-950"
      >
        <div className="flex items-center justify-between border-b border-stone-100/80 px-5 py-4 dark:border-zinc-800">
          <h2 id="memos-search-title" className="text-[18px] font-bold text-zinc-900 dark:text-zinc-100">
            Search memos
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 hover:bg-stone-100/85 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 pb-8 pt-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Title, preview, or source…"
              autoFocus
              className={cn(
                "w-full rounded-xl border border-stone-200/90 bg-stone-50/80 py-3 pl-10 pr-10 text-[15px] text-zinc-900",
                "placeholder:text-zinc-400 focus:border-mind/40 focus:outline-none focus:ring-2 focus:ring-mind/15",
                "dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100"
              )}
            />
            {query ? (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            ) : null}
          </div>

          <div>
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-zinc-400">Time</p>
            <div className="flex flex-wrap gap-2">
              {TIME_SPANS.map((row) => {
                const active = timeSpan === row.id
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => onTimeSpanChange(row.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-mind/12 text-mind ring-1 ring-mind/20 dark:bg-mind/20"
                        : "bg-stone-100 text-zinc-600 hover:bg-stone-200/80 dark:bg-zinc-800 dark:text-zinc-300"
                    )}
                  >
                    {row.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-zinc-400">Sort</p>
            <div className="grid grid-cols-2 gap-2">
              {SORT_MODES.map((row) => {
                const active = sortMode === row.id
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => onSortModeChange(row.id)}
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                      active
                        ? "bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-stone-100 text-zinc-700 hover:bg-stone-200/80 dark:bg-zinc-800 dark:text-zinc-300"
                    )}
                  >
                    {row.label}
                  </button>
                )
              })}
            </div>
          </div>

          <p className={cn("text-center", mx.typeCaption)}>
            {resultCount} memo{resultCount === 1 ? "" : "s"} match
          </p>

          <button
            type="button"
            onClick={onClear}
            className="w-full rounded-xl border border-stone-200/90 py-2.5 text-[14px] font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
          >
            Reset search
          </button>
        </div>
      </div>
    </div>
  )
}
