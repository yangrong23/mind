"use client"

import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import type { AgentExamplePrompt } from "@/lib/agent-chat-example-prompts"

const promptChipBase = cn(mx.promptChipSurface, mx.typePromptChip)

const stackBtnClass = cn(
  promptChipBase,
  "w-full rounded-2xl px-4 py-3 text-left"
)

const scrollBtnClass = cn(
  promptChipBase,
  mx.typePromptChipCompact,
  "shrink-0 rounded-full px-3.5 py-1.5 text-left"
)

/** Agent home — centered cloud of soft suggestion chips */
const wrapBtnClass = cn(
  promptChipBase,
  "rounded-full px-3.5 py-2 tracking-tight"
)

const noteStackBtnClass =
  "w-full rounded-xl px-3 py-2.5 text-left text-[15px] font-normal leading-snug text-emerald-600 transition-colors hover:bg-emerald-50/80 active:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"

export function AgentExamplePromptRail({
  prompts,
  onSelect,
  layout = "stack",
  tone = "default",
  className,
}: {
  prompts: AgentExamplePrompt[]
  onSelect: (prompt: string) => void
  /** `stack` — mobile vertical; `scroll` — horizontal chips; `wrap` — web multi-row cloud */
  layout?: "stack" | "scroll" | "wrap"
  /** Green text stack for note-grounded chat */
  tone?: "default" | "note"
  className?: string
}) {
  if (prompts.length === 0) return null

  if (layout === "wrap") {
    return (
      <div
        className={cn("flex flex-wrap justify-center gap-2", className)}
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
    <div className={cn("flex w-full flex-col", tone === "note" ? "gap-0.5" : "gap-2", className)} role="list" aria-label="Example questions">
      {prompts.map((item) => (
        <button
          key={item.id}
          type="button"
          role="listitem"
          onClick={() => onSelect(item.prompt)}
          className={tone === "note" ? noteStackBtnClass : stackBtnClass}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
