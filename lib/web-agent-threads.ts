import { agentChatScopeKey, type AgentChatScope } from "@/lib/web-agent-scope"

export type WebAgentThread = {
  id: string
  scopeKey: string
  title: string
  timeLabel: string
}

/** Demo threads — each scope keeps its own history (no cross-scope mixing). */
export const WEB_AGENT_DEMO_THREADS: WebAgentThread[] = [
  { id: "g1", scopeKey: "global", title: "Summarize my knowledge base", timeLabel: "Today" },
  { id: "g2", scopeKey: "global", title: "NotebookLM vs Mindar workflow", timeLabel: "Yesterday" },
  { id: "kb-3-1", scopeKey: "kb:3", title: "Key themes in subscribed library", timeLabel: "Today" },
  { id: "kb-5-1", scopeKey: "kb:5", title: "Compare sources for roadmap", timeLabel: "Mon" },
  { id: "note-1", scopeKey: "note:1", title: "Turn meeting notes into actions", timeLabel: "Yesterday" },
]

export function threadsForScope(scope: AgentChatScope): WebAgentThread[] {
  const key = agentChatScopeKey(scope)
  return WEB_AGENT_DEMO_THREADS.filter((t) => t.scopeKey === key)
}

export function threadsForScopeKey(scopeKey: string): WebAgentThread[] {
  return WEB_AGENT_DEMO_THREADS.filter((t) => t.scopeKey === scopeKey)
}

/** Most recent global Mindar thread — used when opening Agent from the shell. */
export function latestGlobalAgentThread(): WebAgentThread | undefined {
  return WEB_AGENT_DEMO_THREADS.find((t) => t.scopeKey === "global")
}
