import { MINDER_COPILOT_AGENT } from "@/components/mind-v2/agent-tab"
import type { Agent } from "@/components/mind-v2/agent-tab"
import type { LibraryChatLaunchContext } from "@/lib/library-chat-context"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import { resolveKbPublicSettings } from "@/lib/subscribed-kb-agent-presets"

export type KbAgentChatKnowledgeContext = {
  kbName: string
  contentTitle?: string
}

export function libraryChatContextFromKnowledgeBase(kb: KnowledgeBase): LibraryChatLaunchContext {
  const settings = resolveKbPublicSettings(kb)
  const recommendedQuestions = settings?.recommendedQuestions?.length
    ? settings.recommendedQuestions
    : undefined
  return {
    kbName: kb.name,
    publicAgent: recommendedQuestions ? { recommendedQuestions } : undefined,
  }
}

/** Public or private KB chat — always your Mindar agent, grounded on the library scope. */
export function resolveKbAgentChatLaunch(context: LibraryChatLaunchContext): {
  agent: Agent
  knowledgeContext: KbAgentChatKnowledgeContext
  entryHint?: string
  quickQuestions?: string[]
} {
  const quickQuestions = context.publicAgent?.recommendedQuestions?.length
    ? context.publicAgent.recommendedQuestions
    : undefined

  const scopeLine = context.contentTitle
    ? `「${context.contentTitle}」· ${context.kbName}`
    : context.kbName

  return {
    agent: MINDER_COPILOT_AGENT,
    knowledgeContext: {
      kbName: context.kbName,
      contentTitle: context.contentTitle,
    },
    entryHint: context.contentTitle
      ? `Ask about “${context.contentTitle}” — answers cite sources in this library.`
      : `Ask anything about this library — answers cite its sources.`,
    quickQuestions,
  }
}
