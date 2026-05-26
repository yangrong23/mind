"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Filter, MoreVertical, PanelLeftClose } from "lucide-react"
import { web } from "@/components/mind-v2/web-design"
import { AgentExamplePromptRail } from "@/components/mind-v2/agent-example-prompt-rail"
import { getAgentExamplePrompts } from "@/lib/agent-chat-example-prompts"
import { MindChatComposer } from "@/components/mind-v2/mind-chat-composer"
import {
  ContentFactoryModals,
  type FactoryModalKind,
} from "@/components/mind-v2/content-factory-modals"
import {
  MindChatFactoryRail,
  resolveFactoryRailSelection,
} from "@/components/mind-v2/mind-chat-factory-rail"
import { cn } from "@/lib/utils"
import type { Agent } from "@/components/mind-v2/agent-tab"
import type { LibraryAssistantChatMeta } from "@/lib/plaza-agent-runtime"
import type { KbAgentSuggestion } from "@/lib/kb-agent-suggestions"

const sessions = [
  { id: 1, title: "Product Strategy Review", time: "Today · 16:29" },
  { id: 2, title: "Competitive analysis", time: "Yesterday" },
  { id: 3, title: "User interview synthesis", time: "3 days ago" },
]

const sources = [
  { title: "Product Strategy Doc", pages: "pp. 12–18" },
  { title: "Market Research Report", pages: "pp. 4–9" },
  { title: "Q4 OKR Draft", pages: "Full doc" },
]

const demoReply = `**Comparison overview**

| Dimension | Base | Core strengths |
|-----------|------|----------------|
| Platform | Unified knowledge graph | Connects notes, docs, and AI chat |
| Audience | Teams & individuals | Research, product, and ops workflows |
| Delivery | Web + mobile capture | Same library, different surfaces |

Summary: Mindar keeps sources, dialogue, and Studio on one screen so you never lose context when generating deliverables.`

export function WebAgentWorkspace({
  agent,
  initialPrompt,
  onBack,
  requireAuthThen,
  libraryAssistant,
  librarySuggestions,
  scopedLibraryName,
}: {
  agent: Agent
  initialPrompt?: string
  onBack: () => void
  requireAuthThen?: (run: () => void) => void
  libraryAssistant?: LibraryAssistantChatMeta
  librarySuggestions?: KbAgentSuggestion[]
  scopedLibraryName?: string
}) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const [draft, setDraft] = useState(initialPrompt ?? "")
  const [activeSession, setActiveSession] = useState(1)
  const [showReply, setShowReply] = useState(!!initialPrompt?.trim())
  const [factoryModal, setFactoryModal] = useState<FactoryModalKind | null>(null)
  const [selectedFactory, setSelectedFactory] = useState<FactoryModalKind | null>(null)
  const examplePrompts = librarySuggestions?.length
    ? librarySuggestions.map((s) => ({ id: s.id, label: s.label, prompt: s.prompt }))
    : getAgentExamplePrompts(agent.id)
  const headerSubtitle = scopedLibraryName
    ? `Scoped to “${scopedLibraryName}”`
    : libraryAssistant?.tagline

  function submit() {
    runWithAuth(() => {
      if (!draft.trim()) {
        toast.error("Add a message first")
        return
      }
      setShowReply(true)
      setDraft("")
    })
  }

  return (
    <div className={cn("relative flex h-full min-h-0 flex-col", web.canvas)}>
      <div className="flex h-full min-h-0 gap-2 p-2">
        {/* Chat list — Figure 1 screen 4 left */}
        <aside className="flex w-[min(240px,22%)] min-w-[200px] shrink-0 flex-col overflow-hidden rounded-2xl bg-white/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]">
          <div className="border-b border-stone-100 px-3 py-3">
            <p className="text-[13px] font-semibold text-zinc-700">Conversations</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {sessions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSession(s.id)}
                className={cn(
                  "mb-1 w-full rounded-xl px-3 py-2.5 text-left",
                  activeSession === s.id
                    ? "bg-gradient-to-br from-teal-50/95 to-violet-50/75 font-medium text-zinc-800"
                    : "hover:bg-stone-50"
                )}
              >
                <p className="truncate text-[13px] font-medium text-zinc-700">{s.title}</p>
                <p className="mt-0.5 text-[11px] text-zinc-500">{s.time}</p>
              </button>
            ))}
          </div>
        </aside>

        {/* Dialogue — center */}
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]">
          <div className="flex shrink-0 items-center justify-between border-b border-stone-100 px-4 py-2.5">
            <button type="button" onClick={onBack} className="text-[13px] font-medium text-teal-600 hover:underline">
              ← Back
            </button>
            <div className="min-w-0 text-center">
              <h2 className="truncate text-[14px] font-semibold text-zinc-700">{agent.name}</h2>
              {headerSubtitle ? (
                <p className="truncate text-[11px] text-zinc-500">{headerSubtitle}</p>
              ) : null}
            </div>
            <div className="flex gap-1">
              <button type="button" className="rounded-lg p-2 hover:bg-stone-100" aria-label="Filter">
                <Filter className="h-4 w-4 text-zinc-500" />
              </button>
              <button type="button" className="rounded-lg p-2 hover:bg-stone-100" aria-label="More">
                <MoreVertical className="h-4 w-4 text-zinc-500" />
              </button>
            </div>
          </div>

          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 py-6">
            {showReply ? (
              <article className="prose prose-sm max-w-none text-zinc-600">
                <div className="whitespace-pre-wrap text-[14px] leading-relaxed">{demoReply}</div>
                <p className="mt-4 text-[11px] text-zinc-400">Today · 16:29 · Grounded on 3 sources</p>
              </article>
            ) : (
              <div className="mx-auto flex max-w-3xl flex-col items-center pt-4">
                <h2 className="text-center text-[22px] font-semibold tracking-tight text-zinc-800 sm:text-[26px]">
                  {libraryAssistant ? `Ask ${libraryAssistant.displayName}` : "What can I help you with?"}
                </h2>
                {libraryAssistant?.tagline ? (
                  <p className="mt-2 max-w-lg text-center text-[14px] text-zinc-500">{libraryAssistant.tagline}</p>
                ) : null}
                {libraryAssistant?.syncNote ? (
                  <p className="mt-2 text-[12px] text-teal-700/80">{libraryAssistant.syncNote}</p>
                ) : null}
                {examplePrompts.length > 0 ? (
                  <AgentExamplePromptRail
                    layout="wrap"
                    prompts={examplePrompts}
                    onSelect={(prompt) => runWithAuth(() => setDraft(prompt))}
                    className="mt-6 w-full"
                  />
                ) : (
                  <p className="mt-6 text-center text-[14px] text-zinc-500">
                    Ask anything about your connected libraries.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-stone-100 px-4 py-3">
            {libraryAssistant?.disclaimer ? (
              <p className="mx-auto mb-2 max-w-2xl text-center text-[11px] leading-relaxed text-zinc-400">
                {libraryAssistant.disclaimer}
              </p>
            ) : null}
            <div className="mx-auto w-full max-w-2xl">
              <MindChatComposer
                variant="thread"
                className="max-w-none"
                value={draft}
                onChange={setDraft}
                onSubmit={submit}
                placeholder={
                  libraryAssistant
                    ? `Ask ${libraryAssistant.displayName} about ${scopedLibraryName ?? "this library"}…`
                    : "Ask or create content…"
                }
                factoryToolbar={
                  <MindChatFactoryRail
                    railStyle="inline"
                    density="compact"
                    selectedId={selectedFactory}
                    onSelect={(id) =>
                      runWithAuth(() => {
                        const kind = resolveFactoryRailSelection(id)
                        setSelectedFactory(kind)
                        setFactoryModal(kind)
                      })
                    }
                  />
                }
                onUploadClick={() =>
                  runWithAuth(() =>
                    toast.message("Upload file", { description: "Demo — pick a file from your device." })
                  )
                }
              />
            </div>
          </div>
        </section>

        <ContentFactoryModals
          open={factoryModal}
          onClose={() => setFactoryModal(null)}
          modalDensity="compact"
          onGenerateSubmit={(kind) => {
            setFactoryModal(null)
            toast.success("Queued", { description: `${kind} generation queued (demo).` })
          }}
        />

        {/* Sources — Figure 1 screen 4 right */}
        <aside className="flex w-[min(260px,24%)] min-w-[220px] shrink-0 flex-col overflow-hidden rounded-2xl bg-white/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]">
          <div className="flex items-center justify-between border-b border-stone-100 px-3 py-2.5">
            <p className="text-[13px] font-semibold text-zinc-700">Sources</p>
            <PanelLeftClose className="h-4 w-4 text-zinc-400" />
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto p-2">
            {sources.map((s) => (
              <li
                key={s.title}
                className="mb-1 rounded-xl border border-stone-100 bg-stone-50/50 px-3 py-2.5"
              >
                <p className="text-[13px] font-medium text-zinc-600">{s.title}</p>
                <p className="text-[11px] text-zinc-500">{s.pages}</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
