"use client"

import { cn } from "@/lib/utils"
import { NOTE_ASK_PROMPTS, type NoteAskPromptId, type NoteAskPromptItem } from "@/lib/note-ask-prompts"

export type { NoteAskPromptId, NoteAskPromptItem }
export { NOTE_ASK_PROMPTS }

export type NoteAskPromptRailProps = {
  activeId?: NoteAskPromptId | null
  onSelect: (item: NoteAskPromptItem) => void
  className?: string
}

export function NoteAskPromptRail({ activeId, onSelect, className }: NoteAskPromptRailProps) {
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
                  ? "border-zinc-300 bg-zinc-100 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  : "border-stone-200/90 bg-white text-zinc-600 hover:border-stone-300 hover:bg-stone-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600"
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
