"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { ChevronLeft, MessageSquare, Sparkles, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { AgentContactAvatar } from "@/components/mind-v2/agent-tab"
import { HubItemThumb } from "@/components/mind-v2/mind-media-art"
import { hubItemKindFromLabel } from "@/lib/product-media"
import { bodyForLibraryDocument } from "@/lib/library-document-body"
import { getKbAgentSuggestions } from "@/lib/kb-agent-suggestions"
import {
  agentFromPublicKbSettings,
  libraryAssistantChatMeta,
} from "@/lib/plaza-agent-runtime"
import { publicAgentDisplayName } from "@/lib/public-kb-settings"
import { WebThreadComposer } from "@/components/mind-v2/web-thread-composer"
import {
  buildWebNotebookExchange,
  useWebNotebookFeedback,
  WebNotebookDialogueBlock,
  type WebNotebookMessage,
} from "@/components/mind-v2/web-notebook-dialogue"
import {
  ContentFactoryModals,
  type FactoryModalKind,
} from "@/components/mind-v2/content-factory-modals"
import { MindChatHeaderActions } from "@/components/mind-v2/mind-chat-header-actions"
import type { KBCategory, TeamLibrarySettings } from "@/lib/mock-knowledge-bases"
import type { LibraryCoverVariant } from "@/lib/product-media"
import type { PublicKbSettings } from "@/lib/public-kb-settings"
import type { KbLibraryDocument } from "@/components/mind-v2/knowledge-detail"
import { MindSaveToLibrarySheet } from "@/components/mind-v2/mind-save-to-library-sheet"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"

export type KbReaderKbPayload = {
  id?: number
  name: string
  description?: string
  coverVariant?: LibraryCoverVariant
  isPublicKb?: boolean
  category?: KBCategory
  publicSettings?: PublicKbSettings
  teamSettings?: TeamLibrarySettings
}

const ARTICLE_QUICK_ACTIONS = [
  { id: "sum", label: "Summarize", prompt: "Summarize this article in five bullets with citations." },
  { id: "map", label: "Mind map", prompt: "Generate a mind map outline for this article." },
  { id: "quiz", label: "Quiz", prompt: "Create a short quiz to test understanding of this article." },
  { id: "pod", label: "Podcast", prompt: "Draft a two-host podcast script from this article." },
] as const

export function WebKbDocumentReaderPage({
  kb,
  document,
  onBack,
  onOpenLibrary,
  onOpenAgentChat,
  requireAuthThen,
}: {
  kb: KbReaderKbPayload
  document: KbLibraryDocument
  onBack: () => void
  /** Jump back to the library notebook (three-column workspace). */
  onOpenLibrary?: () => void
  /** Open full Mindar agent chat scoped to this library. */
  onOpenAgentChat?: () => void
  requireAuthThen?: (run: () => void) => void
}) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const scrollRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState("")
  const [messages, setMessages] = useState<WebNotebookMessage[]>([])
  const [factoryModal, setFactoryModal] = useState<FactoryModalKind | null>(null)
  const [selectedFactory, setSelectedFactory] = useState<FactoryModalKind | null>(null)
  const [chatExpanded, setChatExpanded] = useState(true)
  const [saveSheetOpen, setSaveSheetOpen] = useState(false)
  const composerRef = useRef<HTMLDivElement>(null)
  const { feedbackById, setFeedback } = useWebNotebookFeedback()

  const agent = agentFromPublicKbSettings(kb.publicSettings, kb.name)
  const assistant = libraryAssistantChatMeta(kb.publicSettings, kb.name)
  const agentLabel = kb.publicSettings
    ? publicAgentDisplayName(kb.publicSettings)
    : `${kb.name} assistant`

  const suggestions = getKbAgentSuggestions({
    name: kb.name,
    description: kb.description,
    category: kb.category,
    coverVariant: kb.coverVariant,
    isPublicKb: kb.isPublicKb,
    exampleQuestions: kb.publicSettings?.exampleQuestions,
  })

  const body = bodyForLibraryDocument(document.id, document.title, document.excerpt)

  function appendExchange(question: string) {
    const q = question.trim()
    if (!q) return
    setMessages((prev) => [...prev, ...buildWebNotebookExchange(q, 1)])
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

  function focusArticleChat() {
    setChatExpanded(true)
    requestAnimationFrame(() => {
      composerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    })
  }

  function openAgentEntry() {
    if (onOpenAgentChat) {
      runWithAuth(onOpenAgentChat)
      return
    }
    runWithAuth(focusArticleChat)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el || messages.length === 0) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages.length])

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-transparent px-3 py-3">
      <header
        className={cn(
          web.surfaceCard,
          "mb-3 flex shrink-0 items-center gap-2 px-3 py-2.5 sm:px-4"
        )}
      >
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-900/[0.05]"
          aria-label="Back to library"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium text-zinc-500">
            {onOpenLibrary ? (
              <button
                type="button"
                onClick={onOpenLibrary}
                className="hover:text-mind hover:underline"
              >
                {kb.name}
              </button>
            ) : (
              kb.name
            )}
          </p>
          <h1 className="truncate text-[15px] font-semibold text-zinc-800">{document.title}</h1>
        </div>
        <button
          type="button"
          onClick={() => setChatExpanded((v) => !v)}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors lg:hidden",
            chatExpanded
              ? "bg-zinc-900/[0.06] text-zinc-700"
              : "bg-mind/10 text-mind ring-1 ring-mind/20"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          {chatExpanded ? "Article" : "Chat"}
        </button>
      </header>

      <div className="flex min-h-0 flex-1 gap-3">
        <article
          className={cn(
            web.surfaceCard,
            "relative flex min-w-0 flex-1 flex-col overflow-hidden",
            !chatExpanded && "hidden lg:flex"
          )}
        >
          <div className="flex shrink-0 items-center justify-end gap-0.5 border-b border-black/[0.04] px-3 py-2 sm:px-4">
            <button
              type="button"
              onClick={() => runWithAuth(() => setSaveSheetOpen(true))}
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-900/[0.05] hover:text-amber-600"
              aria-label="Add to library"
              title="Add to library"
            >
              <Star className="h-[18px] w-[18px]" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={openAgentEntry}
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-mind/10 hover:text-mind"
              aria-label="Chat with Mindar"
              title="Chat with Mindar"
            >
              <Sparkles className="h-[18px] w-[18px]" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => {
                setChatExpanded(true)
                focusArticleChat()
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold text-mind transition-colors hover:bg-mind/10 lg:hidden"
            >
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Chat
            </button>
          </div>
          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-10">
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 flex h-40 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-stone-50 to-white ring-1 ring-black/[0.04]">
                <HubItemThumb
                  kind={hubItemKindFromLabel(document.source, document.title)}
                  size="lg"
                  className="h-20 w-20"
                />
              </div>
              <h2 className="text-[28px] font-semibold tracking-tight text-zinc-800">{document.title}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-zinc-500">
                <span className="font-medium text-zinc-600">{document.source}</span>
                <span aria-hidden>·</span>
                <span>{document.author}</span>
                <span aria-hidden>·</span>
                <span>{document.date}</span>
              </div>
              <div className="mt-8 space-y-5 text-[16px] leading-[1.75] text-zinc-700">
                {body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </div>
        </article>

        <aside
          className={cn(
            web.surfaceCard,
            "flex w-full min-w-0 flex-col overflow-hidden lg:w-[min(420px,38%)] lg:max-w-[480px] lg:shrink-0",
            chatExpanded ? "flex" : "hidden lg:flex"
          )}
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-black/[0.04] px-3 py-2.5">
            <AgentContactAvatar agent={agent} size={40} className="rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-zinc-800">{agentLabel}</p>
              <p className="truncate text-[11px] text-zinc-500">
                Grounded on this article · {kb.name}
              </p>
            </div>
            <MindChatHeaderActions
              size="compact"
              newChatAccent={false}
              onNewChat={() => {
                setMessages([])
                setDraft("")
                toast.message("New chat", { description: "Cleared thread for this article (demo)." })
              }}
              onOpenHistory={() =>
                toast.message("History", { description: "Article-scoped Q&A history (demo)." })
              }
            />
          </div>

          {assistant.syncNote ? (
            <p className="shrink-0 border-b border-black/[0.04] bg-zinc-900/[0.02] px-4 py-2 text-[12px] leading-snug text-zinc-600">
              {assistant.syncNote}
            </p>
          ) : null}

          <div ref={scrollRef} className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <p className="max-w-[280px] text-[13px] leading-relaxed text-zinc-500">
                  Ask {agentLabel} about &ldquo;{document.title}&rdquo; — answers cite this file and your
                  library sources.
                </p>
                {suggestions.length > 0 ? (
                  <ul className="mt-5 w-full max-w-sm space-y-2 text-left">
                    {suggestions.slice(0, 3).map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => runWithAuth(() => submit(s.prompt))}
                          className="w-full rounded-xl border border-black/[0.06] bg-white/80 px-3.5 py-2.5 text-[13px] leading-snug text-zinc-700 transition-colors hover:border-mind/25 hover:bg-mind/5"
                        >
                          {s.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <WebNotebookDialogueBlock
                variant="thread"
                messages={messages}
                sourceCount={1}
                feedbackById={feedbackById}
                onFeedback={setFeedback}
                onRegenerate={(id) => {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === id
                        ? {
                            ...m,
                            content: `Regenerated answer about “${document.title}” (demo).`,
                          }
                        : m
                    )
                  )
                }}
                followUpPrompts={suggestions.slice(0, 3).map((s) => ({
                  id: s.id,
                  label: s.label,
                  prompt: s.prompt,
                }))}
                onFollowUpSelect={(prompt) => runWithAuth(() => submit(prompt))}
              />
            )}
          </div>

          {messages.length === 0 ? (
            <div className="flex shrink-0 flex-wrap gap-2 px-3 pb-2 pt-1">
              {ARTICLE_QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => runWithAuth(() => submit(action.prompt))}
                  className="rounded-full border border-black/[0.07] bg-white/95 px-3 py-1.5 text-[12px] font-medium text-zinc-700 shadow-[0_6px_20px_-8px_rgba(15,23,42,0.14)] backdrop-blur-sm transition-[box-shadow,transform] hover:border-mind/25 hover:bg-white hover:text-mind hover:shadow-[0_8px_24px_-6px_rgba(15,23,42,0.16)] hover:-translate-y-px"
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}

          <div ref={composerRef}>
            <WebThreadComposer
            draft={draft}
            onDraftChange={setDraft}
            onSubmit={() => submit()}
            requireAuthThen={requireAuthThen}
            placeholder={`Ask about “${document.title.slice(0, 40)}${document.title.length > 40 ? "…" : ""}"…`}
            showFactoryRail
            selectedFactory={selectedFactory}
            onFactorySelect={(kind) => {
              setSelectedFactory(kind)
              setFactoryModal(kind)
            }}
            sourceCount={1}
            atTitle={document.title}
            onAtClick={() =>
              toast.message("This article", { description: `"${document.title}" is in context (demo).` })
            }
            agentSuggestions={messages.length === 0 ? suggestions.slice(0, 4) : undefined}
            onQuickQuestion={(prompt) => runWithAuth(() => submit(prompt))}
            libraryName={kb.name}
            disclaimer={assistant.disclaimer || undefined}
          />
          </div>
        </aside>
      </div>

      <MindSaveToLibrarySheet
        open={saveSheetOpen}
        onClose={() => setSaveSheetOpen(false)}
        title="Add to library"
        preview={document.title}
        preferredKbName={kb.name}
        onSelect={(target: KnowledgeBase) => {
          setSaveSheetOpen(false)
          toast.success("Saved to library", {
            description: `“${document.title}” → ${target.name} (demo).`,
          })
        }}
      />

      <ContentFactoryModals
        open={factoryModal}
        onClose={() => setFactoryModal(null)}
        libraryName={`「${document.title}」· ${kb.name}`}
        onGenerateSubmit={(kind) => {
          setFactoryModal(null)
          toast.success("Queued", {
            description: `${kind} generation queued from this article (demo).`,
          })
        }}
        optionSurface="filled"
      />
    </div>
  )
}
