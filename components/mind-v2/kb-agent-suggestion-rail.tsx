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
      <p className="flex items-center gap-1.5 px-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-zinc-500">
        <Sparkles className="h-3 w-3 shrink-0 text-mind" strokeWidth={2} aria-hidden />
        Quick questions
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.prompt)}
            className={cn(
              "max-w-full rounded-full border border-black/[0.07] bg-white/95 px-3 py-1.5 text-left text-[12px] font-medium leading-snug text-zinc-600",
              "shadow-[0_6px_20px_-8px_rgba(15,23,42,0.14)] backdrop-blur-sm",
              "transition-[background-color,box-shadow,transform] hover:border-zinc-200 hover:bg-white hover:shadow-[0_8px_24px_-6px_rgba(15,23,42,0.16)] hover:-translate-y-px",
              "dark:border-zinc-700/90 dark:bg-zinc-900/95 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
