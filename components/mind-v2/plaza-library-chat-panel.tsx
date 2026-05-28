"use client"

import { MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { knowledgeBaseIconForTitle } from "@/components/mind-v2/knowledge-base-icon"
import { KbAgentSuggestionRail } from "@/components/mind-v2/kb-agent-suggestion-rail"
import type { KbAgentSuggestion } from "@/lib/kb-agent-suggestions"

/** Public library — chat entry only (no agent persona or intro). */
export function PlazaLibraryChatPanel({
  libraryName,
  libraryDescription,
  suggestions = [],
  onTryQuestion,
  onChat,
  chatDisabled,
  chatDisabledReason,
  compact,
  className,
}: {
  libraryName: string
  libraryDescription?: string
  suggestions?: KbAgentSuggestion[]
  onTryQuestion?: (prompt: string) => void
  onChat?: () => void
  chatDisabled?: boolean
  chatDisabledReason?: string
  compact?: boolean
  className?: string
}) {
  const LibIcon = knowledgeBaseIconForTitle(libraryName)

  return (
    <section
      className={cn(
        "rounded-2xl border border-stone-200/90 bg-white/90 p-4 dark:border-zinc-700 dark:bg-zinc-900/50",
        className
      )}
      aria-label="Chat with library"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl bg-mind/[0.08] text-mind ring-1 ring-mind/15",
            compact ? "h-9 w-9" : "h-11 w-11"
          )}
          aria-hidden
        >
          <LibIcon className={compact ? "h-4 w-4" : "h-5 w-5"} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h2
            className={cn(
              "font-semibold text-zinc-800 dark:text-zinc-100",
              compact ? "text-[15px]" : "text-[17px]"
            )}
          >
            {libraryName}
          </h2>
          {libraryDescription ? (
            <p
              className={cn(
                "mt-1 line-clamp-2 text-[13px] leading-relaxed text-zinc-500",
                compact && "line-clamp-1"
              )}
            >
              {libraryDescription}
            </p>
          ) : null}
        </div>
      </div>

      {suggestions.length > 0 && onTryQuestion ? (
        <KbAgentSuggestionRail
          suggestions={suggestions}
          libraryName={libraryName}
          onSelect={onTryQuestion}
          className={compact ? "mt-3" : "mt-4"}
        />
      ) : null}

      {onChat ? (
        <div className={cn("flex flex-wrap items-center gap-2", compact ? "mt-3" : "mt-4")}>
          <button
            type="button"
            onClick={onChat}
            disabled={chatDisabled}
            title={chatDisabled ? chatDisabledReason : "Chat about this library"}
            aria-label={chatDisabled ? chatDisabledReason : `Chat about ${libraryName}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors",
              chatDisabled
                ? "cursor-not-allowed bg-stone-100 text-zinc-400"
                : "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-sm hover:from-teal-700 hover:to-teal-600"
            )}
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
            Chat
          </button>
          {chatDisabled && chatDisabledReason ? (
            <span className="text-[12px] text-zinc-500">{chatDisabledReason}</span>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
