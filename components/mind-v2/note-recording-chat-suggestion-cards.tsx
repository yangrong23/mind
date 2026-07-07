"use client"

import { cn } from "@/lib/utils"
import type { RecordingNoteChatSuggestion } from "@/lib/recording-note-chat-suggestions"

export function NoteRecordingChatSuggestionCards({
  suggestions,
  onSelect,
  className,
}: {
  suggestions: RecordingNoteChatSuggestion[]
  onSelect: (prompt: string) => void
  className?: string
}) {
  if (suggestions.length === 0) return null

  return (
    <div className={cn("flex w-full flex-col gap-2.5", className)} role="list" aria-label="Suggested questions">
      {suggestions.map((item) => (
        <button
          key={item.id}
          type="button"
          role="listitem"
          onClick={() => onSelect(item.prompt)}
          className={cn(
            "w-full rounded-xl border border-stone-200/95 bg-white px-4 py-3.5 text-left",
            "text-[15px] font-normal leading-snug text-zinc-800",
            "transition-colors hover:border-stone-300 hover:bg-stone-50/80 active:bg-stone-100/90",
            "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600"
          )}
        >
          {item.text}
        </button>
      ))}
    </div>
  )
}
