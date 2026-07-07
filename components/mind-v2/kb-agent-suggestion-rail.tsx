"use client"

import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { KbAgentSuggestion } from "@/lib/kb-agent-suggestions"

export function KbAgentSuggestionRail({
  suggestions,
  libraryName,
  onSelect,
  className,
}: {
  suggestions: KbAgentSuggestion[]
  libraryName?: string
  onSelect: (prompt: string) => void
  className?: string
}) {
  if (suggestions.length === 0) return null

  return (
    <div className={cn("space-y-2", className)}>
      <p className="flex items-center gap-1.5 px-0.5 text-[11px] font-medium text-zinc-500">
        <Sparkles className="h-3 w-3 shrink-0 text-mind" strokeWidth={2} aria-hidden />
        {libraryName ? `Suggested for “${libraryName}”` : "Suggested prompts"}
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.prompt)}
            className={cn(
              "max-w-full rounded-full border border-stone-200/90 bg-stone-50/90 px-3 py-1.5 text-left text-[12px] font-medium leading-snug text-zinc-600",
              "transition-[background-color,box-shadow] hover:border-stone-300/90 hover:bg-white hover:shadow-sm",
              "dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-800"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
