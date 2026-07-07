"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { LibraryCoverFromKb } from "@/components/mind-v2/library-cover"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"

export function AgentLinkedLibrariesSheet({
  open,
  assistantName,
  libraries,
  onClose,
  onAddMore,
  readOnly = false,
}: {
  open: boolean
  assistantName: string
  libraries: KnowledgeBase[]
  onClose: () => void
  onAddMore?: () => void
  readOnly?: boolean
}) {
  if (!open) return null

  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-end">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div className="relative max-h-[min(72vh,560px)] overflow-hidden rounded-t-[1.35rem] bg-white dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3.5 dark:border-zinc-800">
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold text-zinc-900 dark:text-zinc-100">Linked libraries</h2>
            <p className="mt-0.5 truncate text-[13px] text-zinc-500">{assistantName}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-zinc-800" aria-label="Close">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {libraries.length === 0 ? (
            <p className="py-8 text-center text-[14px] leading-relaxed text-zinc-500">
              No libraries linked yet. Answers will draw from whatever you @ in chat.
            </p>
          ) : (
            <ul className="space-y-2">
              {libraries.map((kb) => (
                <li
                  key={kb.id}
                  className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/80"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-stone-200/80 dark:ring-zinc-700">
                    <LibraryCoverFromKb kb={kb} showMiniUi={false} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">{kb.name}</p>
                    <p className="text-[12px] capitalize text-zinc-500">{kb.category}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!readOnly && onAddMore ? (
            <button
              type="button"
              onClick={onAddMore}
              className={cn(
                "mt-3 w-full rounded-xl border border-dashed border-stone-200 py-3 text-[14px] font-semibold text-mind",
                "hover:bg-mind/5 dark:border-zinc-700"
              )}
            >
              Add or change libraries
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
