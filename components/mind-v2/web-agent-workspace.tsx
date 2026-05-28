"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { ChevronLeft, PanelRightClose, PanelRightOpen, Sparkles } from "lucide-react"
import { web } from "@/components/mind-v2/web-design"
import { AgentExamplePromptRail } from "@/components/mind-v2/agent-example-prompt-rail"
import { getAgentExamplePrompts } from "@/lib/agent-chat-example-prompts"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"
import { MessageCircle } from "lucide-react"
import { MindChatHeaderActions } from "@/components/mind-v2/mind-chat-header-actions"
import { WebThreadComposer } from "@/components/mind-v2/web-thread-composer"
import {
  MindChatQaHistoryPanel,
  seedDemoQaHistory,
  type MindQaHistoryItem,
} from "@/components/mind-v2/mind-chat-qa-history-panel"
import {
  ContentFactoryModals,
  type FactoryModalKind,
} from "@/components/mind-v2/content-factory-modals"
import {
  buildWebNotebookExchange,
  WebNotebookDialogueBlock,
  type WebNotebookMessage,
} from "@/components/mind-v2/web-notebook-dialogue"
import type { MessageFeedback } from "@/components/mind-v2/mind-chat-message-actions"
import { cn } from "@/lib/utils"
import { MINDAR_COPILOT_AGENT, type Agent } from "@/components/mind-v2/agent-tab"
import { MindKbAtMenu } from "@/components/mind-v2/mind-kb-at-menu"
import type { AgentChatScope } from "@/lib/web-agent-scope"
import { MOCK_KNOWLEDGE_BASES } from "@/lib/mock-knowledge-bases"
import { mockNotes } from "@/lib/mock-notes"
import { getKbAgentSuggestions } from "@/lib/kb-agent-suggestions"
import type { KbDetailPayload } from "@/components/mind-v2/use-web-app-router"
import {
  WebKbAiViewChatToggle,
  WebKbAiViewEntry,
  WebKbAiViewPanel,
  type WebKbCenterSurface,
} from "@/components/mind-v2/web-kb-ai-view"

const DEMO_SOURCES = [
  { title: "Product Strategy Doc", pages: "pp. 12–18" },
  { title: "Market Research Report", pages: "pp. 4–9" },
  { title: "Q4 OKR Draft", pages: "Full doc" },
]

const DEMO_SOURCE_COUNT = DEMO_SOURCES.length

export function WebAgentWorkspace({
  agent = MINDAR_COPILOT_AGENT,
  chatScope,
  kbContext,
  initialPrompt,
  onBack,
  requireAuthThen,
}: {
  agent?: Agent
  chatScope: AgentChatScope
  /** When scoped to a KB — used for suggestions & publisher skills (not a separate agent). */
  kbContext?: KbDetailPayload
  initialPrompt?: string
  onBack: () => void
  requireAuthThen?: (run: () => void) => void
}) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const scrollRef = useRef<HTMLDivElement>(null)
  const seededInitialRef = useRef(false)

  const [draft, setDraft] = useState("")
  const [messages, setMessages] = useState<WebNotebookMessage[]>([])
  const [feedbackById, setFeedbackById] = useState<Record<string, MessageFeedback>>({})
  const [qaHistoryOpen, setQaHistoryOpen] = useState(false)
  const [qaHistoryItems, setQaHistoryItems] = useState<MindQaHistoryItem[]>(() => seedDemoQaHistory())
  const [sourcesOpen, setSourcesOpen] = useState(chatScope.type === "kb")
  const [factoryModal, setFactoryModal] = useState<FactoryModalKind | null>(null)
  const [selectedFactory, setSelectedFactory] = useState<FactoryModalKind | null>(null)
  const [atMenuOpen, setAtMenuOpen] = useState(false)
  const [attachedKbIds, setAttachedKbIds] = useState<number[]>(() =>
    chatScope.type === "kb" ? [chatScope.kbId] : []
  )
  const [attachedNoteId, setAttachedNoteId] = useState<number | null>(() =>
    chatScope.type === "note" ? chatScope.noteId : null
  )
  const [kbCenterSurface, setKbCenterSurface] = useState<WebKbCenterSurface>("chat")

  const chatTitle =
    chatScope.type === "kb"
      ? chatScope.kbName
      : chatScope.type === "note"
        ? chatScope.noteTitle
        : "Chat"

  const kbThread =
    chatScope.type === "kb"
      ? {
          name: chatScope.kbName,
          sourceCount: kbContext?.contentCount ?? DEMO_SOURCE_COUNT,
          description: kbContext?.description,
        }
      : null

  const kbSuggestions =
    chatScope.type === "kb" || kbContext
      ? getKbAgentSuggestions({
          name: kbContext?.name ?? (chatScope.type === "kb" ? chatScope.kbName : ""),
          description: kbContext?.description,
          category: kbContext?.category,
          coverVariant: kbContext?.coverVariant,
          isPublicKb:
            kbContext?.isPublicKb ??
            (chatScope.type === "kb" ? Boolean(chatScope.isPublicKb) : undefined),
          exampleQuestions: kbContext?.publicSettings?.exampleQuestions,
        })
      : []
  const examplePrompts = kbSuggestions.length
    ? kbSuggestions.map((s) => ({ id: s.id, label: s.label, prompt: s.prompt }))
    : getAgentExamplePrompts(agent.id)

  const scopeLine =
    chatScope.type === "global"
      ? "Use @ to link a library or note"
      : chatScope.type === "kb"
        ? "Library thread · use @ to add more sources"
        : "Note thread · use @ to add more sources"

  const attachmentSummary = (() => {
    const parts: string[] = []
    if (attachedKbIds.length > 0) {
      const names = attachedKbIds
        .map((id) => MOCK_KNOWLEDGE_BASES.find((k) => k.id === id)?.name)
        .filter(Boolean) as string[]
      parts.push(names.length ? names.join(", ") : `${attachedKbIds.length} libraries`)
    }
    if (attachedNoteId != null) {
      const note = mockNotes.find((n) => n.id === attachedNoteId)
      if (note) parts.push(note.title)
    }
    return parts.length ? parts.join(" · ") : null
  })()

  const kbMenuItems = MOCK_KNOWLEDGE_BASES.slice(0, 12).map((kb) => ({ id: kb.id, name: kb.name }))
  const noteMenuItems = mockNotes.slice(0, 8).map((n) => ({ id: n.id, title: n.title }))

  function appendExchange(question: string) {
    const q = question.trim()
    if (!q) return
    setMessages((prev) => [...prev, ...buildWebNotebookExchange(q, DEMO_SOURCE_COUNT)])
    setQaHistoryItems((prev) => [{ id: `qa-${Date.now()}`, at: Date.now(), query: q }, ...prev])
    if (chatScope.type === "kb") setKbCenterSurface("chat")
  }

  function submit(promptOverride?: string) {
    runWithAuth(() => {
      const q = (promptOverride ?? draft).trim()
      if (!q) {
        toast.error("Add a message first")
        return
      }
      appendExchange(q)
      setDraft("")
    })
  }

  useEffect(() => {
    const q = initialPrompt?.trim()
    if (!q || seededInitialRef.current) return
    seededInitialRef.current = true
    appendExchange(q)
  }, [initialPrompt])

  useEffect(() => {
    if (chatScope.type === "kb") setKbCenterSurface("chat")
  }, [chatScope.type === "kb" ? chatScope.kbId : null])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || messages.length === 0) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages.length])

  function startNewChat() {
    runWithAuth(() => {
      setMessages([])
      setDraft("")
      setFeedbackById({})
      setKbCenterSurface("chat")
      setQaHistoryOpen(false)
      seededInitialRef.current = true
      toast.message("New chat", { description: "Started a fresh thread (demo)." })
    })
  }

  function regenerateReply(assistantId: string) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId
          ? {
              ...m,
              timeLabel: `Today · ${new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}`,
              content: `Regenerated answer grounded on ${DEMO_SOURCE_COUNT} sources (demo).`,
            }
          : m
      )
    )
    toast.message("Regenerated", { description: "Demo — refreshed model reply." })
  }

  function setFeedback(id: string, value: MessageFeedback) {
    setFeedbackById((prev) => ({
      ...prev,
      [id]: prev[id] === value ? null : value,
    }))
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent px-3 py-3">
      <div className="flex min-h-0 flex-1 gap-3">
        <section
          className={cn(
            web.surfaceCard,
            "relative flex min-w-0 flex-1 flex-col overflow-hidden"
          )}
        >
          <header className="flex shrink-0 items-center gap-2 border-b border-black/[0.04] px-3 py-2.5 sm:px-4">
            <button
              type="button"
              onClick={onBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-900/[0.05]"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            </button>
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mind/10 text-mind ring-1 ring-mind/15"
              aria-hidden
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1 px-1">
              <h1 className="truncate text-[15px] font-semibold tracking-tight text-zinc-800">
                {chatTitle}
              </h1>
              <p className="truncate text-[11px] font-medium text-zinc-500">{scopeLine}</p>
            </div>
            {!sourcesOpen ? (
              <button
                type="button"
                onClick={() => setSourcesOpen(true)}
                className="hidden shrink-0 items-center gap-1 rounded-full bg-white/60 px-2.5 py-1.5 text-[11px] font-medium text-zinc-600 ring-1 ring-black/[0.05] transition-colors hover:bg-white/80 sm:inline-flex"
              >
                <PanelRightOpen className="h-3.5 w-3.5" aria-hidden />
                Sources · {DEMO_SOURCE_COUNT}
              </button>
            ) : null}
            {kbThread ? (
              <WebKbAiViewChatToggle mode={kbCenterSurface} onChange={setKbCenterSurface} />
            ) : null}
            <MindChatHeaderActions
              size="compact"
              onNewChat={startNewChat}
              onOpenHistory={() => runWithAuth(() => setQaHistoryOpen(true))}
            />
          </header>

          {kbThread && kbCenterSurface === "chat" && messages.length > 0 ? (
            <WebKbAiViewEntry
              libraryName={kbThread.name}
              sourceCount={kbThread.sourceCount}
              onOpen={() => setKbCenterSurface("ai")}
            />
          ) : null}

          <div ref={scrollRef} className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
            {kbThread && kbCenterSurface === "ai" ? (
              <div className="mx-auto w-full max-w-3xl px-5 py-6">
                <WebKbAiViewPanel
                  libraryName={kbThread.name}
                  sourceCount={kbThread.sourceCount}
                  description={kbThread.description}
                  expanded
                  className="!px-0"
                />
              </div>
            ) : messages.length === 0 ? (
              <div className="mx-auto w-full max-w-3xl px-5 py-4">
                {kbThread && kbCenterSurface === "chat" ? (
                  <div className="space-y-4">
                    <WebKbAiViewPanel
                      libraryName={kbThread.name}
                      sourceCount={kbThread.sourceCount}
                      description={kbThread.description}
                      expanded
                      className="!px-0"
                    />
                    {examplePrompts.length > 0 ? (
                      <section className="border-t border-black/[0.04] pt-4">
                        <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                          <Sparkles className="h-3 w-3 text-mind" strokeWidth={2} aria-hidden />
                          Try asking
                        </p>
                        <AgentExamplePromptRail
                          layout="wrap"
                          prompts={examplePrompts}
                          onSelect={(prompt) => runWithAuth(() => submit(prompt))}
                          className="w-full"
                        />
                      </section>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex flex-col items-center px-0 py-10 sm:py-14">
                    <div className="mb-4 flex w-full max-w-[9rem] items-center justify-center px-2">
                      <MindarLogo height={32} priority className="w-full object-contain" />
                    </div>
                    <h2 className="text-center text-[20px] font-semibold tracking-tight text-zinc-800 sm:text-[22px]">
                      Start a conversation
                    </h2>
                    <p className="mt-2 max-w-md text-center text-[14px] leading-relaxed text-zinc-500">
                      Use @ to link a library or note, then ask anything.
                    </p>
                    {examplePrompts.length > 0 ? (
                      <AgentExamplePromptRail
                        layout="wrap"
                        prompts={examplePrompts}
                        onSelect={(prompt) => runWithAuth(() => submit(prompt))}
                        className="mt-8 w-full"
                      />
                    ) : null}
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-auto w-full max-w-3xl px-5 py-6">
                <WebNotebookDialogueBlock
                  variant="thread"
                  messages={messages}
                  sourceCount={DEMO_SOURCE_COUNT}
                  feedbackById={feedbackById}
                  onFeedback={setFeedback}
                  onSaveReply={(content) =>
                    toast.success("Saved", {
                      description: content.slice(0, 80) + (content.length > 80 ? "…" : ""),
                    })
                  }
                  onRegenerate={regenerateReply}
                  followUpPrompts={examplePrompts.slice(0, 3)}
                  onFollowUpSelect={(prompt) => runWithAuth(() => submit(prompt))}
                />
              </div>
            )}
          </div>

          <WebThreadComposer
            draft={draft}
            onDraftChange={setDraft}
            onSubmit={() => submit()}
            requireAuthThen={requireAuthThen}
            placeholder={
              kbThread && kbCenterSurface === "ai"
                ? `Ask about a topic in ${kbThread.name}…`
                : chatScope.type === "kb"
                  ? `Ask about ${chatScope.kbName}…`
                  : chatScope.type === "note"
                    ? `Ask about this note…`
                    : "Ask anything — @ to link sources…"
            }
            selectedFactory={selectedFactory}
            onFactorySelect={(kind) => {
              setSelectedFactory(kind)
              setFactoryModal(kind)
            }}
            attachmentSummary={attachmentSummary}
            atMenuOpen={atMenuOpen}
            onAtMenuOpenChange={setAtMenuOpen}
            atMenu={
              <MindKbAtMenu
                scopeShortcuts={[
                  {
                    id: "clear",
                    label: "No @ link (this turn)",
                    selected: attachedKbIds.length === 0 && attachedNoteId == null,
                    onSelect: () => {
                      setAttachedKbIds([])
                      setAttachedNoteId(null)
                      setAtMenuOpen(false)
                    },
                  },
                ]}
                items={kbMenuItems}
                isItemSelected={(kb) => attachedKbIds.includes(kb.id) && attachedNoteId == null}
                onSelect={(kb) => {
                  setAttachedKbIds([kb.id])
                  setAttachedNoteId(null)
                  setAtMenuOpen(false)
                  toast.message("Linked library", { description: `“${kb.name}” for this turn (demo).` })
                }}
                noteItems={noteMenuItems}
                isNoteSelected={(note) => attachedNoteId === note.id}
                onNoteSelect={(note) => {
                  setAttachedNoteId(note.id)
                  setAttachedKbIds([])
                  setAtMenuOpen(false)
                  toast.message("Linked note", { description: `“${note.title}” for this turn (demo).` })
                }}
              />
            }
            agentSuggestions={
              messages.length === 0 &&
              kbCenterSurface === "chat" &&
              !kbThread &&
              kbSuggestions.length > 0
                ? kbSuggestions.slice(0, 4)
                : undefined
            }
            onQuickQuestion={(prompt) => submit(prompt)}
            libraryName={chatScope.type === "kb" ? chatScope.kbName : kbContext?.name}
          />

          <MindChatQaHistoryPanel
            open={qaHistoryOpen}
            onClose={() => setQaHistoryOpen(false)}
            items={qaHistoryItems}
          />
        </section>

        {sourcesOpen ? (
          <aside
            className={cn(
              web.surfaceCardFlat,
              "flex w-[min(280px,30%)] min-w-[220px] shrink-0 flex-col overflow-hidden"
            )}
          >
            <div className="flex items-center justify-between border-b border-black/[0.04] px-3 py-2.5">
              <p className="text-[13px] font-semibold text-zinc-700">Sources</p>
              <button
                type="button"
                onClick={() => setSourcesOpen(false)}
                className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-900/[0.05]"
                aria-label="Hide sources"
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </div>
            <ul className="scrollbar-hide min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
              {DEMO_SOURCES.map((s) => (
                <li
                  key={s.title}
                  className="rounded-xl bg-white/50 px-3 py-2.5 ring-1 ring-black/[0.04] transition-colors hover:bg-white/70"
                >
                  <p className="text-[13px] font-medium text-zinc-700">{s.title}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">{s.pages}</p>
                </li>
              ))}
            </ul>
            {messages.length > 0 ? (
              <p className="shrink-0 border-t border-black/[0.04] px-3 py-2 text-[11px] text-zinc-400">
                Grounded on {DEMO_SOURCE_COUNT} sources in this thread
              </p>
            ) : null}
          </aside>
        ) : null}
      </div>

      <ContentFactoryModals
        open={factoryModal}
        onClose={() => setFactoryModal(null)}
        modalDensity="compact"
        onGenerateSubmit={(kind) => {
          setFactoryModal(null)
          toast.success("Queued", { description: `${kind} generation queued (demo).` })
        }}
      />
    </div>
  )
}
