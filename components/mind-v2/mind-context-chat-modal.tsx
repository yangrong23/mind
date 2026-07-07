"use client"

import { AgentChat, type Agent } from "@/components/mind-v2/agent-tab"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"

export type MindContextChatModalProps = {
  open: boolean
  onClose: () => void
  /** Scope chip above chat — e.g. library or note title */
  scopeLabel?: string
  agent: Agent
  entryHint?: string
  requireAuthThen?: (run: () => void) => void
  knowledgeContext?: { kbName: string; contentTitle?: string }
  noteContext?: { noteTitle: string; notePreview?: string }
  initialPrompt?: string
  quickQuestions?: string[]
  /** `agent` = autonomous task delivery; `dialog` = multi-turn Q&A */
  composerMode?: "dialog" | "agent"
  hideFactoryRail?: boolean
  onNavigateToKnowledge?: (factoryKind?: FactoryModalKind) => void
}

/** Full-screen agent chat (ima-style) — not a floating bottom sheet. */
export function MindContextChatModal({
  open,
  onClose,
  agent,
  entryHint,
  requireAuthThen,
  knowledgeContext,
  noteContext,
  initialPrompt,
  quickQuestions,
  composerMode = "dialog",
  hideFactoryRail = false,
  onNavigateToKnowledge,
}: MindContextChatModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-white dark:bg-zinc-950">
      <AgentChat
        embedded
        showModalClose
        agent={agent}
        onBack={onClose}
        entryHint={entryHint}
        requireAuthThen={requireAuthThen}
        knowledgeContext={knowledgeContext}
        noteContext={noteContext}
        initialPrompt={initialPrompt}
        quickQuestions={quickQuestions}
        composerMode={composerMode}
        hideFactoryRail={hideFactoryRail}
        onNavigateToKnowledge={onNavigateToKnowledge}
      />
    </div>
  )
}
