/** In-memory chat threads — one Mindar agent, separate history per KB / note / home. */

export type StoredChatMessage = {
  id: string
  role: "user" | "ai"
  content: string
}

export type AgentThreadScope =
  | { type: "home"; sessionId?: string }
  | { type: "kb"; kbName: string; contentTitle?: string; contentDocId?: number }
  | { type: "note"; noteId: number; noteTitle?: string }

export type AgentThreadSummary = {
  threadKey: string
  scope: AgentThreadScope
  title: string
  preview: string
  updatedAt: number
  timeLabel: string
}

const threadStore = new Map<string, StoredChatMessage[]>()
const threadMetaStore = new Map<string, Omit<AgentThreadSummary, "threadKey">>()

const DEMO_NOW = Date.parse("2026-05-08T16:29:00")

function formatThreadTimeLabel(updatedAt: number): string {
  const diffMs = DEMO_NOW - updatedAt
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (diffDays <= 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(updatedAt).getDay()] ?? `${diffDays}d`
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(updatedAt))
}

function titleForScope(scope: AgentThreadScope): string {
  if (scope.type === "home") return "New chat"
  if (scope.type === "note") return scope.noteTitle?.trim() || "Note chat"
  if (scope.contentTitle) return scope.contentTitle
  return scope.kbName
}

export function newHomeSessionId(): string {
  return `s-${Date.now()}`
}

function previewFromMessages(messages: StoredChatMessage[]): string {
  const last = [...messages].reverse().find((m) => m.content.trim())
  if (!last) return "Start a conversation with Mindar"
  const text = last.content.replace(/\s+/g, " ").trim()
  return text.length > 72 ? `${text.slice(0, 72)}…` : text
}

function upsertThreadMeta(threadKey: string, scope: AgentThreadScope, messages: StoredChatMessage[]) {
  const existing = threadMetaStore.get(threadKey)
  const firstUser = messages.find((m) => m.role === "user" && m.content.trim())
  const title =
    scope.type === "home" && firstUser
      ? firstUser.content.trim().length > 40
        ? `${firstUser.content.trim().slice(0, 40)}…`
        : firstUser.content.trim()
      : titleForScope(scope)

  threadMetaStore.set(threadKey, {
    scope,
    title: existing?.title && scope.type !== "home" ? existing.title : title,
    preview: previewFromMessages(messages),
    updatedAt: Date.now(),
    timeLabel: formatThreadTimeLabel(Date.now()),
  })
}

function seedDemoThreads() {
  if (threadMetaStore.size > 0) return

  const demos: Array<{ scope: AgentThreadScope; title: string; preview: string; updatedAt: number; messages?: StoredChatMessage[] }> = [
    {
      scope: { type: "home", sessionId: "demo-build-agent" },
      title: "Build an agent",
      preview: "ima claw setup and thread routing…",
      updatedAt: DEMO_NOW,
      messages: [
        { id: "u-demo-1", role: "user", content: "How do I set up ima claw?" },
        { id: "a-demo-1", role: "ai", content: "Start from Mindar home — one agent, separate threads per library or note." },
      ],
    },
    {
      scope: { type: "kb", kbName: "Product Strategy" },
      title: "Product Strategy",
      preview: "Compare OKR drafts with market research…",
      updatedAt: DEMO_NOW - 2 * 60 * 60 * 1000,
    },
    {
      scope: { type: "note", noteId: 1, noteTitle: "Mind map draft" },
      title: "Mind map draft",
      preview: "Notes and reflections from yesterday's session",
      updatedAt: DEMO_NOW - 26 * 60 * 60 * 1000,
    },
    {
      scope: { type: "kb", kbName: "TCL Zhonghuan news", contentTitle: "Earnings recap" },
      title: "Earnings recap",
      preview: "Summarize the latest filing highlights",
      updatedAt: DEMO_NOW - 2 * 24 * 60 * 60 * 1000,
    },
    {
      scope: { type: "home", sessionId: "demo-whats-inside" },
      title: "What's inside?",
      preview: "Explain how @ linking works in chat",
      updatedAt: DEMO_NOW - 2 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000,
    },
  ]

  for (const demo of demos) {
    const threadKey = resolveAgentThreadKey(demo.scope)
    threadMetaStore.set(threadKey, {
      scope: demo.scope,
      title: demo.title,
      preview: demo.preview,
      updatedAt: demo.updatedAt,
      timeLabel: formatThreadTimeLabel(demo.updatedAt),
    })
    if (demo.messages?.length) {
      threadStore.set(threadKey, demo.messages)
    }
  }
}

export function resolveAgentThreadKey(scope: AgentThreadScope): string {
  if (scope.type === "home") {
    return scope.sessionId ? `mindar:home:${scope.sessionId}` : "mindar:home"
  }
  if (scope.type === "kb") {
    const item =
      scope.contentDocId != null
        ? `:doc:${scope.contentDocId}`
        : scope.contentTitle
          ? `:item:${scope.contentTitle}`
          : ""
    return `mindar:kb:${scope.kbName}${item}`
  }
  if (scope.type === "note") return `mindar:note:${scope.noteId}`
  return `mindar:home`
}

export function readThreadMessages(key: string): StoredChatMessage[] {
  return threadStore.get(key) ?? []
}

export function writeThreadMessages(key: string, messages: StoredChatMessage[], scope?: AgentThreadScope) {
  threadStore.set(key, messages)
  const resolvedScope = scope ?? threadMetaStore.get(key)?.scope ?? { type: "home" as const }
  upsertThreadMeta(key, resolvedScope, messages)
}

export function clearThreadMessages(key: string) {
  threadStore.delete(key)
  threadMetaStore.delete(key)
}

export function registerThreadScope(threadKey: string, scope: AgentThreadScope, title?: string) {
  const messages = readThreadMessages(threadKey)
  if (title) {
    threadMetaStore.set(threadKey, {
      scope,
      title,
      preview: previewFromMessages(messages),
      updatedAt: Date.now(),
      timeLabel: formatThreadTimeLabel(Date.now()),
    })
    return
  }
  upsertThreadMeta(threadKey, scope, messages)
}

export function listAgentThreadSummaries(): AgentThreadSummary[] {
  seedDemoThreads()
  return [...threadMetaStore.entries()]
    .map(([threadKey, meta]) => ({ threadKey, ...meta }))
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export function groupThreadSummariesByDate(threads: AgentThreadSummary[]): { label: string; threads: AgentThreadSummary[] }[] {
  const groups = new Map<string, AgentThreadSummary[]>()
  for (const thread of threads) {
    const label =
      thread.timeLabel === "Today"
        ? "Today"
        : thread.timeLabel === "Yesterday"
          ? "Yesterday"
          : "Earlier"
    const bucket = groups.get(label) ?? []
    bucket.push(thread)
    groups.set(label, bucket)
  }
  const order = ["Today", "Yesterday", "Earlier"]
  return order.filter((label) => groups.has(label)).map((label) => ({ label, threads: groups.get(label)! }))
}

/** Calendar-day buckets for sidebar history (ima-style date headers). */
export function groupThreadSummariesByCalendarDay(
  threads: AgentThreadSummary[]
): { label: string; threads: AgentThreadSummary[] }[] {
  const groups = new Map<string, { label: string; sortKey: number; threads: AgentThreadSummary[] }>()
  for (const thread of threads) {
    const d = new Date(thread.updatedAt)
    const sortKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const key = String(sortKey)
    const label = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d)
    const bucket = groups.get(key)
    if (bucket) bucket.threads.push(thread)
    else groups.set(key, { label, sortKey, threads: [thread] })
  }
  return [...groups.values()]
    .sort((a, b) => b.sortKey - a.sortKey)
    .map(({ label, threads: rows }) => ({ label, threads: rows }))
}

export function threadScopeHint(scope: AgentThreadScope): string | null {
  if (scope.type === "kb") {
    if (scope.contentTitle) return scope.contentTitle
    return scope.kbName
  }
  if (scope.type === "note") return scope.noteTitle?.trim() || "Memo"
  return null
}
