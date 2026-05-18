"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { MOCK_KNOWLEDGE_BASES } from "@/lib/mock-knowledge-bases"
import {
  ContentFactoryModals,
  type FactoryGenerationSettings,
  type FactoryModalKind,
} from "@/components/mind-v2/content-factory-modals"
import { MindChatComposer } from "@/components/mind-v2/mind-chat-composer"
import {
  MindChatFactoryRail,
  resolveFactoryRailSelection,
} from "@/components/mind-v2/mind-chat-factory-rail"
import { MindChatHeaderActions } from "@/components/mind-v2/mind-chat-header-actions"
import { MindChatMessageActions } from "@/components/mind-v2/mind-chat-message-actions"
import {
  MindChatQaHistoryPanel,
  seedDemoQaHistory,
  type MindQaHistoryItem,
} from "@/components/mind-v2/mind-chat-qa-history-panel"
import {
  normalizeStudioFromAgentHandoff,
  resolveAgentStudioLibraryName,
  type StudioFromAgentHandoff,
  type StudioLibraryLinkMode,
} from "@/components/mind-v2/studio-handoff"
import {
  Plus,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Volume2,
  Eye,
  LayoutDashboard,
  MessageCircle,
  Library,
  Check,
  Bot,
  Globe,
  AtSign,
  AudioLines,
  Square,
} from "lucide-react"

const STUDIO_OUTPUTS: { id: FactoryModalKind; label: string; sub: string }[] = [
  { id: "report", label: "Report", sub: "Structured doc" },
  { id: "audio", label: "Audio", sub: "Narrated recap" },
  { id: "flashcards", label: "Flashcards", sub: "Study deck" },
  { id: "quiz", label: "Quiz", sub: "Quick check" },
  { id: "slides", label: "Slides", sub: "Outline → deck" },
  { id: "infographic", label: "Infographic", sub: "Visual summary" },
]

/** Two balanced rows for the agent home “content factory” rail (3 + 3). */
const STUDIO_OUTPUT_ROWS = [STUDIO_OUTPUTS.slice(0, 3), STUDIO_OUTPUTS.slice(3)] as const

export interface Agent {
  id: number
  name: string
  description: string
  avatar: string
  color: string
  chatCount?: string
  author?: string
  isOfficial?: boolean
}

/** Default agent when sending from the Minder home composer. */
export const MINDER_COPILOT_AGENT: Agent = {
  id: 0,
  name: "Minder",
  description: "Copilot",
  avatar: "🧠",
  color: "from-zinc-500 to-stone-600",
}

export type AgentChatLaunchOptions = {
  initialPrompt?: string
  initialChatMode?: "dialog" | "agent"
  initialModelLabel?: string
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
  onAgentChat: (agent: Agent, options?: AgentChatLaunchOptions) => void
  /** Run send / attach only after demo sign-in. */
  requireAuthThen?: (run: () => void) => void
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

export function AgentTab({ onAgentChat, requireAuthThen }: AgentTabProps) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showCreateSheet, setShowCreateSheet] = useState(false)
  const [showExplore, setShowExplore] = useState(false)
  const [showKBSelect, setShowKBSelect] = useState(false)
  const [libraryLinkMode, setLibraryLinkMode] = useState<StudioLibraryLinkMode>("auto")
  const [pickedKbIds, setPickedKbIds] = useState<number[]>([])
  const [agentHomeDraft, setAgentHomeDraft] = useState("")
  const [agentStudioSession, setAgentStudioSession] = useState<StudioFromAgentHandoff | null>(null)
  /** Home composer — ima-style: dialog vs agent, model, @ KB, voice, upload */
  const [agentHomeChatMode, setAgentHomeChatMode] = useState<"dialog" | "agent">("dialog")
  const [agentHomeModelLabel, setAgentHomeModelLabel] = useState("DS Fast")
  const [agentHomeVoiceOn, setAgentHomeVoiceOn] = useState(false)

  const linkSummary = libraryLinkSummary(libraryLinkMode, pickedKbIds)

  function openStudioWithKind(factoryKind: FactoryModalKind) {
    const mode =
      libraryLinkMode === "pick" && pickedKbIds.length === 0 ? "auto" : libraryLinkMode
    const ids = mode === "pick" ? pickedKbIds : []
    setAgentStudioSession(
      normalizeStudioFromAgentHandoff({ factoryKind, libraryLinkMode: mode, pickedKbIds: ids })
    )
  }

  function submitAgentHomePrompt() {
    runWithAuth(() => {
      const q = agentHomeDraft.trim()
      if (!q) {
        toast.error("Add a prompt first")
        return
      }
      onAgentChat(MINDER_COPILOT_AGENT, {
        initialPrompt: q,
        initialChatMode: agentHomeChatMode,
        initialModelLabel: agentHomeModelLabel,
      })
      setAgentHomeDraft("")
    })
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-x-hidden bg-white dark:bg-zinc-950 font-sans text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
      {/* Left drawer */}
      <div 
        className={cn(
          "absolute inset-y-0 left-0 z-40 flex w-[75%] flex-col bg-white transition-transform duration-300 dark:bg-zinc-900",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Top actions */}
        <div className="border-b border-stone-100 p-4 dark:border-zinc-800">
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
              className="flex w-full items-center gap-3 px-5 py-3 hover:bg-stone-50 dark:hover:bg-zinc-800/60"
            >
              <span className="text-2xl">{agent.avatar}</span>
              <div className="flex-1 text-left">
                <div className="text-[15px] text-zinc-900 dark:text-zinc-100">{agent.name}</div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500">{agent.description}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-300" />
            </button>
          ))}

          <div className="mt-4 border-t border-stone-100 px-5 pt-4 dark:border-zinc-800">
            <div className="mb-3 text-sm text-zinc-400">Recent chats</div>
            {chatHistory.map((group) => (
              <div key={group.date} className="mb-4">
                <div className="text-sm text-zinc-400 mb-2">{group.date}</div>
                {group.items.map((item) => (
                  <div key={item.id} className="mb-3">
                    <div className="flex items-center gap-2 text-[15px] text-zinc-900 dark:text-zinc-100">
                      <span>{item.icon}</span>
                      <span className="truncate">{item.title}</span>
                    </div>
                    {item.subItems?.map((sub, i) => (
                      <div key={i} className="flex items-center gap-2 ml-6 mt-1 text-sm text-zinc-500">
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
      <div className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-visible">
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
                <div className="flex items-center gap-2.5" aria-label="Minder">
                  <img
                    src="/minder-agent-mark.png"
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 object-contain drop-shadow-sm dark:opacity-90"
                  />
                  <div className="flex flex-col pt-1.5 font-sans">
                    <span className="text-[22px] font-bold leading-none tracking-tight text-zinc-900 dark:text-zinc-50">
                      inder
                    </span>
                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                      Copilot
                    </span>
                  </div>
                </div>
              </div>

              <MindChatComposer
                variant="home"
                value={agentHomeDraft}
                onChange={setAgentHomeDraft}
                onSubmit={submitAgentHomePrompt}
                placeholder=""
                chatMode={agentHomeChatMode}
                onChatModeChange={setAgentHomeChatMode}
                modelLabel={agentHomeModelLabel}
                onModelLabelChange={setAgentHomeModelLabel}
                voiceOn={agentHomeVoiceOn}
                onVoiceToggle={() =>
                  runWithAuth(() => {
                    setAgentHomeVoiceOn((prev) => {
                      const next = !prev
                      toast.message(next ? "Voice input" : "Voice input off", {
                        description: next ? "Demo: tap again to stop." : "Demo: no audio sent.",
                      })
                      return next
                    })
                  })
                }
                atTitle={linkSummary}
                onAtClick={() => setShowKBSelect(true)}
                onUploadClick={() =>
                  runWithAuth(() =>
                    toast.message("Upload file", { description: "Demo — pick a file from your device." })
                  )
                }
              />

              <div className="mt-4 w-full">
                <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
                    Content factory
                  </p>
                  <p
                    className="max-w-[55%] truncate text-[10px] font-medium text-zinc-400 dark:text-zinc-500"
                    title={linkSummary}
                  >
                    {linkSummary}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {STUDIO_OUTPUT_ROWS.flat().map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openStudioWithKind(item.id)}
                      className={cn(
                        "flex min-h-[2.75rem] flex-col justify-center rounded-lg border border-zinc-200/80 bg-white px-2 py-1.5 text-left",
                        "transition-colors hover:bg-zinc-50 active:scale-[0.99] dark:border-zinc-700/80 dark:bg-zinc-900/40 dark:hover:bg-zinc-800/50"
                      )}
                    >
                      <span className="block text-[11px] font-medium leading-tight tracking-tight text-zinc-800 dark:text-zinc-100">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block line-clamp-2 text-[9px] leading-snug text-zinc-500 dark:text-zinc-400">
                        {item.sub}
                      </span>
                    </button>
                  ))}
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
            onClick={() => setShowKBSelect(false)}
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
                      ? "border-zinc-400 bg-stone-100 dark:border-zinc-500 dark:bg-stone-50"
                      : "border-transparent bg-stone-50 dark:bg-zinc-800/40"
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
                      ? "border-zinc-400 bg-stone-100 dark:border-zinc-500 dark:bg-stone-50"
                      : "border-transparent bg-stone-50 dark:bg-zinc-800/40"
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
                          ? "border-2 border-zinc-400 bg-stone-100 dark:border-zinc-500 dark:bg-zinc-800"
                          : "border-2 border-transparent bg-stone-100 dark:bg-zinc-800/40"
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
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mind text-white dark:bg-zinc-400">
                          <span className="text-sm">✓</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowKBSelect(false)}
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

      {agentStudioSession && (
        <ContentFactoryModals
          open={agentStudioSession.factoryKind}
          onClose={() => setAgentStudioSession(null)}
          libraryName={resolveAgentStudioLibraryName(agentStudioSession)}
          onGenerateSubmit={(kind) => {
            setAgentStudioSession(null)
            toast.success("Queued", {
              description: `${kind} run started from your library scope (demo).`,
            })
          }}
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
    <div className="absolute inset-0 z-50 flex flex-col animate-in slide-in-from-bottom duration-200 bg-white dark:bg-zinc-950 font-sans dark:bg-zinc-950">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-stone-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <button type="button" onClick={onClose} className="text-[15px] text-zinc-600 dark:text-zinc-400">
          Cancel
        </button>
        <h1 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">New agent</h1>
        <button type="button" className="text-[15px] font-medium text-mind">
          Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Avatar */}
        <div className="flex justify-center py-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-zinc-100 flex items-center justify-center">
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-zinc-400" />
                <div className="h-2 w-2 rounded-full bg-zinc-400" />
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Autofill */}
        <div className="px-5 mb-4">
          <button type="button" className="flex items-center gap-1 text-sm text-mind">
            <Sparkles className="h-4 w-4" />
            Autofill
          </button>
        </div>

        {/* Name */}
        <div className="mx-5 mb-4 rounded-xl bg-white p-4 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. English coach"
              className="flex-1 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:bg-transparent dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mx-5 mb-4 rounded-xl bg-white p-4 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">Instructions</span>
            <button type="button" className="flex items-center gap-1 text-sm text-mind">
              <Sparkles className="h-4 w-4" />
              Polish
            </button>
          </div>
          <textarea
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder="How should this agent sound and behave?"
            rows={4}
            className="w-full resize-none text-[15px] leading-relaxed text-zinc-500 placeholder:text-zinc-400 focus:outline-none dark:bg-transparent dark:text-zinc-300 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Voice */}
        <div className="mx-5 mb-4 rounded-xl bg-white dark:bg-zinc-900">
          <button className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-zinc-700" />
              </div>
              <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Voice</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="text-sm">Edit</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
          <div className="border-t border-stone-100 dark:border-zinc-800" />
          <button className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-zinc-600" />
              </div>
              <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Public · anyone can chat</span>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400" />
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 py-4 text-zinc-600 transition-colors hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
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
    <div className="absolute inset-0 z-50 flex flex-col animate-in slide-in-from-right duration-200 bg-white font-sans dark:bg-zinc-950">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
        <button onClick={onClose} className="rounded-full p-1 hover:bg-stone-100 dark:hover:bg-zinc-800">
          <ChevronRight className="w-6 h-6 text-zinc-600 rotate-180" />
        </button>
        <h1 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Gallery</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-100 dark:border-zinc-800">
        <div className="flex overflow-x-auto px-4 py-3 gap-6 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-[15px] font-medium whitespace-nowrap pb-1 border-b-2 transition-colors",
                activeTab === tab
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                  : "border-transparent text-zinc-400 dark:text-zinc-500"
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
            className="flex items-start gap-3 border-b border-stone-100/70 px-5 py-4 dark:border-zinc-800/80"
          >
            <img 
              src={agent.avatar} 
              alt={agent.name}
              className="w-14 h-14 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{agent.name}</h3>
                {agent.isOfficial && (
                  <span className="rounded bg-stone-50 px-1.5 py-0.5 text-[10px] font-medium text-mind">
                    Official
                  </span>
                )}
              </div>
              <p className="mb-1.5 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">{agent.description}</p>
              <div className="flex flex-wrap items-center gap-1 text-xs text-zinc-400">
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
                  : "bg-stone-100 text-zinc-600"
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
      <div className="border-t border-stone-100 p-5 dark:border-zinc-800">
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

type ChatMsg = { id: string; role: "user" | "ai"; content: string }

const THINKING_PHASE_LABELS = [
  "Understanding your request",
  "Processing",
  "Composing reply",
] as const

const THINKING_PHASE_MS = 750
const STREAM_TICK_MS = 18
const STREAM_CHARS_PER_TICK = 3

type ActiveGeneration = {
  msgId: string
  phase: "thinking" | "streaming"
  thinkingPhase: number
}

function demoAiReply(agent: Agent, modeAtSend: AgentComposerMode, kbGround: string) {
  const agentNote =
    modeAtSend === "agent"
      ? "\n\n(Task mode: step-by-step delivery with a more autonomous path — demo.)"
      : ""
  const kbHint = kbGround ? `\n\n(Source scope: ${kbGround} — demo.)` : ""
  return `Hi, I'm ${agent.name}. Here are focused takeaways from your question:\n\n1. Align on goals and constraints\n2. Ground recommendations in your saved materials\n3. Use the content factory above the input for reports or mind maps${agentNote}${kbHint}`
}

// Agent chat screen
interface AgentChatProps {
  agent: Agent
  onBack: () => void
  /** Shown under the header when present — e.g. library-grounded “deep knowledge” entry */
  entryHint?: string
  requireAuthThen?: (run: () => void) => void
  /** Jump to library Studio; optional kind pre-opens that factory modal on the notebook. */
  onNavigateToKnowledge?: (factoryKind?: FactoryModalKind) => void
  /** When set, AI bubbles get save-to-library actions and the library-style composer. */
  knowledgeContext?: { kbName: string; contentTitle?: string }
  /** From Minder home composer — auto-send on mount. */
  initialPrompt?: string
  initialChatMode?: "dialog" | "agent"
  initialModelLabel?: string
}

/** dialog = multi-turn chat; agent = autonomous delivery (demo). */
type AgentComposerMode = "dialog" | "agent"

export function AgentChat({
  agent,
  onBack,
  entryHint,
  requireAuthThen,
  onNavigateToKnowledge,
  knowledgeContext,
  initialPrompt,
  initialChatMode,
  initialModelLabel,
}: AgentChatProps) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const avatar = agent.avatar ?? ""
  const showRemoteAvatar = agentAvatarIsRemoteUrl(avatar)
  const isLibraryChat = Boolean(knowledgeContext)
  const kbLabel = knowledgeContext?.kbName ?? ""
  const scopeLabel = knowledgeContext?.contentTitle
    ? `「${knowledgeContext.contentTitle}」· ${kbLabel}`
    : kbLabel

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [chatMode, setChatMode] = useState<AgentComposerMode>(initialChatMode ?? "dialog")
  const [kbMenuOpen, setKbMenuOpen] = useState(false)
  const [modelLabel, setModelLabel] = useState(initialModelLabel ?? "DS Fast")
  const [voiceOn, setVoiceOn] = useState(false)
  /** Optional KB grounding chosen via @ (demo; parent `knowledgeContext` still drives library entry). */
  const [pickedKbName, setPickedKbName] = useState<string | null>(null)
  const [qaHistoryOpen, setQaHistoryOpen] = useState(false)
  const [qaHistoryItems, setQaHistoryItems] = useState<MindQaHistoryItem[]>(() => seedDemoQaHistory())
  const [isThinking, setIsThinking] = useState(false)
  const [activeGeneration, setActiveGeneration] = useState<ActiveGeneration | null>(null)
  const [factoryModal, setFactoryModal] = useState<FactoryModalKind | null>(null)
  const [messageFeedback, setMessageFeedback] = useState<Record<string, "up" | "down">>({})
  const scrollRef = useRef<HTMLDivElement>(null)
  const genTimersRef = useRef<{
    phaseInterval?: ReturnType<typeof setInterval>
    streamInterval?: ReturnType<typeof setInterval>
    thinkingDone?: ReturnType<typeof setTimeout>
  }>({})
  const locale = "en-US" as const

  const thinkingStatusLabel =
    activeGeneration != null
      ? THINKING_PHASE_LABELS[
          Math.min(activeGeneration.thinkingPhase, THINKING_PHASE_LABELS.length - 1)
        ]
      : THINKING_PHASE_LABELS[0]

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking, activeGeneration, scrollToBottom])

  const clearGenerationTimers = useCallback(() => {
    const t = genTimersRef.current
    if (t.phaseInterval) clearInterval(t.phaseInterval)
    if (t.streamInterval) clearInterval(t.streamInterval)
    if (t.thinkingDone) clearTimeout(t.thinkingDone)
    genTimersRef.current = {}
  }, [])

  useEffect(() => () => clearGenerationTimers(), [clearGenerationTimers])

  const startGeneration = useCallback(
    (modeAtSend: AgentComposerMode, kbGround: string, replaceMsgId?: string) => {
      clearGenerationTimers()
      const fullText = demoAiReply(agent, modeAtSend, kbGround)
      const msgId = replaceMsgId ?? `a-${Date.now()}`

      setMessages((prev) => {
        if (replaceMsgId) {
          return prev.map((m) => (m.id === replaceMsgId ? { ...m, content: "" } : m))
        }
        return [...prev, { id: msgId, role: "ai", content: "" }]
      })

      setIsThinking(true)
      setActiveGeneration({ msgId, phase: "thinking", thinkingPhase: 0 })

      let phase = 0
      genTimersRef.current.phaseInterval = setInterval(() => {
        phase = Math.min(phase + 1, THINKING_PHASE_LABELS.length - 1)
        setActiveGeneration((g) => (g?.msgId === msgId ? { ...g, thinkingPhase: phase } : g))
      }, THINKING_PHASE_MS)

      genTimersRef.current.thinkingDone = setTimeout(() => {
        if (genTimersRef.current.phaseInterval) {
          clearInterval(genTimersRef.current.phaseInterval)
          genTimersRef.current.phaseInterval = undefined
        }

        setActiveGeneration((g) => (g?.msgId === msgId ? { ...g, phase: "streaming" } : g))

        let index = 0
        genTimersRef.current.streamInterval = setInterval(() => {
          index = Math.min(index + STREAM_CHARS_PER_TICK, fullText.length)
          const partial = fullText.slice(0, index)
          setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, content: partial } : m)))

          if (index >= fullText.length) {
            clearGenerationTimers()
            setIsThinking(false)
            setActiveGeneration(null)
          }
        }, STREAM_TICK_MS)
      }, THINKING_PHASE_MS * THINKING_PHASE_LABELS.length)
    },
    [agent, clearGenerationTimers]
  )

  const seededInitialPromptRef = useRef(false)

  useEffect(() => {
    const q = initialPrompt?.trim()
    if (!q || seededInitialPromptRef.current) return
    seededInitialPromptRef.current = true
    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: "user", content: q }
    const modeAtSend = initialChatMode ?? "dialog"
    const kbGround = (pickedKbName || (isLibraryChat ? kbLabel : "")).trim()
    setMessages([userMsg])
    setQaHistoryItems((prev) => [{ id: `qa-${Date.now()}`, at: Date.now(), query: q }, ...prev])
    startGeneration(modeAtSend, kbGround)
  }, [initialPrompt, initialChatMode, isLibraryChat, kbLabel, pickedKbName, startGeneration])

  const handleSend = () => {
    if (!input.trim() || isThinking) return
    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: "user", content: input.trim() }
    const modeAtSend = chatMode
    const kbGround = (pickedKbName || (isLibraryChat ? kbLabel : "")).trim()
    setMessages((prev) => [...prev, userMsg])
    setQaHistoryItems((prev) => [{ id: `qa-${Date.now()}`, at: Date.now(), query: userMsg.content }, ...prev])
    setInput("")
    setKbMenuOpen(false)
    startGeneration(modeAtSend, kbGround)
  }

  const trySend = () => runWithAuth(handleSend)

  const stopThinking = () => {
    clearGenerationTimers()
    setIsThinking(false)
    setActiveGeneration(null)
    toast.message("Stopped", { description: "Demo: generation cancelled." })
  }

  function regenerateMessage(msgId: string) {
    if (isThinking) return
    const kbGround = (pickedKbName || (isLibraryChat ? kbLabel : "")).trim()
    runWithAuth(() => startGeneration(chatMode, kbGround, msgId))
  }

  function startNewChat() {
    clearGenerationTimers()
    setIsThinking(false)
    setActiveGeneration(null)
    setMessages([])
    setInput("")
    setKbMenuOpen(false)
    setPickedKbName(null)
    setQaHistoryOpen(false)
    setMessageFeedback({})
    seededInitialPromptRef.current = false
    toast.message("New chat", { description: "Started a fresh thread (demo)." })
  }

  function toggleMessageFeedback(msgId: string, value: "up" | "down") {
    setMessageFeedback((prev) => {
      const next = { ...prev }
      if (next[msgId] === value) {
        delete next[msgId]
        return next
      }
      next[msgId] = value
      return next
    })
  }

  function saveAiReplyToLibrary(text: string) {
    runWithAuth(() =>
      toast.success("Saved to library", {
        description: scopeLabel ? `${scopeLabel} · Reply saved (demo)` : `${kbLabel} · Reply saved (demo)`,
      })
    )
  }

  function shareAiReply(text: string) {
    runWithAuth(() => {
      if (typeof navigator !== "undefined" && navigator.share) {
        void navigator.share({ title: "Mind", text }).catch(() => {
          toast.message("Share text copied", { description: text.slice(0, 120) + (text.length > 120 ? "…" : "") })
        })
      } else {
        void navigator.clipboard?.writeText(text).then(
          () => toast.message("Copied to clipboard"),
          () => toast.message("Share", { description: text.slice(0, 160) })
        )
      }
    })
  }

  const displayKbName = pickedKbName ?? (isLibraryChat ? kbLabel : null)

  const kbAtMenu = (
    <div className="max-h-52 w-[min(17.5rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-zinc-200/90 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        Knowledge base
      </p>
      {MOCK_KNOWLEDGE_BASES.slice(0, 8).map((kb) => (
        <button
          key={kb.id}
          type="button"
          onClick={() => {
            setPickedKbName(kb.name)
            setKbMenuOpen(false)
            toast.message("Knowledge base", { description: `Grounding set to “${kb.name}” (demo).` })
          }}
          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-[13px] text-zinc-800 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <span className="truncate">{kb.name}</span>
          {(pickedKbName === kb.name || (isLibraryChat && kbLabel === kb.name && !pickedKbName)) ? (
            <Check className="h-4 w-4 shrink-0 text-mind" strokeWidth={2.5} />
          ) : null}
        </button>
      ))}
    </div>
  )

  const libraryToolbarLead = isLibraryChat ? (
    <button
      type="button"
      className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 text-[11px] font-semibold text-mind transition-colors hover:bg-stone-100 dark:border-stone-200 dark:bg-stone-100 dark:text-mind/10 dark:hover:bg-zinc-800"
      onClick={() =>
        runWithAuth(() =>
          toast.success("Added to library", {
            description: scopeLabel
              ? `${scopeLabel} · Latest reply saved (demo).`
              : `${kbLabel} · Latest reply saved (demo).`,
          })
        )
      }
    >
      <Library className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
      Add to library
    </button>
  ) : null

  const composer = (
    <MindChatComposer
      variant="thread"
      value={input}
      onChange={setInput}
      onSubmit={trySend}
      placeholder={
        isLibraryChat
          ? "Ask this knowledge base…"
          : entryHint
            ? "Turn saved knowledge into an outcome…"
            : ""
      }
      chatMode={chatMode}
      onChatModeChange={setChatMode}
      showModeSelector
      toolbarLead={libraryToolbarLead}
      modelLabel={modelLabel}
      onModelLabelChange={setModelLabel}
      voiceOn={voiceOn}
      onVoiceToggle={() =>
        runWithAuth(() => {
          setVoiceOn((prev) => {
            const next = !prev
            toast.message(next ? "Voice input" : "Voice input off", {
              description: next ? "Demo: speak, tap again to stop." : "Demo: no audio uploaded.",
            })
            return next
          })
        })
      }
      atTitle={displayKbName ?? undefined}
      atMenu={kbAtMenu}
      atMenuOpen={kbMenuOpen}
      onAtMenuOpenChange={(open) => runWithAuth(() => setKbMenuOpen(open))}
      onUploadClick={() =>
        runWithAuth(() =>
          toast.message("Upload file", { description: "Demo — pick a file from your device." })
        )
      }
    />
  )

  const factoryLibraryLabel = scopeLabel ?? kbLabel

  const handleFactorySelect = (id: string) => {
    runWithAuth(() => {
      const resolved = resolveFactoryRailSelection(id as Parameters<typeof resolveFactoryRailSelection>[0])
      if (resolved.type === "mindmap") {
        toast.message("Mind map queued", { description: "Demo: added a mind map job from this chat." })
        return
      }
      setFactoryModal(resolved.kind)
    })
  }

  const handleFactoryGenerateSubmit = (kind: FactoryModalKind, settings?: FactoryGenerationSettings) => {
    setFactoryModal(null)
    if (isLibraryChat) {
      toast.success("Queued", {
        description: `${kind} run started for ${factoryLibraryLabel || "your library"} (demo).`,
      })
      onNavigateToKnowledge?.(kind)
      return
    }
    toast.success("Queued", {
      description: `${kind} generation queued (demo).`,
    })
  }

  const chatFooter = (
    <div className="w-full max-w-md">
      {isThinking ? (
        <div className="mx-1 mb-2 flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white px-3 py-2.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium text-zinc-900 dark:text-zinc-100">
              {activeGeneration?.phase === "streaming" ? "Generating reply" : thinkingStatusLabel}
            </p>
            <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
              {activeGeneration?.phase === "streaming" ? "Streaming output…" : "Thinking…"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => runWithAuth(stopThinking)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200/90 bg-zinc-50 text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            aria-label="Stop generation"
          >
            <Square className="h-3.5 w-3.5" strokeWidth={2.5} fill="currentColor" />
          </button>
        </div>
      ) : (
        <MindChatFactoryRail onSelect={handleFactorySelect} className="px-1" />
      )}
      {composer}
      <p className="pt-1.5 text-center text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">
        Content generated by AI
      </p>
    </div>
  )

  return (
    <div className="relative flex h-full flex-col bg-white dark:bg-zinc-950 font-sans dark:bg-zinc-950">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-stone-200/90 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <button type="button" onClick={onBack} className="-ml-2 rounded-full p-2 hover:bg-stone-100 dark:hover:bg-zinc-800">
          <ChevronRight className="h-6 w-6 rotate-180 text-zinc-700 dark:text-zinc-200" />
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
          <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{agent.name}</h3>
          <p className="line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">{agent.description}</p>
        </div>
        <MindChatHeaderActions
          onNewChat={() => runWithAuth(startNewChat)}
          onOpenHistory={() => runWithAuth(() => setQaHistoryOpen(true))}
        />
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
          <h3 className="mb-1 text-center text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Hi, I&apos;m {agent.name}
          </h3>
          {entryHint ? (
            <p className="mb-8 max-w-[280px] text-center text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              Flexible AI on your sources—toward concrete outcomes.
            </p>
          ) : (
            <div className="mb-8" aria-hidden />
          )}
          {chatFooter}
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((msg) => {
              const isMsgGenerating = activeGeneration?.msgId === msg.id
              const showThinkingInBubble =
                msg.role === "ai" && isMsgGenerating && activeGeneration?.phase === "thinking" && !msg.content
              const showStreamCursor =
                msg.role === "ai" && isMsgGenerating && activeGeneration?.phase === "streaming"

              return (
                <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[88%]", msg.role === "user" ? "" : "min-w-0")}>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3",
                        msg.role === "user"
                          ? "rounded-br-md bg-zinc-600 text-white"
                          : "rounded-bl-md border border-stone-200/90 bg-white text-zinc-800 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      )}
                    >
                      {showThinkingInBubble ? (
                        <p
                          className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400"
                          role="status"
                          aria-live="polite"
                        >
                          {
                            THINKING_PHASE_LABELS[
                              Math.min(
                                activeGeneration?.thinkingPhase ?? 0,
                                THINKING_PHASE_LABELS.length - 1
                              )
                            ]
                          }
                          …
                        </p>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {msg.content}
                          {showStreamCursor ? (
                            <span
                              className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-px animate-pulse bg-zinc-400 align-[-2px]"
                              aria-hidden
                            />
                          ) : null}
                        </p>
                      )}
                    </div>
                    {msg.role === "ai" && !isMsgGenerating && msg.content ? (
                      <MindChatMessageActions
                        locale={locale}
                        variant={isLibraryChat ? "library" : "default"}
                        feedback={messageFeedback[msg.id] ?? null}
                        onRegenerate={() => runWithAuth(() => regenerateMessage(msg.id))}
                        onSaveToLibrary={() => runWithAuth(() => saveAiReplyToLibrary(msg.content))}
                        onThumbsUp={() =>
                          runWithAuth(() => {
                            toggleMessageFeedback(msg.id, "up")
                            toast.success("Thanks", { description: "Marked as helpful." })
                          })
                        }
                        onThumbsDown={() =>
                          runWithAuth(() => {
                            toggleMessageFeedback(msg.id, "down")
                            toast.message("Noted", { description: "We will improve replies (demo)." })
                          })
                        }
                        onShare={() => runWithAuth(() => shareAiReply(msg.content))}
                        onCopy={() =>
                          runWithAuth(() => {
                            void navigator.clipboard?.writeText(msg.content).then(
                              () => toast.message("Copied"),
                              () => toast.message("Copy", { description: msg.content.slice(0, 120) })
                            )
                          })
                        }
                        onEdit={() =>
                          runWithAuth(() =>
                            toast.message("Edit", {
                              description: "Demo: continue editing this reply in a note.",
                            })
                          )
                        }
                        onMore={() =>
                          runWithAuth(() =>
                            toast.message("More", {
                              description: "Demo: report, export, or save.",
                            })
                          )
                        }
                      />
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="shrink-0 border-t border-stone-200/90 bg-white px-2 pt-1.5 dark:border-zinc-800 dark:bg-zinc-900">
            {chatFooter}
          </div>
        </>
      )}

      <MindChatQaHistoryPanel
        open={qaHistoryOpen}
        onClose={() => setQaHistoryOpen(false)}
        items={qaHistoryItems}
        title="Q&A history"
        retentionHint="Keeps the last 90 days of history for you."
        locale="en-US"
      />

      <ContentFactoryModals
        open={factoryModal}
        onClose={() => setFactoryModal(null)}
        libraryName={isLibraryChat ? factoryLibraryLabel || undefined : undefined}
        onGenerateSubmit={handleFactoryGenerateSubmit}
      />
    </div>
  )
}
