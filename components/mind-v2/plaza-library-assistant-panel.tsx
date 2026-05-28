"use client"

import { PlazaLibraryChatPanel } from "@/components/mind-v2/plaza-library-chat-panel"
import type { KbAgentSuggestion } from "@/lib/kb-agent-suggestions"
import type { PublicKbSettings } from "@/lib/public-kb-settings"
import { getKbAgentSuggestions } from "@/lib/kb-agent-suggestions"

/** @deprecated Name kept for imports — renders library chat entry only (no agent intro). */
export function PlazaLibraryAssistantPanel({
  libraryName,
  publicSettings,
  suggestions: suggestionsProp,
  onTryQuestion,
  onChat,
  chatDisabled,
  chatDisabledReason,
  compact,
  className,
  publisherName: _publisherName,
}: {
  libraryName: string
  publisherName?: string
  publicSettings?: PublicKbSettings | null
  suggestions?: KbAgentSuggestion[]
  onTryQuestion?: (prompt: string) => void
  onChat?: () => void
  chatDisabled?: boolean
  chatDisabledReason?: string
  compact?: boolean
  className?: string
}) {
  if (!publicSettings?.isPublic) return null

  const suggestions =
    suggestionsProp ??
    getKbAgentSuggestions({
      name: libraryName,
      isPublicKb: true,
      exampleQuestions: publicSettings.exampleQuestions,
    })

  return (
    <PlazaLibraryChatPanel
      libraryName={libraryName}
      libraryDescription={publicSettings.tagline || publicSettings.topicScope || undefined}
      suggestions={suggestions}
      onTryQuestion={onTryQuestion}
      onChat={onChat}
      chatDisabled={chatDisabled}
      chatDisabledReason={chatDisabledReason}
      compact={compact}
      className={className}
    />
  )
}
