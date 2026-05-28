"use client"

import { useState, type ReactNode } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { WebThreadComposer } from "@/components/mind-v2/web-thread-composer"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import type { KbAgentSuggestion } from "@/lib/kb-agent-suggestions"
import { AgentFollowUpPromptRail } from "@/components/mind-v2/agent-follow-up-prompt-rail"
import type { AgentExamplePrompt } from "@/lib/agent-chat-example-prompts"
import {
  MindChatMessageActions,
  type MessageFeedback,
} from "@/components/mind-v2/mind-chat-message-actions"

export type WebNotebookMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timeLabel: string
}

function formatTimeLabel() {
  const t = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  return `Today · ${t}`
}

function demoAssistantReply(sourceCount: number) {
  return `Grounded on ${sourceCount} ${sourceCount === 1 ? "source" : "sources"} — comparison across your library materials.`
}

export function buildWebNotebookExchange(
  question: string,
  sourceCount: number
): WebNotebookMessage[] {
  const stamp = formatTimeLabel()
  return [
    { id: `u-${Date.now()}`, role: "user", content: question, timeLabel: stamp },
    {
      id: `a-${Date.now() + 1}`,
      role: "assistant",
      content: demoAssistantReply(sourceCount),
      timeLabel: stamp,
    },
  ]
}

function WebNotebookAssistantBody({ sourceCount }: { sourceCount: number }) {
  return (
    <div className="text-[14px] leading-relaxed text-zinc-600">
      <p className="mb-3 font-semibold text-zinc-700">Comparison overview</p>
      <div className="mb-3 overflow-x-auto rounded-xl ring-1 ring-stone-200/80">
        <table className="w-full min-w-[280px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/80">
              <th className="px-3 py-2 font-semibold text-zinc-700">Dimension</th>
              <th className="px-3 py-2 font-semibold text-zinc-700">Base</th>
              <th className="px-3 py-2 font-semibold text-zinc-700">Core strengths</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            <tr>
              <td className="px-3 py-2 text-zinc-600">Platform</td>
              <td className="px-3 py-2">Unified knowledge graph</td>
              <td className="px-3 py-2">
                Connects notes, docs, and AI chat
                <sup className="ml-0.5 text-[10px] font-semibold text-teal-600">1</sup>
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-zinc-600">Audience</td>
              <td className="px-3 py-2">Teams & individuals</td>
              <td className="px-3 py-2">
                Research, product, and ops
                <sup className="ml-0.5 text-[10px] font-semibold text-teal-600">3</sup>
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-zinc-600">Delivery</td>
              <td className="px-3 py-2">Web + mobile capture</td>
              <td className="px-3 py-2">
                Same library, different surfaces
                <sup className="ml-0.5 text-[10px] font-semibold text-teal-600">5</sup>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Summary: Mindar keeps sources, dialogue, and Studio on one screen so you never lose context when
        generating deliverables. {demoAssistantReply(sourceCount)}
      </p>
    </div>
  )
}

export function WebNotebookDialogueBlock({
  messages,
  sourceCount,
  feedbackById,
  onFeedback,
  onSaveReply,
  onRegenerate,
  followUpPrompts,
  onFollowUpSelect,
  variant = "notebook",
  className,
}: {
  messages: WebNotebookMessage[]
  sourceCount: number
  feedbackById: Record<string, MessageFeedback>
  onFeedback: (id: string, value: MessageFeedback) => void
  onSaveReply?: (content: string) => void
  onRegenerate: (assistantId: string) => void
  /** Shown under the latest assistant reply only. */
  followUpPrompts?: AgentExamplePrompt[]
  onFollowUpSelect?: (prompt: string) => void
  /** Notebook embed uses a titled section; agent thread is borderless. */
  variant?: "notebook" | "thread"
  className?: string
}) {
  if (messages.length === 0) return null

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id

  return (
    <section
      className={cn(
        variant === "notebook" ? "mt-8 border-t border-stone-100 pt-6" : "space-y-0",
        className
      )}
    >
      {variant === "notebook" ? (
        <h3 className="text-[13px] font-semibold text-zinc-600">Dialogue</h3>
      ) : null}
      <div className={cn(variant === "notebook" ? "mt-4 space-y-5" : "space-y-5")}>
        {messages.map((msg) =>
          msg.role === "user" ? (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-zinc-700 px-4 py-2.5 text-[14px] leading-relaxed text-white">
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={msg.id} className="min-w-0">
              <WebNotebookAssistantBody sourceCount={sourceCount} />
              <MindChatMessageActions
                variant="library"
                feedback={feedbackById[msg.id] ?? null}
                onSaveToLibrary={
                  onSaveReply ? () => onSaveReply(msg.content) : undefined
                }
                onThumbsUp={() => onFeedback(msg.id, "up")}
                onThumbsDown={() => onFeedback(msg.id, "down")}
                onCopy={() => {
                  const text =
                    "Comparison overview — see table in notebook dialogue (demo).\n\n" + msg.content
                  void navigator.clipboard?.writeText(text).then(
                    () => toast.success("Copied"),
                    () => toast.message("Copy ready", { description: text.slice(0, 120) })
                  )
                }}
                onRegenerate={() => onRegenerate(msg.id)}
                onShare={() =>
                  toast.message("Share", { description: "Demo — share this answer as a link." })
                }
                className="mt-3 border-t-0 pt-0"
              />
              {msg.id === lastAssistantId &&
              followUpPrompts &&
              followUpPrompts.length > 0 &&
              onFollowUpSelect ? (
                <AgentFollowUpPromptRail
                  prompts={followUpPrompts}
                  onSelect={onFollowUpSelect}
                />
              ) : null}
              <p className="mt-3 text-center text-[11px] text-zinc-400">{msg.timeLabel}</p>
            </div>
          )
        )}
      </div>
    </section>
  )
}

export function WebNotebookDialogueComposer({
  draft,
  onDraftChange,
  onSubmit,
  sourceCount,
  voiceOn: _voiceOn,
  onVoiceToggle: _onVoiceToggle,
  requireAuthThen,
  agentSuggestions,
  onQuickQuestion,
  libraryName,
  onAddFiles,
  allowUpload = true,
  placeholder = "Ask or create content…",
  selectedFactory,
  onFactorySelect,
  showFactoryRail = true,
  factoryToolbar: _factoryToolbar,
  disclaimer,
  className,
}: {
  draft: string
  onDraftChange: (v: string) => void
  onSubmit: () => void
  sourceCount: number
  voiceOn: boolean
  onVoiceToggle: () => void
  requireAuthThen?: (run: () => void) => void
  agentSuggestions?: KbAgentSuggestion[]
  onQuickQuestion?: (prompt: string) => void
  libraryName?: string
  onAddFiles?: () => void
  allowUpload?: boolean
  placeholder?: string
  selectedFactory?: FactoryModalKind | null
  onFactorySelect?: (kind: FactoryModalKind) => void
  /** Hide inline factory icons when Studio column is available */
  showFactoryRail?: boolean
  /** @deprecated Factory rail is always inline via WebThreadComposer */
  factoryToolbar?: ReactNode
  disclaimer?: string
  className?: string
}) {
  return (
    <WebThreadComposer
      draft={draft}
      onDraftChange={onDraftChange}
      onSubmit={onSubmit}
      placeholder={placeholder}
      requireAuthThen={requireAuthThen}
      selectedFactory={selectedFactory}
      onFactorySelect={onFactorySelect}
      showFactoryRail={showFactoryRail && Boolean(onFactorySelect)}
      sourceCount={sourceCount}
      onAddFiles={onAddFiles}
      allowUpload={allowUpload}
      agentSuggestions={agentSuggestions}
      onQuickQuestion={onQuickQuestion}
      libraryName={libraryName}
      disclaimer={disclaimer}
      className={className}
    />
  )
}

/** Hook-friendly feedback toggle for library / notebook dialogue. */
export function useWebNotebookFeedback() {
  const [feedbackById, setFeedbackById] = useState<Record<string, MessageFeedback>>({})

  function setFeedback(id: string, value: MessageFeedback) {
    setFeedbackById((prev) => {
      const next = { ...prev }
      if (value === null) {
        delete next[id]
        return next
      }
      const toggled = prev[id] === value ? null : value
      if (toggled === null) delete next[id]
      else next[id] = toggled
      return next
    })
    if (value === "up") toast.success("Thanks", { description: "Marked as helpful." })
    if (value === "down") toast.message("Noted", { description: "We will improve replies (demo)." })
  }

  return { feedbackById, setFeedback }
}
