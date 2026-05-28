"use client"

import type { ReactNode } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { MindChatComposer } from "@/components/mind-v2/mind-chat-composer"
import { AgentHomeComposerStack } from "@/components/mind-v2/agent-home-composer-stack"
import { KbAgentSuggestionRail } from "@/components/mind-v2/kb-agent-suggestion-rail"
import {
  MindChatFactoryRail,
  resolveFactoryRailSelection,
} from "@/components/mind-v2/mind-chat-factory-rail"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import type { KbAgentSuggestion } from "@/lib/kb-agent-suggestions"

/** Shared in-thread composer — Agent workspace + library notebook chat column. */
export function WebThreadComposer({
  draft,
  onDraftChange,
  onSubmit,
  placeholder = "Ask or create content…",
  requireAuthThen,
  selectedFactory,
  onFactorySelect,
  showFactoryRail = true,
  sourceCount,
  onAddFiles,
  allowUpload = true,
  atTitle = "Libraries & sources",
  onAtClick,
  atMenu,
  atMenuOpen,
  onAtMenuOpenChange,
  agentSuggestions,
  onQuickQuestion,
  libraryName,
  disclaimer,
  attachmentSummary,
  className,
}: {
  draft: string
  onDraftChange: (v: string) => void
  onSubmit: () => void
  placeholder?: string
  requireAuthThen?: (run: () => void) => void
  selectedFactory?: FactoryModalKind | null
  onFactorySelect?: (kind: FactoryModalKind) => void
  showFactoryRail?: boolean
  sourceCount?: number
  onAddFiles?: () => void
  allowUpload?: boolean
  atTitle?: string
  onAtClick?: () => void
  atMenu?: ReactNode
  atMenuOpen?: boolean
  onAtMenuOpenChange?: (open: boolean) => void
  agentSuggestions?: KbAgentSuggestion[]
  /** When set, quick-question chips submit immediately instead of only filling the draft. */
  onQuickQuestion?: (prompt: string) => void
  attachmentSummary?: string | null
  libraryName?: string
  disclaimer?: string
  className?: string
}) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const resolvedAtTitle =
    attachmentSummary ??
    (sourceCount != null ? `${sourceCount} source${sourceCount === 1 ? "" : "s"}` : atTitle)

  const defaultAtClick = () =>
    toast.message("Mention", {
      description:
        sourceCount != null
          ? `${sourceCount} selected for this turn (demo).`
          : "Pick a library or source to ground this turn (demo).",
    })

  return (
    <div className={cn("shrink-0 px-4 pb-4 pt-2", className)}>
      {disclaimer ? (
        <p className="mx-auto mb-2.5 max-w-2xl text-center text-[11px] leading-relaxed text-zinc-400">
          {disclaimer}
        </p>
      ) : null}
      <div className="relative mx-auto w-full max-w-2xl">
        {agentSuggestions && agentSuggestions.length > 0 ? (
          <KbAgentSuggestionRail
            suggestions={agentSuggestions.slice(0, 4)}
            libraryName={libraryName}
            onSelect={(prompt) => {
              if (onQuickQuestion) {
                runWithAuth(() => onQuickQuestion(prompt))
              } else {
                onDraftChange(prompt)
              }
            }}
            className="relative z-[1] mb-2.5"
          />
        ) : null}
        <AgentHomeComposerStack
          factoryPlacement="inside"
          showFactoryRail={showFactoryRail && Boolean(onFactorySelect)}
          selectedFactoryId={selectedFactory ?? null}
          onFactorySelect={(kind) => runWithAuth(() => onFactorySelect?.(kind))}
          composer={
            <MindChatComposer
              variant="thread"
              className="max-w-none"
              uploadIconStyle="kb-file"
              value={draft}
              onChange={onDraftChange}
              onSubmit={onSubmit}
              placeholder={placeholder}
              showVoiceButton={false}
              showScreenshotButton
              showUploadButton={allowUpload}
              atTitle={resolvedAtTitle}
              atMenu={atMenu}
              atMenuOpen={atMenuOpen}
              onAtMenuOpenChange={onAtMenuOpenChange}
              onAtClick={() => runWithAuth(onAtClick ?? defaultAtClick)}
              onScreenshotClick={() =>
                runWithAuth(() =>
                  toast.message("Screenshot", {
                    description: "Capture a region and attach to the chat (demo).",
                  })
                )
              }
              onUploadClick={() =>
                runWithAuth(() => {
                  if (onAddFiles) onAddFiles()
                  else toast.message("Upload file", { description: "Demo — pick a file from your device." })
                })
              }
              factoryToolbar={
                showFactoryRail && onFactorySelect ? (
                  <MindChatFactoryRail
                    railStyle="inline"
                    density="compact"
                    selectedId={selectedFactory ?? null}
                    onSelect={(id) =>
                      runWithAuth(() => {
                        const kind = resolveFactoryRailSelection(id)
                        onFactorySelect(kind)
                      })
                    }
                  />
                ) : undefined
              }
            />
          }
        />
      </div>
    </div>
  )
}
