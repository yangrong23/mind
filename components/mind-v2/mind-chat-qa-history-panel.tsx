"use client"

import { MessageSquare, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type MindQaHistoryItem = {
  id: string
  /** UTC ms for grouping */
  at: number
  query: string
}

function dayKey(at: number) {
  const d = new Date(at)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function formatDayHeading(at: number, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(at))
}

function groupItemsByDay(items: MindQaHistoryItem[], locale: string) {
  const byDay = new Map<string, MindQaHistoryItem[]>()
  for (const it of items) {
    const k = dayKey(it.at)
    const arr = byDay.get(k) ?? []
    arr.push(it)
    byDay.set(k, arr)
  }
  const keys = [...byDay.keys()].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
  return keys.map((k) => {
    const first = byDay.get(k)![0]
    return { key: k, label: formatDayHeading(first.at, locale), items: byDay.get(k)! }
  })
}

export type MindChatQaHistoryPanelProps = {
  open: boolean
  onClose: () => void
  items: MindQaHistoryItem[]
  /** Screen title */
  title?: string
  /** Footer retention note */
  retentionHint?: string
  /** Passed to `Intl.DateTimeFormat` for date headings */
  locale?: string
  className?: string
}

export function MindChatQaHistoryPanel({
  open,
  onClose,
  items,
  title = "Q&A history",
  retentionHint = "Keeps the last 90 days of history for you.",
  locale = "en-US",
  className,
}: MindChatQaHistoryPanelProps) {
  if (!open) return null

  const groups = groupItemsByDay(items, locale)

  return (
    <div
      className={cn(
        "absolute inset-0 z-[80] flex flex-col bg-white dark:bg-zinc-950",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mind-qa-history-title"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-stone-100 px-2 py-2.5 dark:border-zinc-800">
        <div className="w-10" aria-hidden />
        <h1 id="mind-qa-history-title" className="min-w-0 flex-1 text-center text-[16px] font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 hover:bg-stone-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-label="Close"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-2">
        {groups.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">No questions yet.</p>
        ) : (
          <ul className="space-y-6">
            {groups.map((g) => (
              <li key={g.key}>
                <p className="mb-3 text-[13px] text-zinc-400 dark:text-zinc-500">{g.label}</p>
                <ul className="space-y-4">
                  {g.items.map((it) => (
                    <li key={it.id} className="flex gap-3">
                      <span className="mt-0.5 shrink-0 text-zinc-800 dark:text-zinc-100" aria-hidden>
                        <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <p className="min-w-0 flex-1 text-[15px] leading-snug text-zinc-900 dark:text-zinc-100">
                        {it.query}
                      </p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="shrink-0 border-t border-stone-100 px-4 py-3 dark:border-zinc-800">
        <p className="text-center text-[12px] text-zinc-400 dark:text-zinc-500">{retentionHint}</p>
      </footer>
    </div>
  )
}

export function seedDemoQaHistory(): MindQaHistoryItem[] {
  const d = (y: number, m: number, day: number) => new Date(y, m - 1, day, 12, 0, 0, 0).getTime()
  return [
    { id: "demo-1", at: d(2026, 5, 12), query: "What are the core advantages of NotebookLM?" },
    { id: "demo-2", at: d(2026, 5, 12), query: "Give this knowledge base an information digest." },
    { id: "demo-3", at: d(2026, 5, 10), query: "Summarize the latest uploads in two bullets." },
  ]
}
