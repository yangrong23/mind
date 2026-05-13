"use client"

import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { MOCK_KNOWLEDGE_BASES, type KnowledgeBase } from "@/lib/mock-knowledge-bases"
import { LibraryPlazaView } from "@/components/mind-v2/library-plaza-view"
import { ContentFactoryModals, type FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import {
  normalizeStudioFromAgentHandoff,
  resolveAgentStudioLibraryName,
  type StudioFromAgentHandoff,
  type StudioLibraryLinkMode,
} from "@/components/mind-v2/studio-handoff"
import {
  Plus,
  ChevronRight,
  Sparkles,
  ArrowUp,
  Volume2,
  Eye,
  LayoutDashboard,
  LayoutGrid,
  Store,
  Atom,
  Orbit,
  FileStack,
} from "lucide-react"

const STUDIO_OUTPUTS: { id: FactoryModalKind; label: string; sub: string }[] = [
  { id: "report", label: "Report", sub: "Structured doc" },
  { id: "audio", label: "Audio", sub: "Narrated recap" },
  { id: "mindmap", label: "Mind map", sub: "From sources" },
  { id: "flashcards", label: "Flashcards", sub: "Study deck" },
  { id: "quiz", label: "Quiz", sub: "Quick check" },
  { id: "slides", label: "Slides", sub: "Outline → deck" },
  { id: "infographic", label: "Infographic", sub: "Visual summary" },
]

interface Agent {
  id: number
  name: string
  description: string
  avatar: string
  color: string
  chatCount?: string
  author?: string
  isOfficial?: boolean
}

const exploreAgents: Agent[] = [
  { id: 1, name: "Study buddy", description: "Answers questions across subjects from school to college—math, language arts, and more.", avatar: "https://picsum.photos/seed/a1/100/100", color: "from-zinc-400 to-zinc-600", chatCount: "23.2M chats", author: "EduTeam", isOfficial: true },
  { id: 2, name: "Chatty Ning", description: "A friendly AI companion to share life’s ups and downs with.", avatar: "https://picsum.photos/seed/a2/100/100", color: "from-stone-400 to-zinc-500", chatCount: "20.0M chats", author: "Official", isOfficial: true },
  { id: 3, name: "Owen · English tutor", description: "Passionate and open-minded English foreign teacher", avatar: "https://picsum.photos/seed/a3/100/100", color: "from-zinc-500 to-stone-500", chatCount: "19.7M chats", author: "Official", isOfficial: true },
  { id: 4, name: "All-purpose writer", description: "Drafts and polishes copy for many kinds of writing tasks.", avatar: "https://picsum.photos/seed/a4/100/100", color: "from-zinc-300 to-stone-500", chatCount: "13.5M chats", author: "Official", isOfficial: true },
  { id: 5, name: "Book of answers", description: "When you’re stuck on small decisions, open a page for a nudge.", avatar: "https://picsum.photos/seed/a5/100/100", color: "from-stone-500 to-zinc-600", chatCount: "15.6M chats", author: "MossOak" },
  { id: 6, name: "Writing pro", description: "Your go-to helper for drafting and refining any text.", avatar: "https://picsum.photos/seed/a6/100/100", color: "from-zinc-500 to-zinc-700", chatCount: "8.9M chats", author: "EduTeam", isOfficial: true },
]

const myAgents: Agent[] = [
  { id: 101, name: "English coach", description: "Practice conversation and pronunciation", avatar: "🎓", color: "from-stone-400 to-zinc-500" },
  { id: 102, name: "Writing assistant", description: "Polish drafts and marketing copy", avatar: "✍️", color: "from-zinc-400 to-stone-600" },
  { id: 103, name: "Code helper", description: "Answers programming questions", avatar: "💻", color: "from-zinc-600 to-stone-500" },
]

const chatHistory = [
  { date: "May 8, 2026", items: [
    { id: 1, title: "Mind map draft", icon: "💭", subItems: [{ text: "Notes and reflections…", type: "note" }] },
    { id: 2, title: "Build an agent", icon: "💭", subItems: [{ text: "ima claw setup", type: "config" }] },
    { id: 3, title: "TCL Zhonghuan news…", icon: "💭" },
  ]},
  { date: "May 6, 2026", items: [
    { id: 4, title: "What’s inside?", icon: "💭" },
  ]},
]

interface AgentTabProps {
  onAgentChat: (agent: Agent) => void
}

function libraryLinkSummary(mode: StudioLibraryLinkMode, pickedKbIds: number[]): string {
  if (mode === "all") return "All"
  if (mode === "auto") return "Auto"
  if (pickedKbIds.length === 0) return "Auto"
  const rows = pickedKbIds
    .map((id) => MOCK_KNOWLEDGE_BASES.find((k) => k.id === id))
    .filter((x): x is (typeof MOCK_KNOWLEDGE_BASES)[number] => Boolean(x))
  if (rows.length === 0) return "Auto"
  if (rows.length === 1) return rows[0].name
  return `${rows[0].name} +${rows.length - 1}`
}

export function AgentTab({ onAgentChat }: AgentTabProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showCreateSheet, setShowCreateSheet] = useState(false)
  const [showExplore, setShowExplore] = useState(false)
  const [showKBSelect, setShowKBSelect] = useState(false)
  const [libraryLinkMode, setLibraryLinkMode] = useState<StudioLibraryLinkMode>("auto")
  const [pickedKbIds, setPickedKbIds] = useState<number[]>([])
  const [showStudioMenu, setShowStudioMenu] = useState(false)
  const [agentHomeDraft, setAgentHomeDraft] = useState("")
  const [agentStudioSession, setAgentStudioSession] = useState<StudioFromAgentHandoff | null>(null)
  const [libraryPlazaFromAgent, setLibraryPlazaFromAgent] = useState(false)

  const linkSummary = libraryLinkSummary(libraryLinkMode, pickedKbIds)

  function handlePlazaPick(kb: KnowledgeBase) {
    setLibraryLinkMode("pick")
    setPickedKbIds((prev) => (prev.includes(kb.id) ? prev : [...prev, kb.id]))
    toast.success("Library linked", { description: kb.name })
    setLibraryPlazaFromAgent(false)
  }

  function openStudioWithKind(factoryKind: FactoryModalKind) {
    const mode =
      libraryLinkMode === "pick" && pickedKbIds.length === 0 ? "auto" : libraryLinkMode
    const ids = mode === "pick" ? pickedKbIds : []
    setAgentStudioSession(
      normalizeStudioFromAgentHandoff({ factoryKind, libraryLinkMode: mode, pickedKbIds: ids })
    )
  }

  function submitAgentHomePrompt() {
    const q = agentHomeDraft.trim()
    if (!q) {
      toast.error("Add a prompt first")
      return
    }
    toast.success("Queued", { description: q.length > 100 ? `${q.slice(0, 100)}…` : q })
    setAgentHomeDraft("")
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#fafaf9] text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
      {/* Left drawer */}
      <div 
        className={cn(
          "absolute inset-y-0 left-0 z-40 flex w-[75%] flex-col bg-white transition-transform duration-300 dark:bg-zinc-900",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Top actions */}
        <div className="border-b border-gray-100 p-4 dark:border-zinc-800">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setDrawerOpen(false)
                setShowCreateSheet(true)
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              New agent
            </button>
            <button
              onClick={() => {
                setDrawerOpen(false)
                setShowExplore(true)
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-stone-100 py-3 text-sm font-medium text-zinc-800 hover:bg-stone-200/90"
            >
              <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Discover
            </button>
          </div>
        </div>

        {/* My agents */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-3 text-sm text-zinc-400">My agents</div>
          {myAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => {
                onAgentChat(agent)
                setDrawerOpen(false)
              }}
              className="flex w-full items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/60"
            >
              <span className="text-2xl">{agent.avatar}</span>
              <div className="flex-1 text-left">
                <div className="text-[15px] text-gray-900 dark:text-zinc-100">{agent.name}</div>
                <div className="text-xs text-gray-400 dark:text-zinc-500">{agent.description}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          ))}

          <div className="mt-4 border-t border-gray-100 px-5 pt-4 dark:border-zinc-800">
            <div className="mb-3 text-sm text-zinc-400">Recent chats</div>
            {chatHistory.map((group) => (
              <div key={group.date} className="mb-4">
                <div className="text-sm text-gray-400 mb-2">{group.date}</div>
                {group.items.map((item) => (
                  <div key={item.id} className="mb-3">
                    <div className="flex items-center gap-2 text-[15px] text-gray-900 dark:text-zinc-100">
                      <span>{item.icon}</span>
                      <span className="truncate">{item.title}</span>
                    </div>
                    {item.subItems?.map((sub, i) => (
                      <div key={i} className="flex items-center gap-2 ml-6 mt-1 text-sm text-gray-500">
                        <span className={cn(
                          "w-4 h-4 rounded flex items-center justify-center text-[10px]",
                          sub.type === "note" ? "bg-zinc-100 text-zinc-700" : "bg-stone-100 text-stone-800"
                        )}>
                          {sub.type === "note" ? "📝" : "⚙️"}
                        </span>
                        <span className="truncate">{sub.text}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="px-5 py-4 text-center text-xs text-zinc-400">90-day history</div>
        </div>
      </div>

      {/* Drawer scrim */}
      {drawerOpen && (
        <div 
          className="absolute inset-0 z-30 bg-black/50"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Main surface — centered composer, neutral backdrop */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center pt-4">
          <div
            className="aspect-[4/3] w-[min(100%,380px)] max-h-[48vh] bg-[radial-gradient(ellipse_70%_58%_at_50%_45%,rgba(24,24,27,0.06),transparent_68%)] dark:bg-[radial-gradient(ellipse_70%_58%_at_50%_45%,rgba(255,255,255,0.05),transparent_68%)]"
            aria-hidden
          />
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="absolute left-3 top-2 z-20 sm:left-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-2xl text-zinc-500 transition-all duration-300 hover:bg-black/[0.04] hover:text-zinc-800 active:scale-95 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100"
              aria-label="Open menu"
            >
              <div className="h-[2px] w-[18px] rounded-full bg-current opacity-80" />
              <div className="h-[2px] w-[18px] rounded-full bg-current opacity-80" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-8 pt-12">
            <div className="flex w-full max-w-md flex-col items-stretch">
              <div className="mb-7 flex flex-col items-center">
                <div className="flex items-end gap-2.5">
                  <img
                    src="/minder-agent-mark.png"
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 object-contain drop-shadow-sm dark:opacity-90"
                  />
                  <div className="flex flex-col pb-0.5">
                    <span className="text-[24px] font-semibold leading-none tracking-tight text-zinc-900 lowercase dark:text-zinc-50">
                      minder
                    </span>
                    <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.42em] text-zinc-400 dark:text-zinc-500">
                      copilot
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] bg-white/92 p-4 shadow-[0_16px_48px_-20px_rgba(15,23,42,0.14),0_2px_12px_-4px_rgba(15,23,42,0.06)] backdrop-blur-md dark:bg-zinc-900/72 dark:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.55)]">
                <input
                  type="text"
                  value={agentHomeDraft}
                  onChange={(e) => setAgentHomeDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      submitAgentHomePrompt()
                    }
                  }}
                  placeholder="Message or hold to speak"
                  className="w-full bg-transparent text-[16px] leading-relaxed text-zinc-900 placeholder:text-zinc-400/90 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
                <div className="mt-3.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowStudioMenu(false)
                        setShowKBSelect(true)
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-sky-50 hover:text-sky-700 active:scale-95 dark:text-zinc-400 dark:hover:bg-sky-950/40 dark:hover:text-sky-300"
                      aria-label="Library scope — choose linked knowledge bases"
                      title="All, Auto, or pick libraries that feed this chat"
                    >
                      <Atom className="h-5 w-5" strokeWidth={1.65} aria-hidden />
                    </button>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowStudioMenu((v) => !v)}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 active:scale-95 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                        aria-label="Studio"
                        aria-expanded={showStudioMenu}
                      >
                        <LayoutGrid className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                      </button>
                      {showStudioMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowStudioMenu(false)} />
                          <div className="absolute bottom-full left-0 z-50 mb-2 w-[min(100vw-2rem,18rem)] overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/98 py-1 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] backdrop-blur-lg dark:border-zinc-700 dark:bg-zinc-900/98">
                            <button
                              type="button"
                              onClick={() => {
                                setShowStudioMenu(false)
                                toast.message("Attach files", { description: "Demo — pick a file." })
                              }}
                              className="flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/90"
                            >
                              <FileStack className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" strokeWidth={2} aria-hidden />
                              <span className="min-w-0 flex-1">
                                <span className="block text-[14px] font-medium text-zinc-900 dark:text-zinc-100">Attach files</span>
                                <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">Upload documents to this thread (demo)</span>
                              </span>
                            </button>
                            <div className="mx-3 border-t border-zinc-100 dark:border-zinc-800" />
                            <button
                              type="button"
                              onClick={() => {
                                setShowStudioMenu(false)
                                setShowKBSelect(true)
                              }}
                              className="flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/90"
                            >
                              <Orbit className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" strokeWidth={2} aria-hidden />
                              <span className="min-w-0 flex-1">
                                <span className="block text-[14px] font-medium text-zinc-900 dark:text-zinc-100">Libraries</span>
                                <span className="block truncate text-[11px] text-zinc-500 dark:text-zinc-400">{linkSummary}</span>
                              </span>
                            </button>
                            <div className="mx-3 border-t border-zinc-100 dark:border-zinc-800" />
                            <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                              Outputs
                            </p>
                            {STUDIO_OUTPUTS.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  setShowStudioMenu(false)
                                  openStudioWithKind(item.id)
                                }}
                                className="w-full px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/90"
                              >
                                <span className="block text-[14px] font-medium text-zinc-900 dark:text-zinc-100">{item.label}</span>
                                <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">{item.sub}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={submitAgentHomePrompt}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-800 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    aria-label="Send"
                  >
                    <ArrowUp className="h-5 w-5" strokeWidth={2.15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create agent sheet */}
      {showCreateSheet && (
        <CreateAgentSheet 
          onClose={() => setShowCreateSheet(false)} 
          onExplore={() => {
            setShowCreateSheet(false)
            setShowExplore(true)
          }}
        />
      )}

      {/* Explore agents */}
      {showExplore && (
        <ExploreAgentsPage 
          onClose={() => setShowExplore(false)}
          onSelect={(agent) => {
            setShowExplore(false)
            onAgentChat(agent)
          }}
          onCreate={() => {
            setShowExplore(false)
            setShowCreateSheet(true)
          }}
        />
      )}

      {/* Library scope — one scrollable sheet */}
      {showKBSelect && (
        <div className="absolute inset-0 z-50 flex min-h-0 flex-col">
          <button
            type="button"
            className="min-h-0 flex-1 bg-black/40"
            aria-label="Close"
            onClick={() => {
              setLibraryPlazaFromAgent(false)
              setShowKBSelect(false)
            }}
          />
          <div className="flex max-h-[90vh] w-full shrink-0 flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-12px_48px_-12px_rgba(0,0,0,0.2)] dark:bg-zinc-900">
            <div className="flex shrink-0 justify-center pb-2 pt-3">
              <div className="h-1 w-10 rounded-full bg-stone-200 dark:bg-zinc-600" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-8 [scrollbar-gutter:stable]">
              <h3 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Libraries</h3>
              <p className="mt-1 text-[13px] leading-snug text-zinc-500 dark:text-zinc-400">
                Scope for Studio and replies.
              </p>

              <button
                type="button"
                onClick={() => setLibraryPlazaFromAgent(true)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200/90 bg-sky-50/60 py-3 text-[14px] font-medium text-sky-900 shadow-sm shadow-sky-900/5 transition-colors hover:bg-sky-50 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-100 dark:hover:bg-sky-950/55"
              >
                <Store className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                Library plaza
              </button>

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setLibraryLinkMode("all")
                    setPickedKbIds([])
                  }}
                  className={cn(
                    "w-full rounded-xl border-2 px-3 py-2.5 text-left transition-colors",
                    libraryLinkMode === "all"
                      ? "border-sky-400 bg-sky-50/80 dark:border-sky-500 dark:bg-sky-950/50"
                      : "border-transparent bg-sky-50/20 dark:bg-zinc-800/40"
                  )}
                >
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">All libraries</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Use everything linked</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLibraryLinkMode("auto")
                    setPickedKbIds([])
                  }}
                  className={cn(
                    "w-full rounded-xl border-2 px-3 py-2.5 text-left transition-colors",
                    libraryLinkMode === "auto"
                      ? "border-sky-400 bg-sky-50/80 dark:border-sky-500 dark:bg-sky-950/50"
                      : "border-transparent bg-sky-50/20 dark:bg-zinc-800/40"
                  )}
                >
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">Auto</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Mind picks per run</div>
                </button>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Or choose
              </p>
              <div className="mt-2 space-y-2">
                {MOCK_KNOWLEDGE_BASES.map((kb) => {
                  const selected = pickedKbIds.includes(kb.id)
                  return (
                    <button
                      key={kb.id}
                      type="button"
                      onClick={() => {
                        setLibraryLinkMode("pick")
                        setPickedKbIds((prev) =>
                          prev.includes(kb.id) ? prev.filter((id) => id !== kb.id) : [...prev, kb.id]
                        )
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl p-3 transition-colors",
                        selected
                          ? "border-2 border-sky-400 bg-sky-50/80 dark:border-sky-500 dark:bg-sky-950/45"
                          : "border-2 border-transparent bg-sky-50/15 dark:bg-zinc-800/40"
                      )}
                    >
                      <img
                        src={kb.coverImage}
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-black/[0.06] dark:ring-white/10"
                      />
                      <div className="min-w-0 flex-1 text-left">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{kb.name}</div>
                        <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                          {kb.count} items · {kb.description}
                        </div>
                      </div>
                      {selected && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white dark:bg-sky-500">
                          <span className="text-sm">✓</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  setLibraryPlazaFromAgent(false)
                  setShowKBSelect(false)
                }}
                className={cn(
                  "mt-8 w-full rounded-xl py-3 text-[15px] font-semibold text-white",
                  mx.brandCta
                )}
              >
                Done
                {libraryLinkMode === "pick" && pickedKbIds.length > 0 ? ` (${pickedKbIds.length})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      {showKBSelect && libraryPlazaFromAgent && (
        <div className="absolute inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-white dark:bg-zinc-950">
          <LibraryPlazaView
            onBack={() => setLibraryPlazaFromAgent(false)}
            onPickLibrary={handlePlazaPick}
            subtitle="Tap a library to add it to this chat’s knowledge scope."
          />
        </div>
      )}

      {agentStudioSession && (
        <ContentFactoryModals
          open={agentStudioSession.factoryKind}
          onClose={() => setAgentStudioSession(null)}
          libraryName={resolveAgentStudioLibraryName(agentStudioSession)}
          onGenerateSubmit={(_kind, _settings) => setAgentStudioSession(null)}
        />
      )}
    </div>
  )
}

// Create agent sheet
function CreateAgentSheet({ onClose, onExplore }: { onClose: () => void; onExplore: () => void }) {
  const [name, setName] = useState("")
  const [persona, setPersona] = useState("")

  return (
    <div className="absolute inset-0 z-50 flex flex-col animate-in slide-in-from-bottom duration-200 bg-gray-50 dark:bg-zinc-950">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <button type="button" onClick={onClose} className="text-[15px] text-gray-600 dark:text-zinc-400">
          Cancel
        </button>
        <h1 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">New agent</h1>
        <button type="button" className="text-[15px] font-medium text-sky-600">
          Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Avatar */}
        <div className="flex justify-center py-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-zinc-100 flex items-center justify-center">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <div className="w-2 h-2 rounded-full bg-gray-400" />
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Autofill */}
        <div className="px-5 mb-4">
          <button type="button" className="flex items-center gap-1 text-sm text-sky-600">
            <Sparkles className="h-4 w-4" />
            Autofill
          </button>
        </div>

        {/* Name */}
        <div className="mx-5 mb-4 rounded-xl bg-white p-4 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-medium text-gray-900 dark:text-zinc-100">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. English coach"
              className="flex-1 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none dark:bg-transparent dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mx-5 mb-4 rounded-xl bg-white p-4 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[15px] font-medium text-gray-900 dark:text-zinc-100">Instructions</span>
            <button type="button" className="flex items-center gap-1 text-sm text-sky-600">
              <Sparkles className="h-4 w-4" />
              Polish
            </button>
          </div>
          <textarea
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder="How should this agent sound and behave?"
            rows={4}
            className="w-full resize-none text-[15px] leading-relaxed text-gray-500 placeholder-gray-400 focus:outline-none dark:bg-transparent dark:text-zinc-300 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Voice */}
        <div className="mx-5 mb-4 rounded-xl bg-white dark:bg-zinc-900">
          <button className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-zinc-700" />
              </div>
              <span className="text-[15px] text-gray-900 dark:text-zinc-100">Voice</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-sm">Edit</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
          <div className="border-t border-gray-100 dark:border-zinc-800" />
          <button className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-zinc-600" />
              </div>
              <span className="text-[15px] text-gray-900 dark:text-zinc-100">Public · anyone can chat</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* More advanced options */}
        <div className="px-5 mb-4">
          <button type="button" className="flex w-full items-center justify-center gap-1 py-3 text-[15px] text-zinc-500">
            <Plus className="h-4 w-4" />
            More options
          </button>
        </div>

        {/* Gallery entry */}
        <div className="mx-5 mb-8">
          <button 
            onClick={onExplore}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-4 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <LayoutDashboard className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            <span className="text-[15px] font-medium">Browse gallery</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Agent gallery page
interface ExploreAgentsPageProps {
  onClose: () => void
  onSelect: (agent: Agent) => void
  onCreate: () => void
}

function ExploreAgentsPage({ onClose, onSelect, onCreate }: ExploreAgentsPageProps) {
  const [activeTab, setActiveTab] = useState("Featured")
  const [selectedAgents, setSelectedAgents] = useState<number[]>([])
  const tabs = ["Featured", "Study", "Work", "Life"]

  const toggleAgent = (id: number) => {
    setSelectedAgents(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col animate-in slide-in-from-right duration-200 bg-white dark:bg-zinc-950">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 dark:border-zinc-800">
        <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-zinc-800">
          <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
        </button>
        <h1 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Gallery</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 dark:border-zinc-800">
        <div className="flex overflow-x-auto px-4 py-3 gap-6 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-[15px] font-medium whitespace-nowrap pb-1 border-b-2 transition-colors",
                activeTab === tab
                  ? "border-gray-900 text-gray-900 dark:border-zinc-100 dark:text-zinc-100"
                  : "border-transparent text-gray-400 dark:text-zinc-500"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Agent list */}
      <div className="flex-1 overflow-y-auto">
        {exploreAgents.map((agent) => (
          <div 
            key={agent.id}
            className="flex items-start gap-3 border-b border-gray-50 px-5 py-4 dark:border-zinc-800/80"
          >
            <img 
              src={agent.avatar} 
              alt={agent.name}
              className="w-14 h-14 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-zinc-100">{agent.name}</h3>
                {agent.isOfficial && (
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
                    Official
                  </span>
                )}
              </div>
              <p className="mb-1.5 line-clamp-2 text-sm text-gray-500 dark:text-zinc-400">{agent.description}</p>
              <div className="flex flex-wrap items-center gap-1 text-xs text-gray-400">
                <span>{agent.chatCount}</span>
                {agent.author && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{agent.author}</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => toggleAgent(agent.id)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0",
                selectedAgents.includes(agent.id)
                  ? "bg-zinc-100 text-zinc-700"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {selectedAgents.includes(agent.id) ? (
                <span className="text-lg">✓</span>
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-gray-100 p-5 dark:border-zinc-800">
        <button
          onClick={onCreate}
          className="w-full py-4 bg-zinc-500 text-white rounded-xl font-medium text-[15px] flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create agent
        </button>
      </div>
    </div>
  )
}

function agentAvatarIsRemoteUrl(avatar: string) {
  return typeof avatar === "string" && /^https?:\/\//i.test(avatar)
}

// Agent chat screen
interface AgentChatProps {
  agent: Agent
  onBack: () => void
  /** Shown under the header when present — e.g. library-grounded “deep knowledge” entry */
  entryHint?: string
}

export function AgentChat({ agent, onBack, entryHint }: AgentChatProps) {
  const avatar = agent.avatar ?? ""
  const showRemoteAvatar = agentAvatarIsRemoteUrl(avatar)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; content: string }>>([])

  const handleSend = () => {
    if (!input.trim()) return
    setMessages([...messages, { role: "user", content: input }])
    setInput("")
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: `Hi — I’m ${agent.name}. I’ve got your message and I’ll help from here.`,
      }])
    }, 1000)
  }

  const composer = (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder={entryHint ? "Turn saved knowledge into an outcome…" : "Message…"}
        className="min-w-0 flex-1 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300/60 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-600/50"
      />
      <button
        type="button"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        aria-label="Upload file"
        onClick={() => toast.message("Attach file", { description: "Demo — pick a file." })}
      >
        <FileStack className="h-5 w-5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        aria-label="Studio"
        onClick={() =>
          toast.message("Studio", {
            description: "Open a knowledge base and use Studio outputs there (demo).",
          })
        }
      >
        <LayoutGrid className="h-5 w-5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={handleSend}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        aria-label="Send"
      >
        <ArrowUp className="h-5 w-5" strokeWidth={2.15} />
      </button>
    </div>
  )

  return (
    <div className="flex h-full flex-col bg-gray-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <button type="button" onClick={onBack} className="-ml-2 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-zinc-800">
          <ChevronRight className="h-6 w-6 rotate-180 text-gray-700 dark:text-zinc-200" />
        </button>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-xl",
            agent.color
          )}
        >
          {showRemoteAvatar ? (
            <img src={avatar} alt="" className="h-full w-full rounded-xl object-cover" />
          ) : (
            avatar || "·"
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-zinc-100">{agent.name}</h3>
          <p className="line-clamp-1 text-xs text-gray-500 dark:text-zinc-400">{agent.description}</p>
        </div>
      </div>

      {entryHint ? (
        <div className="shrink-0 border-b border-zinc-200/90 bg-zinc-50/95 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-[13px] leading-snug text-zinc-700 dark:text-zinc-300">{entryHint}</p>
        </div>
      ) : null}

      {messages.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 py-6">
          <div
            className={cn(
              "mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br text-4xl",
              agent.color
            )}
          >
            {showRemoteAvatar ? (
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              avatar || "·"
            )}
          </div>
          <h3 className="mb-1 text-center font-semibold text-gray-900 dark:text-zinc-100">Hi, I&apos;m {agent.name}</h3>
          <p className="mb-8 max-w-[280px] text-center text-sm text-gray-500 dark:text-zinc-400">
            {entryHint
              ? "Flexible AI on your sources—toward concrete outcomes."
              : "Send a message to start"}
          </p>
          <div className="w-full max-w-md rounded-2xl border border-gray-200/90 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            {composer}
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    msg.role === "user"
                      ? "rounded-br-md bg-zinc-600 text-white"
                      : "rounded-bl-md bg-white text-gray-800 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="shrink-0 border-t border-gray-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">{composer}</div>
        </>
      )}
    </div>
  )
}
