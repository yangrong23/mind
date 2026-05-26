"use client"

import { Shield, Sparkles, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { KbAgentSuggestionRail } from "@/components/mind-v2/kb-agent-suggestion-rail"
import type { KbAgentSuggestion } from "@/lib/kb-agent-suggestions"
import {
  deriveWhatItCanDo,
  formatMaterialsSyncedNote,
  groundingModeLabel,
  publicAgentDisplayName,
  publicAgentTagline,
  type PublicKbSettings,
} from "@/lib/public-kb-settings"

export function PlazaLibraryAssistantPanel({
  libraryName,
  publisherName,
  publicSettings,
  suggestions,
  onTryQuestion,
  onChat,
  chatDisabled,
  chatDisabledReason,
  compact,
  className,
}: {
  libraryName: string
  publisherName?: string
  publicSettings?: PublicKbSettings | null
  suggestions: KbAgentSuggestion[]
  onTryQuestion?: (prompt: string) => void
  onChat?: () => void
  chatDisabled?: boolean
  chatDisabledReason?: string
  compact?: boolean
  className?: string
}) {
  if (!publicSettings?.isPublic && !publicSettings?.boundAgentId) return null

  const displayName = publicAgentDisplayName(publicSettings)
  const tagline = publicAgentTagline(publicSettings, libraryName)
  const capabilities = publicSettings?.capabilities?.filter(Boolean) ?? []
  const whatItCanDo = deriveWhatItCanDo(publicSettings?.skills ?? [])
  const syncNote = formatMaterialsSyncedNote(publicSettings?.lastSyncedAt)
  const grounding = publicSettings?.groundingMode
    ? groundingModeLabel(publicSettings.groundingMode)
    : null

  return (
    <section
      className={cn(
        "rounded-2xl border border-stone-200/90 bg-gradient-to-br from-white to-stone-50/80 p-4 dark:border-zinc-700 dark:from-zinc-950 dark:to-zinc-900/50",
        className
      )}
      aria-label="Library assistant"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/90 to-sky-500/80 text-white shadow-sm shadow-sky-200/40",
            compact ? "h-9 w-9 text-[14px]" : "h-11 w-11 text-[18px]"
          )}
          aria-hidden
        >
          ✦
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Library assistant</p>
          <h2
            className={cn(
              "font-semibold text-zinc-800 dark:text-zinc-100",
              compact ? "text-[15px]" : "text-[17px]"
            )}
          >
            {displayName}
          </h2>
          {publisherName ? (
            <p className="mt-0.5 text-[12px] text-zinc-500">Curated by {publisherName}</p>
          ) : null}
        </div>
      </div>

      {tagline ? (
        <p
          className={cn(
            "text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400",
            compact ? "mt-2" : "mt-3"
          )}
        >
          {tagline}
        </p>
      ) : null}

      {capabilities.length > 0 ? (
        <div className={cn("flex flex-wrap gap-1.5", compact ? "mt-2.5" : "mt-3")}>
          {capabilities.map((cap) => (
            <span
              key={cap}
              className="rounded-full bg-teal-50/90 px-2.5 py-0.5 text-[11px] font-medium text-teal-800 ring-1 ring-teal-100 dark:bg-teal-950/40 dark:text-teal-200 dark:ring-teal-900/50"
            >
              {cap}
            </span>
          ))}
        </div>
      ) : null}

      {whatItCanDo.length > 0 && !compact ? (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">What it can do</p>
          <ul className="mt-1.5 space-y-1">
            {whatItCanDo.map((line) => (
              <li key={line} className="flex gap-2 text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-500" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {suggestions.length > 0 && onTryQuestion ? (
        <KbAgentSuggestionRail
          suggestions={suggestions}
          libraryName={displayName}
          onSelect={onTryQuestion}
          className={compact ? "mt-3" : "mt-4"}
        />
      ) : null}

      {!compact && (grounding || publicSettings?.disclaimer) ? (
        <div className="mt-4 rounded-xl border border-stone-100 bg-white/80 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/80">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            <Shield className="h-3 w-3 text-teal-600" aria-hidden />
            Trust & scope
          </p>
          {grounding ? <p className="mt-1 text-[12px] text-zinc-600 dark:text-zinc-400">{grounding}</p> : null}
          {publicSettings?.disclaimer ? (
            <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">{publicSettings.disclaimer}</p>
          ) : null}
        </div>
      ) : null}

      {syncNote ? (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-teal-700/80 dark:text-teal-400/90">
          <RefreshCw className="h-3 w-3" aria-hidden />
          {syncNote}
        </p>
      ) : null}

      {onChat ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onChat}
            disabled={chatDisabled}
            title={chatDisabled ? chatDisabledReason : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors",
              chatDisabled
                ? "cursor-not-allowed bg-stone-100 text-zinc-400"
                : "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-sm hover:from-teal-700 hover:to-teal-600"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Chat with {displayName}
          </button>
          {chatDisabled && chatDisabledReason ? (
            <span className="text-[12px] text-zinc-500">{chatDisabledReason}</span>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
