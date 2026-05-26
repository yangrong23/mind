"use client"

import { cn } from "@/lib/utils"
import type { AgentExamplePrompt } from "@/lib/agent-chat-example-prompts"

const stackBtnClass = cn(
  "w-full rounded-xl border border-stone-200/90 bg-white px-4 py-3 text-left text-[14px] font-medium leading-snug text-zinc-800",
  "transition-[background-color,border-color,box-shadow] active:scale-[0.99]",
  "hover:border-stone-300/90 hover:bg-stone-50/80 hover:shadow-sm",
  "dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/90"
)

const scrollBtnClass = cn(
  "shrink-0 rounded-full border border-stone-200/90 bg-stone-50/90 px-3 py-1.5 text-left text-[12px] font-medium leading-snug text-zinc-600",
  "transition-[background-color,border-color,box-shadow] hover:border-stone-300/90 hover:bg-white hover:shadow-sm",
  "dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:border-zinc-600"
)

/** Web agent empty state — wrapped rows, centered cloud of suggestions */
const wrapBtnClass = cn(
  "rounded-xl border border-stone-200/75 bg-stone-100/90 px-4 py-2.5 text-[14px] font-normal leading-snug text-zinc-800",
  "transition-[background-color,border-color,box-shadow] hover:border-stone-300/80 hover:bg-stone-200/70 hover:shadow-sm",
  "dark:border-zinc-700/80 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
)

export function AgentExamplePromptRail({
  prompts,
  onSelect,
  layout = "stack",
  className,
}: {
  prompts: AgentExamplePrompt[]
  onSelect: (prompt: string) => void
  /** `stack` — mobile vertical; `scroll` — horizontal chips; `wrap` — web multi-row cloud */
  layout?: "stack" | "scroll" | "wrap"
  className?: string
}) {
  if (prompts.length === 0) return null

  if (layout === "wrap") {
    return (
      <div
        className={cn("flex flex-wrap justify-center gap-2.5", className)}
        role="list"
        aria-label="Example questions"
      >
        {prompts.map((item) => (
          <button
            key={item.id}
            type="button"
            role="listitem"
            onClick={() => onSelect(item.prompt)}
            className={wrapBtnClass}
          >
            {item.label}
          </button>
        ))}
      </div>
    )
  }

  if (layout === "scroll") {
    return (
      <div
        className={cn(
          "scrollbar-hide flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className
        )}
        role="list"
        aria-label="Example questions"
      >
        {prompts.map((item) => (
          <button
            key={item.id}
            type="button"
            role="listitem"
            onClick={() => onSelect(item.prompt)}
            className={scrollBtnClass}
          >
            {item.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)} role="list" aria-label="Example questions">
      {prompts.map((item) => (
        <button
          key={item.id}
          type="button"
          role="listitem"
          onClick={() => onSelect(item.prompt)}
          className={stackBtnClass}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
