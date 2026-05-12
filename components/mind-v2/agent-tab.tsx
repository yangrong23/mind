"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { knowledgeBaseIconForTitle } from "@/components/mind-v2/knowledge-base-icon"
import { MOCK_KNOWLEDGE_BASES } from "@/components/mind-v2/knowledge-tab"
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
  Send,
  Mic,
  Volume2,
  Eye,
  Compass,
  Factory,
} from "lucide-react"

const STUDIO_OUTPUTS: { id: FactoryModalKind; label: string; sub: string }[] = [
  { id: "report", label: "Report", sub: "Structured write-up" },
  { id: "audio", label: "Audio overview", sub: "Narrated recap" },
  { id: "video", label: "Video brief", sub: "Short explainer" },
  { id: "flashcards", label: "Flashcards", sub: "Study deck" },
  { id: "quiz", label: "Quiz", sub: "Check understanding" },
  { id: "slides", label: "Slides", sub: "Outline to deck" },
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
  if (mode === "all") return "All libraries"
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
  const [agentStudioSession, setAgentStudioSession] = useState<StudioFromAgentHandoff | null>(null)

  const linkSummary = libraryLinkSummary(libraryLinkMode, pickedKbIds)

  function openStudioWithKind(factoryKind: FactoryModalKind) {
    const mode =
      libraryLinkMode === "pick" && pickedKbIds.length === 0 ? "auto" : libraryLinkMode
    const ids = mode === "pick" ? pickedKbIds : []
    setAgentStudioSession(
      normalizeStudioFromAgentHandoff({ factoryKind, libraryLinkMode: mode, pickedKbIds: ids })
    )
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#f5f5f4] text-zinc-800">
      {/* Left drawer */}
      <div 
        className={cn(
          "absolute inset-y-0 left-0 w-[75%] bg-white z-40 transition-transform duration-300 flex flex-col",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Top actions */}
        <div className="p-4 border-b border-gray-100">
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
              <Compass className="h-4 w-4" />
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
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50"
            >
              <span className="text-2xl">{agent.avatar}</span>
              <div className="flex-1 text-left">
                <div className="text-[15px] text-gray-900">{agent.name}</div>
                <div className="text-xs text-gray-400">{agent.description}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          ))}

          <div className="border-t border-gray-100 mt-4 pt-4 px-5">
            <div className="mb-3 text-sm text-zinc-400">Recent chats</div>
            {chatHistory.map((group) => (
              <div key={group.date} className="mb-4">
                <div className="text-sm text-gray-400 mb-2">{group.date}</div>
                {group.items.map((item) => (
                  <div key={item.id} className="mb-3">
                    <div className="flex items-center gap-2 text-[15px] text-gray-900">
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

          <div className="px-5 py-4 text-center text-sm text-zinc-400">History is kept for 90 days</div>
        </div>
      </div>

      {/* Drawer scrim */}
      {drawerOpen && (
        <div 
          className="absolute inset-0 z-30 bg-black/50"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Main surface */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 pt-3">
        <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-xl border border-stone-200 bg-white shadow-sm"
            aria-label="Open menu"
          >
            <div className="h-0.5 w-5 rounded-full bg-zinc-500" />
            <div className="h-0.5 w-5 rounded-full bg-zinc-500" />
          </button>
          <div className="text-right">
            <div className="text-[16px] font-semibold tracking-tight text-zinc-900">Minder</div>
            <div className="text-[12px] text-zinc-500">Libraries, agents & studio</div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-stretch justify-center gap-4 py-2">
          <p className="shrink-0 px-0.5 text-center text-[13px] leading-relaxed text-zinc-500">
            Link <span className="font-medium text-zinc-700">libraries</span> so results stay tied to your sources. Use{" "}
            <span className="font-medium text-zinc-700">agents</span> from the menu for focused workflows, or{" "}
            <span className="font-medium text-zinc-700">Studio</span> in the bar for narrated recaps, decks, and other outputs.
          </p>

          <div className="mx-auto w-full max-w-md shrink-0 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
          <input
            type="text"
            placeholder="Describe a topic, task, or instruction…"
            className="mb-3 w-full bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowStudioMenu(false)
                setShowKBSelect(true)
              }}
              className="flex max-w-[min(52%,11rem)] flex-col items-start gap-0 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-left hover:bg-stone-100"
            >
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-700">
                <Plus className="h-3.5 w-3.5 shrink-0" />
                Libraries
              </span>
              <span className="w-full truncate pl-5 text-[10px] font-normal leading-tight text-zinc-500">
                {linkSummary}
              </span>
            </button>
            <div className="relative min-w-0 flex-1 sm:flex-initial">
              <button
                type="button"
                onClick={() => setShowStudioMenu((v) => !v)}
                className="flex w-full items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-[12px] font-medium text-zinc-700 hover:bg-stone-100 sm:w-auto"
              >
                <Factory className="h-3.5 w-3.5 shrink-0" />
                Studio
              </button>
              {showStudioMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowStudioMenu(false)} />
                  <div className="absolute bottom-full left-0 z-50 mb-2 w-[min(100vw-2rem,18rem)] rounded-xl border border-stone-200 bg-white py-1.5 shadow-lg">
                    <p className="px-3 pb-1 pt-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                      Content factory
                    </p>
                    {STUDIO_OUTPUTS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setShowStudioMenu(false)
                          openStudioWithKind(item.id)
                        }}
                        className="w-full px-3 py-2.5 text-left hover:bg-stone-50"
                      >
                        <span className="block text-[14px] font-medium text-zinc-900">{item.label}</span>
                        <span className="block text-[11px] text-zinc-500">{item.sub}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-zinc-600 hover:bg-stone-200"
              aria-label="Voice input"
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white shadow-md shadow-sky-600/25 hover:bg-sky-700"
              aria-label="Send"
            >
              <Send className="h-5 w-5" />
            </button>
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

      {/* Library picker modal */}
      {showKBSelect && (
        <div className="absolute inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowKBSelect(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="px-5 pb-3">
              <h3 className="text-lg font-semibold text-gray-900">Link libraries</h3>
              <p className="mt-1 text-sm text-gray-500">
                Studio and replies use this scope. Pick <span className="font-medium text-zinc-700">All</span>, let Mind
                choose with <span className="font-medium text-zinc-700">Auto</span>, or shortlist libraries.
              </p>
            </div>
            <div className="px-5 pb-4 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setLibraryLinkMode("all")
                  setPickedKbIds([])
                }}
                className={cn(
                  "w-full rounded-xl border-2 px-3 py-2.5 text-left transition-colors",
                  libraryLinkMode === "all"
                    ? "border-zinc-500 bg-zinc-50"
                    : "border-transparent bg-gray-50"
                )}
              >
                <div className="font-medium text-gray-900">All libraries</div>
                <div className="text-xs text-gray-500">Use every linked base when generating</div>
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
                    ? "border-zinc-500 bg-zinc-50"
                    : "border-transparent bg-gray-50"
                )}
              >
                <div className="font-medium text-gray-900">Auto</div>
                <div className="text-xs text-gray-500">Mind picks matching libraries per run</div>
              </button>
            </div>
            <div className="px-5 pb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">Or choose</div>
            <div className="px-5 pb-6 max-h-52 overflow-y-auto">
              {MOCK_KNOWLEDGE_BASES.map((kb) => {
                const selected = pickedKbIds.includes(kb.id)
                const KbIcon = knowledgeBaseIconForTitle(kb.name, kb.description)
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
                      "mb-2 flex w-full items-center gap-3 rounded-xl p-3 transition-colors",
                      selected ? "border-2 border-zinc-500 bg-zinc-50" : "border-2 border-transparent bg-gray-50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
                        kb.color
                      )}
                    >
                      <KbIcon className="h-5 w-5 text-white" strokeWidth={2} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="font-medium text-gray-900">{kb.name}</div>
                      <div className="truncate text-xs text-gray-500">
                        {kb.count} items · {kb.description}
                      </div>
                    </div>
                    {selected && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-500">
                        <span className="text-sm text-white">✓</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="px-5 pb-6">
              <button
                type="button"
                onClick={() => setShowKBSelect(false)}
                className="w-full rounded-xl bg-gray-900 py-3 font-medium text-white"
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
          onGenerateSubmit={() => setAgentStudioSession(null)}
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
    <div className="absolute inset-0 z-50 bg-gray-50 flex flex-col animate-in slide-in-from-bottom duration-200">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <button type="button" onClick={onClose} className="text-[15px] text-gray-600">
          Cancel
        </button>
        <h1 className="text-lg font-semibold text-gray-900">New agent</h1>
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
        <div className="mx-5 mb-4 bg-white rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-medium text-gray-900">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. English coach"
              className="flex-1 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mx-5 mb-4 bg-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[15px] font-medium text-gray-900">Instructions</span>
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
            className="w-full text-[15px] text-gray-500 placeholder-gray-400 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Voice */}
        <div className="mx-5 mb-4 bg-white rounded-xl">
          <button className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-zinc-700" />
              </div>
              <span className="text-[15px] text-gray-900">Voice</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-sm">Edit</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
          <div className="border-t border-gray-100" />
          <button className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-zinc-600" />
              </div>
              <span className="text-[15px] text-gray-900">Public · anyone can chat</span>
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
            className="w-full flex items-center justify-center gap-2 py-4 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Compass className="w-5 h-5" />
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
    <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-right duration-200">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
          <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Agent gallery</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <div className="flex overflow-x-auto px-4 py-3 gap-6 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-[15px] font-medium whitespace-nowrap pb-1 border-b-2 transition-colors",
                activeTab === tab
                  ? "text-gray-900 border-gray-900"
                  : "text-gray-400 border-transparent"
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
            className="flex items-start gap-3 px-5 py-4 border-b border-gray-50"
          >
            <img 
              src={agent.avatar} 
              alt={agent.name}
              className="w-14 h-14 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                {agent.isOfficial && (
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
                    Official
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-1.5 line-clamp-2">{agent.description}</p>
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
      <div className="p-5 border-t border-gray-100">
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
}

export function AgentChat({ agent, onBack }: AgentChatProps) {
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
        placeholder="Message…"
        className="min-w-0 flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none"
      />
      <button type="button" className="p-2 hover:bg-gray-100 rounded-full" aria-label="Voice input">
        <Mic className="w-5 h-5 text-gray-500" />
      </button>
      <button
        type="button"
        onClick={handleSend}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-600 hover:bg-zinc-700"
        aria-label="Send"
      >
        <Send className="w-5 h-5 text-white" />
      </button>
    </div>
  )

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-4 py-3">
        <button type="button" onClick={onBack} className="-ml-2 rounded-full p-2 hover:bg-gray-100">
          <ChevronRight className="h-6 w-6 rotate-180 text-gray-700" />
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
          <h3 className="font-semibold text-gray-900">{agent.name}</h3>
          <p className="line-clamp-1 text-xs text-gray-500">{agent.description}</p>
        </div>
      </div>

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
          <h3 className="mb-1 text-center font-semibold text-gray-900">Hi, I&apos;m {agent.name}</h3>
          <p className="mb-8 max-w-[260px] text-center text-sm text-gray-500">Send a message to start</p>
          <div className="w-full max-w-md rounded-2xl border border-gray-200/90 bg-white p-3 shadow-sm">{composer}</div>
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
                      : "rounded-bl-md bg-white text-gray-800 shadow-sm"
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="shrink-0 border-t border-gray-100 bg-white p-4">{composer}</div>
        </>
      )}
    </div>
  )
}
