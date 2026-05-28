"use client"

import { cn } from "@/lib/utils"
import type { AgentExamplePrompt } from "@/lib/agent-chat-example-prompts"

const followUpBtnClass = cn(
  "max-w-full rounded-xl border border-stone-200/85 bg-stone-100/95 px-3.5 py-2.5 text-left text-[13px] font-normal leading-snug text-zinc-700",
  "transition-[background-color,border-color] hover:border-stone-300/90 hover:bg-stone-200/55",
  "dark:border-zinc-700/80 dark:bg-zinc-800/75 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
)

/** Stacked suggested questions after an assistant reply (NotebookLM-style). */
export function AgentFollowUpPromptRail({
  prompts,
  onSelect,
  className,
  max = 3,
}: {
  prompts: AgentExamplePrompt[]
  onSelect: (prompt: string) => void
  className?: string
  max?: number
}) {
  const items = prompts.slice(0, max)
  if (items.length === 0) return null

  return (
    <div
      className={cn("mt-3 flex flex-col items-start gap-2", className)}
      role="list"
      aria-label="Suggested follow-up questions"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="listitem"
          onClick={() => onSelect(item.prompt)}
          className={followUpBtnClass}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
