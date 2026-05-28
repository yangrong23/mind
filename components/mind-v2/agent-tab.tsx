"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { MOCK_KNOWLEDGE_BASES, type KnowledgeBase } from "@/lib/mock-knowledge-bases"
import { isNoteRecording } from "@/lib/note-status"
import { mockNotes } from "@/lib/mock-notes"
import { MindSaveToLibrarySheet } from "@/components/mind-v2/mind-save-to-library-sheet"
import {
  ContentFactoryModals,
  type FactoryGenerationSettings,
  type FactoryModalKind,
} from "@/components/mind-v2/content-factory-modals"
import { MindChatComposer } from "@/components/mind-v2/mind-chat-composer"
import { MindKbAtMenu } from "@/components/mind-v2/mind-kb-at-menu"
import { AgentExamplePromptRail } from "@/components/mind-v2/agent-example-prompt-rail"
import { AgentHomeComposerStack } from "@/components/mind-v2/agent-home-composer-stack"
import {
  MindChatFactoryRail,
  resolveFactoryRailSelection,
} from "@/components/mind-v2/mind-chat-factory-rail"
import { MindChatHeaderActions } from "@/components/mind-v2/mind-chat-header-actions"
import { MindChatMessageActions } from "@/components/mind-v2/mind-chat-message-actions"
import { MindarLogo, MindarLogoMark } from "@/components/mind-v2/mindar-logo"
import { MINDAR_MARK_SRC } from "@/lib/mindar-logo"
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
  AGENT_SCENARIO_TABS,
  agentsForPlazaTab,
  getPlazaTabHint,
  getMindAgentCatalog,
  getMindAgentProfile,
  MINDAR_COPILOT_PROFILE,
  MINDAR_DEFAULT_SCENARIO_AGENTS,
  scenarioLabel,
  type AgentCapabilityProfile,
  type AgentScenarioTabId,
  type MindAgent,
} from "@/lib/mind-agent-catalog"
import { getAgentExamplePrompts, type AgentExamplePrompt } from "@/lib/agent-chat-example-prompts"
import { NOTE_WRITING_PROMPTS } from "@/lib/note-writing-prompts"
import { AgentMultiRoleBlurb, AgentMultiRoleFlow } from "@/components/mind-v2/agent-profile-ui"
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
  Bot,
  Globe,
  AtSign,
  AudioLines,
  Search,
  SquarePen,
} from "lucide-react"

export interface Agent {
  id: number
  name: string
  description: string
  avatar: string
  color: string
  chatCount?: string
  author?: string
  isOfficial?: boolean
  scenario?: MindAgent["scenario"]
  profile?: AgentCapabilityProfile
}

/** Default agent when sending from the Mindar home composer. */
export const MINDAR_COPILOT_AGENT: Agent = {
  id: 0,
  name: "Mindar",
  description: "Your knowledge assistant",
  avatar: MINDAR_MARK_SRC,
  color: "from-zinc-500 to-stone-600",
}

export type AgentChatLaunchOptions = {
  initialPrompt?: string
}

/** Default scenario agents (contacts list excludes Mindar id 0). */
export const MINDAR_DEMO_MY_AGENTS: Agent[] = MINDAR_DEFAULT_SCENARIO_AGENTS

export const MINDAR_DEMO_CHAT_HISTORY = [
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
  /** Desktop split: hide drawer; parent shows agent list */
  webLayout?: boolean
}

const myAgents = MINDAR_DEMO_MY_AGENTS

const AGENT_LINKABLE_NOTES = mockNotes
  .filter((n) => !isNoteRecording(n))
  .slice(0, 8)
  .map((n) => ({ id: n.id, title: n.title }))

type AgentContact = Agent & {
  preview: string
  timeLabel?: string
}

const DEFAULT_CONTACT_TIME_LABELS = ["Yesterday", "Mon", "Sun", "Sat", "Fri", "Thu"] as const

function buildAgentContacts(): AgentContact[] {
  return [
    {
      ...MINDAR_COPILOT_AGENT,
      profile: MINDAR_COPILOT_PROFILE,
      preview: MINDAR_COPILOT_PROFILE.tagline,
      timeLabel: "Now",
    },
    ...myAgents.map((a, i) => {
      const catalog = getMindAgentCatalog(a.id)
      return {
        ...a,
        scenario: catalog?.scenario ?? a.scenario,
        profile: catalog?.profile ?? getMindAgentProfile(a.id),
        preview: catalog?.contactPreview ?? catalog?.profile?.tagline ?? a.description,
        timeLabel: DEFAULT_CONTACT_TIME_LABELS[i] ?? "",
      }
    }),
  ]
}

function agentAvatarIsRemoteUrl(avatar: string) {
  return /^https?:\/\//i.test(avatar) || avatar.startsWith("/")
}

export function AgentContactAvatar({
  agent,
  className,
  size = 48,
}: {
  agent: Agent
  className?: string
  size?: number
}) {
  const remote = agentAvatarIsRemoteUrl(agent.avatar)
  if (agent.id === MINDAR_COPILOT_AGENT.id) {
    return <MindarLogoMark size={size} className={className} />
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xl ring-1 ring-stone-200/60 dark:ring-zinc-700",
        agent.color,
        className
      )}
      style={{ width: size, height: size }}
    >
      {remote ? (
        <img src={agent.avatar} alt="" className="h-full w-full rounded-full object-cover" />
      ) : (
        <span
          className={cn(
            "leading-none",
            size >= 72 ? "text-3xl" : size >= 48 ? "text-xl" : "text-lg"
          )}
          aria-hidden
        >
          {agent.avatar}
        </span>
      )}
    </div>
  )
}

function AgentContactRow({ contact, onOpen }: { contact: AgentContact; onOpen: () => void }) {
  const profile = contact.profile ?? getMindAgentProfile(contact.id)
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-stone-50/90 active:bg-stone-100/80 dark:hover:bg-zinc-900/60 dark:active:bg-zinc-800/80"
    >
      <AgentContactAvatar agent={contact} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-[16px] font-semibold text-zinc-900 dark:text-zinc-50">{contact.name}</span>
          {contact.isOfficial ? (
            <span className="shrink-0 rounded-md bg-mind/10 px-1.5 py-0.5 text-[10px] font-semibold text-mind dark:bg-mind/20">
              Official
            </span>
          ) : null}
        </div>
        {profile?.multiRole ? (
          <AgentMultiRoleBlurb profile={profile} className="mt-0.5" />
        ) : profile ? (
          <p className="mt-0.5 line-clamp-2 text-[12px] font-medium text-zinc-600 dark:text-zinc-400">
            {profile.tagline}
          </p>
        ) : (
          <p className="mt-0.5 line-clamp-1 text-[13px] text-zinc-500 dark:text-zinc-400">{contact.preview}</p>
        )}
      </div>
      {contact.timeLabel ? (
        <span className="shrink-0 pt-0.5 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
          {contact.timeLabel}
        </span>
      ) : null}
    </button>
  )
}

function AgentContactsView({
  onOpenAgent,
  onDiscover,
  onNewAgent,
  onSearch,
}: {
  onOpenAgent: (agent: Agent) => void
  onDiscover: () => void
  onNewAgent: () => void
  onSearch: () => void
}) {
  const contacts = buildAgentContacts()

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-zinc-950">
      <div className="shrink-0 border-b border-stone-100/90 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-2.5">
          <button
            type="button"
            onClick={onDiscover}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-zinc-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
            aria-label="Discover agents"
          >
            <LayoutDashboard className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <h1 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Agents</h1>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={onSearch}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-zinc-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
              aria-label="Search agents"
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={onNewAgent}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-zinc-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
              aria-label="New chat"
            >
              <SquarePen className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="divide-y divide-stone-100/90 dark:divide-zinc-800/80">
          {contacts.map((contact) => (
            <AgentContactRow key={contact.id} contact={contact} onOpen={() => onOpenAgent(contact)} />
          ))}
        </div>
        <div className="h-4 shrink-0" aria-hidden />
      </div>
    </div>
  )
}

function libraryLinkSummary(
  mode: StudioLibraryLinkMode,
  pickedKbIds: number[],
  pickedNoteId: number | null
): string {
  if (pickedNoteId != null) {
    const note = AGENT_LINKABLE_NOTES.find((n) => n.id === pickedNoteId)
    if (note) return note.title.length > 28 ? `${note.title.slice(0, 28)}…` : note.title
  }
  if (mode === "all") return "All libraries"
  if (pickedKbIds.length === 0) return "All libraries"
  const rows = pickedKbIds
    .map((id) => MOCK_KNOWLEDGE_BASES.find((k) => k.id === id))
    .filter((x): x is (typeof MOCK_KNOWLEDGE_BASES)[number] => Boolean(x))
  if (rows.length === 0) return "All libraries"
  if (rows.length === 1) return rows[0].name
  return `${rows[0].name} +${rows.length - 1}`
}

export function AgentTab({ onAgentChat, requireAuthThen, webLayout = false }: AgentTabProps) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const [showCreateSheet, setShowCreateSheet] = useState(false)
  const [showExplore, setShowExplore] = useState(false)
  const [agentHomeKbMenuOpen, setAgentHomeKbMenuOpen] = useState(false)
  const [libraryLinkMode, setLibraryLinkMode] = useState<StudioLibraryLinkMode>("all")
  const [pickedKbIds, setPickedKbIds] = useState<number[]>([])
  const [pickedNoteId, setPickedNoteId] = useState<number | null>(null)
  const [agentHomeDraft, setAgentHomeDraft] = useState("")
  const [agentStudioSession, setAgentStudioSession] = useState<StudioFromAgentHandoff | null>(null)
  const [agentHomeVoiceOn, setAgentHomeVoiceOn] = useState(false)
  const [agentHomeSelectedFactory, setAgentHomeSelectedFactory] = useState<FactoryModalKind | null>(null)
  const mindarExamplePrompts = getAgentExamplePrompts(0)

  const linkSummary = libraryLinkSummary(libraryLinkMode, pickedKbIds, pickedNoteId)

  function openStudioWithKind(factoryKind: FactoryModalKind) {
    const mode =
      libraryLinkMode === "pick" && pickedKbIds.length === 0 ? "all" : libraryLinkMode
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
      onAgentChat(MINDAR_COPILOT_AGENT, {
        initialPrompt: q,
      })
      setAgentHomeDraft("")
    })
  }

  const openAgentChat = (agent: Agent) => runWithAuth(() => onAgentChat(agent))

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-x-hidden bg-white font-sans text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
      {!webLayout ? (
        <AgentContactsView
          onOpenAgent={openAgentChat}
          onDiscover={() => runWithAuth(() => setShowExplore(true))}
          onNewAgent={() => runWithAuth(() => onAgentChat(MINDAR_COPILOT_AGENT))}
          onSearch={() =>
            runWithAuth(() =>
              toast.message("Search agents", { description: "Find agents by name or topic (demo)." })
            )
          }
        />
      ) : (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-visible">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center pt-4">
          <div
            className="aspect-[4/3] w-[min(100%,380px)] max-h-[48vh] bg-[radial-gradient(ellipse_70%_58%_at_50%_45%,rgba(24,24,27,0.06),transparent_68%)] dark:bg-[radial-gradient(ellipse_70%_58%_at_50%_45%,rgba(255,255,255,0.05),transparent_68%)]"
            aria-hidden
          />
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-12 sm:pt-14">
            <div className="flex flex-col items-center pt-8 sm:pt-10">
              <div className="flex flex-col items-center" aria-label="Mindar">
                <MindarLogo height={26} className="max-w-[5.5rem] dark:opacity-95" />
              </div>
              <h2 className="mt-6 text-center text-[22px] font-semibold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-[26px]">
                What can I help you with?
              </h2>
              <AgentExamplePromptRail
                layout="wrap"
                prompts={mindarExamplePrompts}
                onSelect={(prompt) => runWithAuth(() => setAgentHomeDraft(prompt))}
                className="mt-6 w-full max-w-3xl"
              />
            </div>

            <div className="mt-auto w-full max-w-2xl shrink-0 self-center pt-6 sm:pt-8">
              <AgentHomeComposerStack
                factoryPlacement="inside"
                selectedFactoryId={agentHomeSelectedFactory}
                onFactorySelect={(kind) =>
                  runWithAuth(() => {
                    setAgentHomeSelectedFactory(kind)
                    openStudioWithKind(kind)
                  })
                }
                examplePrompts={undefined}
                onExampleSelect={undefined}
                composer={
                  <MindChatComposer
                    variant="home"
                    value={agentHomeDraft}
                    onChange={setAgentHomeDraft}
                    onSubmit={submitAgentHomePrompt}
                    placeholder="Ask anything…"
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
                    factoryToolbar={
                      <MindChatFactoryRail
                        railStyle="inline"
                        density="compact"
                        selectedId={agentHomeSelectedFactory}
                        onSelect={(id) =>
                          runWithAuth(() => {
                            const kind = resolveFactoryRailSelection(id)
                            setAgentHomeSelectedFactory(kind)
                            openStudioWithKind(kind)
                          })
                        }
                      />
                    }
                    atTitle={linkSummary}
                    atMenu={
                      <MindKbAtMenu
                        scopeShortcuts={[
                          {
                            id: "all",
                            label: "All libraries",
                            selected: libraryLinkMode === "all" && pickedNoteId == null,
                            onSelect: () => {
                              setLibraryLinkMode("all")
                              setPickedKbIds([])
                              setPickedNoteId(null)
                              setAgentHomeKbMenuOpen(false)
                            },
                          },
                        ]}
                        items={MOCK_KNOWLEDGE_BASES.slice(0, 6).map((kb) => ({ id: kb.id, name: kb.name }))}
                        isItemSelected={(kb) =>
                          libraryLinkMode === "pick" && pickedKbIds.includes(kb.id) && pickedNoteId == null
                        }
                        onSelect={(kb) => {
                          setLibraryLinkMode("pick")
                          setPickedKbIds([kb.id])
                          setPickedNoteId(null)
                          setAgentHomeKbMenuOpen(false)
                        }}
                        noteItems={AGENT_LINKABLE_NOTES}
                        isNoteSelected={(note) => pickedNoteId === note.id}
                        onNoteSelect={(note) => {
                          setPickedNoteId(note.id)
                          setLibraryLinkMode("all")
                          setPickedKbIds([])
                          setAgentHomeKbMenuOpen(false)
                        }}
                      />
                    }
                    atMenuOpen={agentHomeKbMenuOpen}
                    onAtMenuOpenChange={setAgentHomeKbMenuOpen}
                    onUploadClick={() =>
                      runWithAuth(() =>
                        toast.message("Upload file", { description: "Demo — pick a file from your device." })
                      )
                    }
                  />
                }
              />
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Create agent sheet */}
      {showCreateSheet && (
        <CreateAgentSheet onClose={() => setShowCreateSheet(false)} />
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

      {agentStudioSession && (
        <ContentFactoryModals
          open={agentStudioSession.factoryKind}
          onClose={() => setAgentStudioSession(null)}
          libraryName={resolveAgentStudioLibraryName(agentStudioSession)}
          modalDensity="compact"
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
function CreateAgentSheet({ onClose }: { onClose: () => void }) {
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
  const [activeTab, setActiveTab] = useState<AgentScenarioTabId>("featured")
  const [selectedAgents, setSelectedAgents] = useState<number[]>([])
  const visibleAgents = agentsForPlazaTab(activeTab)

  const toggleAgent = (id: number) => {
    setSelectedAgents((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col animate-in slide-in-from-right duration-200 bg-white font-sans dark:bg-zinc-950">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
        <button onClick={onClose} className="rounded-full p-1 hover:bg-stone-100 dark:hover:bg-zinc-800">
          <ChevronRight className="h-6 w-6 rotate-180 text-zinc-600" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Agent plaza</h1>
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">By knowledge scenario</p>
        </div>
      </div>

      {/* Scenario tabs */}
      <div className="border-b border-stone-100 dark:border-zinc-800">
        <div className="scrollbar-hide flex gap-5 overflow-x-auto px-4 py-3">
          {AGENT_SCENARIO_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "shrink-0 whitespace-nowrap border-b-2 pb-1 text-[15px] font-medium transition-colors",
                activeTab === tab.id
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                  : "border-transparent text-zinc-400 dark:text-zinc-500"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {getPlazaTabHint(activeTab) ? (
        <div className="border-b border-stone-100/90 bg-stone-50/80 px-5 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-400">{getPlazaTabHint(activeTab)}</p>
        </div>
      ) : null}

      {/* Agent list */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {visibleAgents.length === 0 ? (
          <p className="px-5 py-10 text-center text-[14px] text-zinc-500">No agents in this scenario yet.</p>
        ) : (
          visibleAgents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-start gap-3 border-b border-stone-100/70 px-5 py-4 dark:border-zinc-800/80"
            >
              <button
                type="button"
                onClick={() => onSelect(agent)}
                className="flex min-w-0 flex-1 items-start gap-3 text-left"
              >
              <AgentContactAvatar agent={agent} className="h-14 w-14 rounded-xl text-2xl" />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{agent.name}</h3>
                  {agent.isOfficial ? (
                    <span className="rounded bg-mind/10 px-1.5 py-0.5 text-[10px] font-semibold text-mind dark:bg-mind/20">
                      Official
                    </span>
                  ) : null}
                </div>
                {agent.profile?.multiRole && agent.profile.teamRoles?.length ? (
                  <AgentMultiRoleFlow roles={agent.profile.teamRoles} variant="inline" className="mt-1" />
                ) : (
                  <p className="text-[13px] leading-snug text-zinc-600 dark:text-zinc-400">{agent.profile?.tagline}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-zinc-400">
                  {agent.chatCount ? <span>{agent.chatCount}</span> : null}
                  {agent.author ? (
                    <>
                      {agent.chatCount ? <span aria-hidden>·</span> : null}
                      <span>{agent.author}</span>
                    </>
                  ) : null}
                </div>
              </div>
              </button>
              <button
                type="button"
                onClick={() => toggleAgent(agent.id)}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                  selectedAgents.includes(agent.id)
                    ? "bg-mind/10 text-mind dark:bg-mind/20"
                    : "bg-stone-100 text-zinc-600 dark:bg-zinc-800"
                )}
                aria-label={selectedAgents.includes(agent.id) ? "Remove from picks" : "Add to picks"}
              >
                {selectedAgents.includes(agent.id) ? (
                  <span className="text-lg leading-none">✓</span>
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </button>
            </div>
          ))
        )}
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

type ChatMsg = { id: string; role: "user" | "ai"; content: string }

function lastUserQueryBefore(aiMsgId: string, msgs: ChatMsg[]): string {
  const idx = msgs.findIndex((m) => m.id === aiMsgId)
  if (idx <= 0) return ""
  for (let i = idx - 1; i >= 0; i--) {
    if (msgs[i].role === "user") return msgs[i].content
  }
  return ""
}

function demoAiReply(
  userQuery: string,
  agent: Agent,
  modeAtSend: AgentComposerMode,
  kbGround: string,
  noteTitle?: string
) {
  const q = userQuery.trim()
  const topic = q.length > 120 ? `${q.slice(0, 120)}…` : q || "your question"
  const scopeLine = kbGround ? `\n\nSources: ${kbGround}` : ""
  const noteLine = noteTitle ? `\n\nNote: “${noteTitle}”` : ""

  if (modeAtSend === "agent") {
    return `Re: ${topic}\n\nI'll handle this as a task: scan your notes and libraries, then post a concise outcome here.${noteLine}${scopeLine}\n\n(Task mode — demo.)`
  }

  if (noteTitle) {
    return `Re: ${topic}\n\nFrom this capture (“${noteTitle}”): the summary and transcript support a direct answer—key points are tied to what you recorded, not generic web results.${scopeLine}\n\nAsk for bullets, action items, or a follow-up email draft.`
  }

  return `Re: ${topic}\n\nHere's a direct answer from your saved material: start with the latest note on this topic, then any linked library summary. That usually gives you a clear read without extra setup.${scopeLine}\n\nNeed a longer write-up? Use Studio above the input for a report or flashcards.`
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
  /** Mobile note detail / rich-text editor — grounded on a single capture. */
  noteContext?: { noteTitle: string; notePreview?: string }
  /** From Mindar home composer — auto-send on mount. */
  initialPrompt?: string
  /** Web split pane: no back chevron; wider transcript */
  embedded?: boolean
  /** Parent supplies chrome (e.g. web Notes AI writing column). */
  suppressEmbeddedHeader?: boolean
  /** Quick questions for note co-writing empty state; defaults to NOTE_WRITING_PROMPTS. */
  noteWritingPrompts?: AgentExamplePrompt[]
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
  noteContext,
  initialPrompt,
  embedded = false,
  suppressEmbeddedHeader = false,
  noteWritingPrompts: noteWritingPromptsProp,
}: AgentChatProps) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const avatar = agent.avatar ?? ""
  const showRemoteAvatar = agentAvatarIsRemoteUrl(avatar)
  const isLibraryChat = Boolean(knowledgeContext)
  const isNoteChat = Boolean(noteContext)
  const kbLabel = knowledgeContext?.kbName ?? ""
  const noteTitle = noteContext?.noteTitle ?? ""
  const scopeLabel = knowledgeContext?.contentTitle
    ? `「${knowledgeContext.contentTitle}」· ${kbLabel}`
    : isNoteChat
      ? noteTitle
      : kbLabel

  const agentProfile =
    agent.profile ?? getMindAgentProfile(agent.id) ?? (agent.id === 0 ? MINDAR_COPILOT_PROFILE : undefined)
  const agentScenario = agent.scenario ?? getMindAgentCatalog(agent.id)?.scenario

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [kbMenuOpen, setKbMenuOpen] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
  /** Optional KB / note grounding chosen via @ (demo). */
  const [pickedKbName, setPickedKbName] = useState<string | null>(null)
  const [pickedNoteTitle, setPickedNoteTitle] = useState<string | null>(null)
  const [qaHistoryOpen, setQaHistoryOpen] = useState(false)
  const [qaHistoryItems, setQaHistoryItems] = useState<MindQaHistoryItem[]>(() => seedDemoQaHistory())
  const [factoryModal, setFactoryModal] = useState<FactoryModalKind | null>(null)
  const [selectedFactoryKind, setSelectedFactoryKind] = useState<FactoryModalKind | null>(null)
  const examplePrompts = getAgentExamplePrompts(agent.id)
  const [messageFeedback, setMessageFeedback] = useState<Record<string, "up" | "down">>({})
  const [saveToLibrarySheet, setSaveToLibrarySheet] = useState<{ text: string } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const locale = "en-US" as const

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const startGeneration = useCallback(
    (modeAtSend: AgentComposerMode, kbGround: string, userQuery: string, replaceMsgId?: string) => {
      const fullText = demoAiReply(userQuery, agent, modeAtSend, kbGround, isNoteChat ? noteTitle : undefined)
      const msgId = replaceMsgId ?? `a-${Date.now()}`

      setMessages((prev) => {
        if (replaceMsgId) {
          return prev.map((m) => (m.id === replaceMsgId ? { ...m, content: fullText } : m))
        }
        return [...prev, { id: msgId, role: "ai", content: fullText }]
      })
    },
    [agent, isNoteChat, noteTitle]
  )

  const seededInitialPromptRef = useRef(false)

  useEffect(() => {
    const q = initialPrompt?.trim()
    if (!q || seededInitialPromptRef.current) return
    seededInitialPromptRef.current = true
    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: "user", content: q }
    const modeAtSend: AgentComposerMode = "dialog"
    const kbGround = (
      pickedNoteTitle ||
      pickedKbName ||
      (isLibraryChat ? kbLabel : isNoteChat ? noteTitle : "")
    ).trim()
    setMessages([userMsg])
    setQaHistoryItems((prev) => [{ id: `qa-${Date.now()}`, at: Date.now(), query: q }, ...prev])
    startGeneration(modeAtSend, kbGround, q)
  }, [initialPrompt, isLibraryChat, isNoteChat, kbLabel, noteTitle, pickedKbName, pickedNoteTitle, startGeneration])

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: "user", content: input.trim() }
    const modeAtSend: AgentComposerMode = "dialog"
    const kbGround = (
      pickedNoteTitle ||
      pickedKbName ||
      (isLibraryChat ? kbLabel : isNoteChat ? noteTitle : "")
    ).trim()
    setMessages((prev) => [...prev, userMsg])
    setQaHistoryItems((prev) => [{ id: `qa-${Date.now()}`, at: Date.now(), query: userMsg.content }, ...prev])
    setInput("")
    setKbMenuOpen(false)
    startGeneration(modeAtSend, kbGround, userMsg.content)
  }

  const trySend = () => runWithAuth(handleSend)

  function regenerateMessage(msgId: string) {
    const kbGround = (
      pickedNoteTitle ||
      pickedKbName ||
      (isLibraryChat ? kbLabel : isNoteChat ? noteTitle : "")
    ).trim()
    const userQuery = lastUserQueryBefore(msgId, messages)
    runWithAuth(() => startGeneration("dialog", kbGround, userQuery, msgId))
  }

  function startNewChat() {
    setMessages([])
    setInput("")
    setKbMenuOpen(false)
    setPickedKbName(null)
    setPickedNoteTitle(null)
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

  function openSaveToLibrarySheet(text: string) {
    const body = text.trim()
    if (!body) {
      toast.error("Nothing to save", { description: "Wait for a reply before archiving." })
      return
    }
    runWithAuth(() => setSaveToLibrarySheet({ text: body }))
  }

  function confirmSaveToLibrary(kb: KnowledgeBase) {
    const excerpt =
      saveToLibrarySheet?.text.slice(0, 120) + (saveToLibrarySheet && saveToLibrarySheet.text.length > 120 ? "…" : "")
    setSaveToLibrarySheet(null)
    toast.success("Saved to library", {
      description: scopeLabel
        ? `“${kb.name}” · ${scopeLabel} (demo)`
        : `“${kb.name}”${excerpt ? ` · ${excerpt}` : ""} (demo)`,
    })
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

  const displayScopeName =
    pickedNoteTitle ??
    pickedKbName ??
    (isLibraryChat ? kbLabel : isNoteChat ? noteTitle : null)

  const kbAtMenu = (
    <MindKbAtMenu
      scopeShortcuts={[
        {
          id: "all",
          label: "All libraries",
          selected: !pickedKbName && !pickedNoteTitle,
          onSelect: () => {
            setPickedKbName(null)
            setPickedNoteTitle(null)
            setKbMenuOpen(false)
          },
        },
      ]}
      items={MOCK_KNOWLEDGE_BASES.slice(0, 6).map((kb) => ({ id: kb.id, name: kb.name }))}
      selectedName={displayScopeName}
      isItemSelected={(kb) =>
        pickedKbName === kb.name || (isLibraryChat && kbLabel === kb.name && !pickedKbName && !pickedNoteTitle)
      }
      onSelect={(kb) => {
        setPickedKbName(kb.name)
        setPickedNoteTitle(null)
        setKbMenuOpen(false)
        toast.message("Knowledge base", { description: `Grounding set to “${kb.name}” (demo).` })
      }}
      noteItems={AGENT_LINKABLE_NOTES}
      isNoteSelected={(note) => pickedNoteTitle === note.title}
      onNoteSelect={(note) => {
        setPickedNoteTitle(note.title)
        setPickedKbName(null)
        setKbMenuOpen(false)
        toast.message("Note linked", { description: `Grounding set to “${note.title}” (demo).` })
      }}
    />
  )

  const latestAiReply = [...messages].reverse().find((m) => m.role === "ai" && m.content.trim())?.content ?? ""
  /** Agent contact / copilot threads — same composer + factory grid as the agent home. */
  const isContactStyleChat = !isLibraryChat && !isNoteChat

  const libraryToolbarLead = isLibraryChat ? (
    <button
      type="button"
      className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 text-[11px] font-semibold text-mind transition-colors hover:bg-stone-100 dark:border-stone-200 dark:bg-stone-100 dark:text-mind/10 dark:hover:bg-zinc-800"
      onClick={() => openSaveToLibrarySheet(latestAiReply)}
    >
      <Library className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
      Add to library
    </button>
  ) : null

  const composer = (
    <MindChatComposer
      variant={isContactStyleChat ? "home" : "thread"}
      value={input}
      onChange={setInput}
      onSubmit={trySend}
      placeholder={
        isLibraryChat
          ? "Ask this knowledge base…"
          : isNoteChat
            ? embedded
              ? "Refine this note or ask for a rewrite…"
              : "Ask about this note…"
            : entryHint
              ? "Turn saved knowledge into an outcome…"
              : ""
      }
      toolbarLead={libraryToolbarLead}
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
      atTitle={displayScopeName ?? undefined}
      atMenu={kbAtMenu}
      atMenuOpen={kbMenuOpen}
      onAtMenuOpenChange={setKbMenuOpen}
      showAtButton
      onUploadClick={() =>
        runWithAuth(() =>
          toast.message("Upload file", { description: "Demo — pick a file from your device." })
        )
      }
      showScreenshotButton={isNoteChat}
      onScreenshotClick={() =>
        runWithAuth(() =>
          toast.message("Screenshot", { description: "Demo — capture a region and attach to the chat." })
        )
      }
    />
  )

  const factoryLibraryLabel = scopeLabel ?? kbLabel

  const openFactoryModal = (kind: FactoryModalKind) => {
    runWithAuth(() => setFactoryModal(kind))
  }

  const handleFactorySelect = (kind: FactoryModalKind) => {
    setSelectedFactoryKind(kind)
    openFactoryModal(kind)
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

  const noteWritingPrompts =
    noteWritingPromptsProp ?? (isNoteChat ? NOTE_WRITING_PROMPTS : [])
  const showNoteWritingPrompts =
    messages.length === 0 && isNoteChat && noteWritingPrompts.length > 0
  const showHeroExamplePrompts =
    messages.length === 0 && !isNoteChat && examplePrompts.length > 0

  const chatFooter = (
    <div className={cn("w-full", embedded ? "max-w-3xl mx-auto" : "max-w-2xl mx-auto")}>
      <AgentHomeComposerStack
        showFactoryRail={!isNoteChat}
        factoryRailLayout="scroll"
        promptLayout="stack"
        selectedFactoryId={selectedFactoryKind}
        onFactorySelect={handleFactorySelect}
        examplePrompts={showHeroExamplePrompts ? undefined : isNoteChat ? undefined : examplePrompts}
        onExampleSelect={
          showHeroExamplePrompts ? undefined : isNoteChat ? undefined : (prompt) => runWithAuth(() => setInput(prompt))
        }
        composer={composer}
      />
    </div>
  )

  return (
    <div className="relative flex h-full flex-col bg-white dark:bg-zinc-950 font-sans dark:bg-zinc-950">
      {/* Header */}
      {embedded ? (
        suppressEmbeddedHeader ? null : (
          <div className="flex shrink-0 items-center gap-3 border-b border-stone-200/90 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="w-10 shrink-0" aria-hidden />
            <AgentContactAvatar agent={agent} size={40} />
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{agent.name}</h3>
              <p className="min-w-0 truncate text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {agentProfile?.multiRole && agentProfile.teamRoles?.length ? (
                  <AgentMultiRoleBlurb profile={agentProfile} variant="header" />
                ) : (
                  agentProfile?.tagline ?? agent.description
                )}
              </p>
            </div>
            <MindChatHeaderActions
              newChatAccent={false}
              onNewChat={() => runWithAuth(startNewChat)}
              onOpenHistory={() => runWithAuth(() => setQaHistoryOpen(true))}
            />
          </div>
        )
      ) : (
        <div className="grid shrink-0 grid-cols-[2.75rem_1fr_auto] items-center gap-1 border-b border-stone-200/90 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800"
            aria-label="Back to agents"
          >
            <ChevronRight className="h-6 w-6 rotate-180 text-zinc-700 dark:text-zinc-200" />
          </button>
          <div className="min-w-0 px-1 text-center">
            <h3 className="truncate text-[16px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {agent.name}
            </h3>
            <p className="min-w-0 truncate px-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              {agentProfile?.multiRole && agentProfile.teamRoles?.length ? (
                <AgentMultiRoleBlurb profile={agentProfile} variant="header" />
              ) : (
                agentProfile?.tagline ?? "Content generated by AI"
              )}
            </p>
          </div>
          <MindChatHeaderActions
            size="compact"
            newChatAccent={false}
            onNewChat={() => runWithAuth(startNewChat)}
            onOpenHistory={() => runWithAuth(() => setQaHistoryOpen(true))}
          />
        </div>
      )}

      {entryHint && !showNoteWritingPrompts ? (
        <div className="shrink-0 border-b border-zinc-200/90 bg-zinc-50/95 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-[13px] leading-snug text-zinc-700 dark:text-zinc-300">{entryHint}</p>
        </div>
      ) : null}

      {messages.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            className={cn(
              "scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-3",
              showNoteWritingPrompts ? "px-4 pt-4" : "px-5 pt-6"
            )}
          >
            {showNoteWritingPrompts ? (
              <div className="flex w-full flex-col">
                <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Quick questions
                </h3>
                <p className="mt-1 mb-4 text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {noteTitle
                    ? `Grounded on “${noteTitle}” — pick a prompt or type below.`
                    : "Grounded on this note — pick a prompt or type below."}
                </p>
                <AgentExamplePromptRail
                  layout="stack"
                  prompts={noteWritingPrompts}
                  onSelect={(prompt) => runWithAuth(() => setInput(prompt))}
                  className="w-full"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <AgentContactAvatar agent={agent} size={80} className="mb-3" />
                <h3 className="mb-1 text-center text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Hi, I&apos;m {agent.name}
                </h3>
                {agentProfile?.multiRole && agentProfile.teamRoles?.length ? (
                  <AgentMultiRoleBlurb profile={agentProfile} variant="hero" className="mt-3" />
                ) : entryHint ? (
                  <p className="max-w-[280px] text-center text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {entryHint}
                  </p>
                ) : agentProfile ? (
                  <p className="max-w-[280px] text-center text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {agentProfile.tagline}
                  </p>
                ) : null}
                {showHeroExamplePrompts ? (
                  <>
                    {embedded ? (
                      <h2 className="mb-5 text-center text-[22px] font-semibold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-[26px]">
                        What can I help you with?
                      </h2>
                    ) : null}
                    <AgentExamplePromptRail
                      layout={embedded ? "wrap" : "stack"}
                      prompts={examplePrompts}
                      onSelect={(prompt) => runWithAuth(() => setInput(prompt))}
                      className={cn("w-full", embedded ? "max-w-3xl" : "mt-4 max-w-md")}
                    />
                  </>
                ) : null}
              </div>
            )}
          </div>
          <div className="shrink-0 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 dark:bg-zinc-950">
            {chatFooter}
          </div>
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((msg) => (
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
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    {msg.role === "ai" && msg.content ? (
                      <MindChatMessageActions
                        locale={locale}
                        variant={isLibraryChat || isNoteChat ? "library" : "default"}
                        feedback={messageFeedback[msg.id] ?? null}
                        onRegenerate={() => runWithAuth(() => regenerateMessage(msg.id))}
                        onSaveToLibrary={() => openSaveToLibrarySheet(msg.content)}
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
                      />
                    ) : null}
                  </div>
                </div>
            ))}
          </div>
          <div className="shrink-0 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 dark:bg-zinc-950">
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

      {!isNoteChat ? (
        <ContentFactoryModals
          open={factoryModal}
          onClose={() => setFactoryModal(null)}
          libraryName={isLibraryChat ? factoryLibraryLabel || undefined : undefined}
          modalDensity="compact"
          onGenerateSubmit={handleFactoryGenerateSubmit}
        />
      ) : null}

      {isLibraryChat && saveToLibrarySheet ? (
        <MindSaveToLibrarySheet
          open
          title="Add to library"
          preview={saveToLibrarySheet.text}
          preferredKbName={displayScopeName ?? kbLabel}
          onClose={() => setSaveToLibrarySheet(null)}
          onSelect={confirmSaveToLibrary}
        />
      ) : null}
    </div>
  )
}
