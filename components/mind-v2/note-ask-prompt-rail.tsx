"use client"

import { cn } from "@/lib/utils"
import { NOTE_ASK_PROMPTS, type NoteAskPromptId, type NoteAskPromptItem } from "@/lib/note-ask-prompts"

export type { NoteAskPromptId, NoteAskPromptItem }
export { NOTE_ASK_PROMPTS }

export type NoteAskPromptRailProps = {
  activeId?: NoteAskPromptId | null
  onSelect: (item: NoteAskPromptItem) => void
  className?: string
  /** `scroll` — legacy pills; `grid` — 2×2 cards above the edit band */
  layout?: "scroll" | "grid"
}

export function NoteAskPromptRail({
  activeId,
  onSelect,
  className,
  layout = "grid",
}: NoteAskPromptRailProps) {
  if (layout === "scroll") {
    return (
      <div className={cn("relative", className)} role="toolbar" aria-label="Ask about this note">
        <div className="scrollbar-hide flex gap-1.5 overflow-x-auto px-3 pb-2 pt-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NOTE_ASK_PROMPTS.map((item) => {
            const selected = activeId === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                  selected
                    ? "border-mind/35 bg-mind/8 text-mind dark:border-mind/40 dark:bg-mind/15"
                    : "border-stone-200/90 bg-stone-50/90 text-zinc-600 hover:border-stone-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300"
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(className)} role="toolbar" aria-label="Ask about this note">
      <p className="mb-2 px-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Quick asks</p>
      <div className="grid grid-cols-2 gap-2">
        {NOTE_ASK_PROMPTS.map((item) => {
          const selected = activeId === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "flex min-h-[52px] flex-col items-start justify-center rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color,box-shadow]",
                selected
                  ? "border-mind/40 bg-mind/8 shadow-sm shadow-mind/10 dark:border-mind/35 dark:bg-mind/15"
                  : "border-stone-200/90 bg-stone-50/60 hover:border-stone-300/90 hover:bg-white hover:shadow-sm dark:border-zinc-700/90 dark:bg-zinc-900/60 dark:hover:border-zinc-600"
              )}
            >
              <span
                className={cn(
                  "text-[12px] font-semibold leading-snug",
                  selected ? "text-mind" : "text-zinc-800 dark:text-zinc-100"
                )}
              >
                {item.label}
              </span>
              <span className="mt-0.5 line-clamp-1 text-[10px] leading-snug text-zinc-500 dark:text-zinc-400">
                {item.hint}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
