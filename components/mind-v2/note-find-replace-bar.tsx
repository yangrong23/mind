"use client"

import type { ReactNode } from "react"
import { ChevronDown, ChevronUp, Replace, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type NoteFindReplaceBarProps = {
  findQuery: string
  onFindQueryChange: (value: string) => void
  replaceQuery: string
  onReplaceQueryChange: (value: string) => void
  matchIndex: number
  matchCount: number
  onPrevMatch: () => void
  onNextMatch: () => void
  onReplace: () => void
  onClose: () => void
}

export function NoteFindReplaceBar({
  findQuery,
  onFindQueryChange,
  replaceQuery,
  onReplaceQueryChange,
  matchIndex,
  matchCount,
  onPrevMatch,
  onNextMatch,
  onReplace,
  onClose,
}: NoteFindReplaceBarProps) {
  const counterLabel = matchCount === 0 ? "0/0" : `${matchIndex + 1}/${matchCount}`

  return (
    <div
      className={cn(
        "shrink-0 border-t border-stone-200/90 bg-white px-3 py-2.5",
        "pb-[max(0.625rem,env(safe-area-inset-bottom))] dark:border-zinc-800 dark:bg-zinc-950"
      )}
      role="search"
    >
      <div className="flex items-center gap-2 border-b border-stone-100 pb-2.5 dark:border-zinc-800">
        <Search className="h-[18px] w-[18px] shrink-0 text-zinc-400" strokeWidth={2} aria-hidden />
        <input
          type="search"
          value={findQuery}
          onChange={(e) => onFindQueryChange(e.target.value)}
          placeholder="Find"
          autoFocus
          className="min-w-0 flex-1 bg-transparent text-[15px] text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
        />
        <span className="shrink-0 text-[13px] tabular-nums text-zinc-400">{counterLabel}</span>
        <button
          type="button"
          onClick={onPrevMatch}
          disabled={matchCount === 0}
          className="rounded-md p-1 text-zinc-500 hover:bg-stone-100 disabled:opacity-30 dark:hover:bg-zinc-800"
          aria-label="Previous match"
        >
          <ChevronUp className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onNextMatch}
          disabled={matchCount === 0}
          className="rounded-md p-1 text-zinc-500 hover:bg-stone-100 disabled:opacity-30 dark:hover:bg-zinc-800"
          aria-label="Next match"
        >
          <ChevronDown className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-zinc-500 hover:bg-stone-100 dark:hover:bg-zinc-800"
          aria-label="Close find and replace"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
      </div>
      <div className="flex items-center gap-2 pt-2.5">
        <Replace className="h-[18px] w-[18px] shrink-0 text-zinc-400" strokeWidth={2} aria-hidden />
        <input
          type="text"
          value={replaceQuery}
          onChange={(e) => onReplaceQueryChange(e.target.value)}
          placeholder="Replace with"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
        />
        <button
          type="button"
          onClick={onReplace}
          disabled={!findQuery.trim() || matchCount === 0}
          className="shrink-0 text-[15px] font-medium text-zinc-900 disabled:text-zinc-300 dark:text-zinc-100 dark:disabled:text-zinc-600"
        >
          Replace
        </button>
      </div>
    </div>
  )
}

export function findMatchIndices(text: string, query: string): number[] {
  const q = query.trim()
  if (!q) return []
  const lower = text.toLowerCase()
  const needle = q.toLowerCase()
  const indices: number[] = []
  let start = 0
  while (start <= lower.length - needle.length) {
    const hit = lower.indexOf(needle, start)
    if (hit === -1) break
    indices.push(hit)
    start = hit + needle.length
  }
  return indices
}

export function replaceMatchAt(text: string, start: number, length: number, replacement: string): string {
  return `${text.slice(0, start)}${replacement}${text.slice(start + length)}`
}

export function getActiveBlockMatchIndex(
  chunks: string[],
  blockIndex: number,
  globalMatchIndex: number,
  query: string
): number {
  const q = query.trim()
  if (!q) return -1
  const full = chunks.join("\n")
  const allStarts = findMatchIndices(full, q)
  if (allStarts.length === 0) return -1
  const activeStart = allStarts[globalMatchIndex] ?? allStarts[0]

  let pos = 0
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const chunkEnd = pos + chunk.length
    if (i === blockIndex) {
      if (activeStart < pos || activeStart >= chunkEnd) return -1
      const localStart = activeStart - pos
      return findMatchIndices(chunk, q).findIndex((s) => s === localStart)
    }
    pos = chunkEnd + 1
  }
  return -1
}

export function renderHighlightedText(
  text: string,
  query: string,
  activeMatchIndex: number
): ReactNode {
  const q = query.trim()
  if (!q) return text

  const lower = text.toLowerCase()
  const needle = q.toLowerCase()
  const parts: React.ReactNode[] = []
  let cursor = 0
  let matchIdx = 0

  while (cursor <= lower.length - needle.length) {
    const hit = lower.indexOf(needle, cursor)
    if (hit === -1) break
    if (hit > cursor) parts.push(text.slice(cursor, hit))
    parts.push(
      <mark
        key={`${hit}-${matchIdx}`}
        className={
          matchIdx === activeMatchIndex
            ? "rounded-sm bg-mind/25 text-inherit"
            : "rounded-sm bg-yellow-100/90 text-inherit dark:bg-yellow-900/40"
        }
      >
        {text.slice(hit, hit + needle.length)}
      </mark>
    )
    matchIdx += 1
    cursor = hit + needle.length
  }

  if (cursor < text.length) parts.push(text.slice(cursor))
  return parts.length ? parts : text
}
