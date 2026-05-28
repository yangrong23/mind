"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  Bold,
  ChevronLeft,
  Italic,
  List,
  Sparkles,
  Underline,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { AgentContactAvatar } from "@/components/mind-v2/agent-tab"
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
import { getKbAgentSuggestions } from "@/lib/kb-agent-suggestions"
import {
  agentFromPublicKbSettings,
  libraryAssistantChatMeta,
} from "@/lib/plaza-agent-runtime"
import { publicAgentDisplayName } from "@/lib/public-kb-settings"
import type { KbReaderKbPayload } from "@/components/mind-v2/web-kb-document-reader-page"

function execFormat(command: "bold" | "italic" | "underline" | "insertUnorderedList") {
  try {
    document.execCommand(command, false)
  } catch {
    /* noop */
  }
}

function htmlBodyIsEmpty(html: string) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .trim()
  return text.length === 0
}

export function WebKbRichTextEditorPage({
  kb,
  onBack,
  onSave,
  requireAuthThen,
  initialTitle = "",
  initialHtml = "",
}: {
  kb: KbReaderKbPayload
  onBack: () => void
  onSave?: (data: { title: string; html: string }) => void
  requireAuthThen?: (run: () => void) => void
  initialTitle?: string
  initialHtml?: string
}) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const editorRef = useRef<HTMLDivElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  const [title, setTitle] = useState(initialTitle)
  const [bodyEmpty, setBodyEmpty] = useState(true)
  const [draft, setDraft] = useState("")
  const [messages, setMessages] = useState<WebNotebookMessage[]>([])
  const [factoryModal, setFactoryModal] = useState<FactoryModalKind | null>(null)
  const [selectedFactory, setSelectedFactory] = useState<FactoryModalKind | null>(null)
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

  const readHtml = () => editorRef.current?.innerHTML?.trim() || "<p></p>"

  const syncBodyEmpty = useCallback(() => {
    setBodyEmpty(htmlBodyIsEmpty(readHtml()))
  }, [])

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    const raw = initialHtml.trim()
    const initial = raw
      ? raw.includes("<")
        ? raw
        : `<p>${raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`
      : "<p><br></p>"
    el.innerHTML = initial
    setBodyEmpty(htmlBodyIsEmpty(initial))
  }, [initialHtml])

  function appendExchange(question: string) {
    const q = question.trim()
    if (!q) return
    setMessages((prev) => [...prev, ...buildWebNotebookExchange(q, 1)])
  }

  function submitChat(promptOverride?: string) {
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
    const el = chatScrollRef.current
    if (!el || messages.length === 0) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages.length])

  function handleBack() {
    const html = readHtml()
    if (onSave && (title.trim() || !htmlBodyIsEmpty(html))) {
      onSave({ title: title.trim() || "Untitled", html })
    }
    onBack()
  }

  function requestAiCoWrite() {
    runWithAuth(() => {
      const snippet = readHtml()
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200)
      const seed = snippet
        ? `Help me improve this draft for "${title || "my note"}": ${snippet}…`
        : `Help me write a rich-text note for the "${kb.name}" library about…`
      setDraft(seed)
      toast.message("AI co-writing", { description: "Edit the prompt and send when ready." })
    })
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent px-3 py-3">
      <header
        className={cn(web.surfaceCard, "mb-3 flex shrink-0 items-center gap-2 px-3 py-2.5 sm:px-4")}
      >
        <button
          type="button"
          onClick={handleBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-900/[0.05]"
          aria-label="Back to library"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-zinc-500">{kb.name}</p>
          <p className="text-[14px] font-semibold text-zinc-800">Rich text note</p>
        </div>
        <button
          type="button"
          onClick={requestAiCoWrite}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-white transition-colors",
            "bg-mind hover:bg-sky-600"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          AI co-write
        </button>
      </header>

      <div className="flex min-h-0 flex-1 gap-3">
        <section className={cn(web.kbPanel, "flex min-w-0 flex-1 flex-col overflow-hidden")}>
          <div className="flex shrink-0 items-center gap-1 border-b border-black/[0.04] px-3 py-2">
            {(
              [
                { cmd: "bold" as const, Icon: Bold, label: "Bold" },
                { cmd: "italic" as const, Icon: Italic, label: "Italic" },
                { cmd: "underline" as const, Icon: Underline, label: "Underline" },
              ] as const
            ).map(({ cmd, Icon, label }) => (
              <button
                key={cmd}
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-900/[0.04]"
                aria-label={label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editorRef.current?.focus()
                  execFormat(cmd)
                  syncBodyEmpty()
                }}
              >
                <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
            ))}
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-900/[0.04]"
              aria-label="Bullet list"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                editorRef.current?.focus()
                execFormat("insertUnorderedList")
                syncBodyEmpty()
              }}
            >
              <List className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          </div>

          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className="w-full border-0 bg-transparent text-[24px] font-semibold tracking-tight text-zinc-800 placeholder:text-zinc-300 focus:outline-none"
            />
            <div className="relative mt-4 min-h-[min(50vh,520px)]">
              {bodyEmpty ? (
                <p className="pointer-events-none absolute left-0 top-0 text-[16px] text-zinc-300">
                  Start writing…
                </p>
              ) : null}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className={cn(
                  "min-h-[min(50vh,520px)] w-full text-[16px] leading-[1.75] text-zinc-700 outline-none",
                  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
                  "[&_p]:min-h-[1.4em]"
                )}
                onInput={syncBodyEmpty}
                onBlur={syncBodyEmpty}
              />
            </div>
          </div>
        </section>

        <aside
          className={cn(
            web.kbPanel,
            "flex w-full min-w-0 flex-col overflow-hidden lg:w-[min(420px,38%)] lg:max-w-[480px] lg:shrink-0"
          )}
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-black/[0.04] px-3 py-2.5">
            <AgentContactAvatar agent={agent} size={40} className="rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-zinc-800">{agentLabel}</p>
              <p className="truncate text-[11px] text-zinc-500">Co-write · {kb.name}</p>
            </div>
            <MindChatHeaderActions
              size="compact"
              newChatAccent={false}
              onNewChat={() => {
                setMessages([])
                setDraft("")
              }}
              onOpenHistory={() =>
                toast.message("History", { description: "Note co-writing history (demo)." })
              }
            />
          </div>

          {assistant.syncNote ? (
            <p className="shrink-0 border-b border-black/[0.04] bg-zinc-900/[0.02] px-4 py-2 text-[12px] text-zinc-600">
              {assistant.syncNote}
            </p>
          ) : null}

          <div ref={chatScrollRef} className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <p className="text-center text-[13px] leading-relaxed text-zinc-500">
                Ask {agentLabel} to draft, expand, or polish this note. Content factory formats are
                available below.
              </p>
            ) : (
              <WebNotebookDialogueBlock
                variant="thread"
                messages={messages}
                sourceCount={1}
                feedbackById={feedbackById}
                onFeedback={setFeedback}
                onRegenerate={() => toast.message("Regenerated", { description: "Demo." })}
                followUpPrompts={suggestions.slice(0, 3).map((s) => ({
                  id: s.id,
                  label: s.label,
                  prompt: s.prompt,
                }))}
                onFollowUpSelect={(prompt) => runWithAuth(() => submitChat(prompt))}
              />
            )}
          </div>

          <WebThreadComposer
            draft={draft}
            onDraftChange={setDraft}
            onSubmit={() => submitChat()}
            requireAuthThen={requireAuthThen}
            placeholder="Ask AI to co-write…"
            showFactoryRail
            selectedFactory={selectedFactory}
            onFactorySelect={(kind) => {
              setSelectedFactory(kind)
              setFactoryModal(kind)
            }}
            sourceCount={1}
            atTitle={title.trim() || "This note"}
            agentSuggestions={messages.length === 0 ? suggestions : undefined}
            libraryName={kb.name}
            disclaimer={assistant.disclaimer || undefined}
            className="border-t border-black/[0.04] bg-white/40"
          />
        </aside>
      </div>

      <ContentFactoryModals
        open={factoryModal}
        onClose={() => setFactoryModal(null)}
        libraryName={`「${title || "Rich note"}」· ${kb.name}`}
        onGenerateSubmit={(kind) => {
          setFactoryModal(null)
          toast.success("Queued", { description: `${kind} queued from note editor (demo).` })
        }}
        optionSurface="filled"
      />
    </div>
  )
}
