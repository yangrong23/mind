/** Thread scope — one Mindar agent, conversations partitioned by KB or note (Emma-style). */

export type AgentChatScope =
  | { type: "global" }
  | { type: "kb"; kbId: number; kbName: string; isPublicKb?: boolean }
  | { type: "note"; noteId: number; noteTitle: string }

export function agentChatScopeKey(scope: AgentChatScope): string {
  switch (scope.type) {
    case "global":
      return "global"
    case "kb":
      return `kb:${scope.kbId}`
    case "note":
      return `note:${scope.noteId}`
  }
}

export function scopeLabel(scope: AgentChatScope): string {
  switch (scope.type) {
    case "global":
      return "General"
    case "kb":
      return scope.kbName
    case "note":
      return scope.noteTitle
  }
}
