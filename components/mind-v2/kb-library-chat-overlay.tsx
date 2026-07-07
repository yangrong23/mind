"use client"

import { cn } from "@/lib/utils"
import { AgentChat } from "@/components/mind-v2/agent-tab"
import type { LibraryChatLaunchContext } from "@/lib/library-chat-context"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import { resolveKbAgentChatLaunch } from "@/lib/kb-agent-chat-launch"
import { resolveAgentThreadKey, type AgentThreadScope } from "@/lib/agent-chat-threads"

export function KbLibraryChatOverlay({
  open,
  context,
  onClose,
  requireAuthThen,
  onNavigateToKnowledge,
}: {
  open: boolean
  context: LibraryChatLaunchContext | null
  onClose: () => void
  requireAuthThen?: (run: () => void) => void
  onNavigateToKnowledge?: (factoryKind?: FactoryModalKind) => void
}) {
  if (!open || !context) return null

  const kbChat = resolveKbAgentChatLaunch(context)
  const threadScope: AgentThreadScope = {
    type: "kb",
    kbName: context.kbName,
    contentTitle: context.contentTitle,
    contentDocId: context.contentDocId,
  }
  const threadId = resolveAgentThreadKey(threadScope)

  return (
    <div
      className={cn(
        "absolute inset-0 z-[85] flex flex-col overflow-hidden bg-white",
        "animate-in slide-in-from-bottom duration-300 dark:bg-zinc-950"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Library chat"
    >
      <AgentChat
        embedded
        showModalClose
        requireAuthThen={requireAuthThen}
        agent={kbChat.agent}
        threadId={threadId}
        threadScope={threadScope}
        entryHint={kbChat.entryHint}
        knowledgeContext={kbChat.knowledgeContext}
        quickQuestions={kbChat.quickQuestions}
        initialPrompt={context.initialPrompt}
        onBack={onClose}
        onNavigateToKnowledge={onNavigateToKnowledge}
      />
    </div>
  )
}
