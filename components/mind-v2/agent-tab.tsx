"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { MOCK_KNOWLEDGE_BASES, type KnowledgeBase } from "@/lib/mock-knowledge-bases"
import { isNoteRecording } from "@/lib/note-status"
import { TEXT_NOTE_AI_PROMPTS } from "@/lib/text-note-ai-prompts"
import { RECORDING_NOTE_FACTORY_ITEMS } from "@/lib/recording-note-factory-chips"
import { RECORDING_NOTE_CHAT_SUGGESTIONS } from "@/lib/recording-note-chat-suggestions"
import { NoteRecordingChatSuggestionCards } from "@/components/mind-v2/note-recording-chat-suggestion-cards"
import { CHAT_FACTORY_RAIL_ITEMS, MindChatFactoryRail } from "@/components/mind-v2/mind-chat-factory-rail"
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
  getMindAgentProfile,
  MINDER_COPILOT_PROFILE,
  MINDER_DEFAULT_SCENARIO_AGENTS,
  type AgentCapabilityProfile,
  type MindAgent,
} from "@/lib/mind-agent-catalog"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"
import { AgentHomeSidebar } from "@/components/mind-v2/agent-home-sidebar"
import { AgentHomePlazaPager, type AgentHomePagerPage } from "@/components/mind-v2/agent-home-plaza-pager"
import { LibraryPlazaView } from "@/components/mind-v2/library-plaza-view"
import type { PlazaCategoryId } from "@/lib/mock-plaza-libraries"
import {
  clearThreadMessages,
  listAgentThreadSummaries,
  newHomeSessionId,
  readThreadMessages,
  resolveAgentThreadKey,
  writeThreadMessages,
  type AgentThreadScope,
  type AgentThreadSummary,
} from "@/lib/agent-chat-threads"
import { getAgentExamplePrompts } from "@/lib/agent-chat-example-prompts"
import { AgentMultiRoleBlurb } from "@/components/mind-v2/agent-profile-ui"
import {
  Menu,
  Trash2,
  MoreHorizontal,
  X,
  ChevronRight,
  Sparkles,
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
  linkedKbIds?: number[]
  profile?: AgentCapabilityProfile
}

export type AgentConversationLaunchOptions = AgentChatLaunchOptions & {
  scope?: AgentThreadScope
}

/** Default agent when sending from the Mindar home composer. */
export const MINDER_COPILOT_AGENT: Agent = {
  id: 0,
  name: "Mindar",
  description: "Copilot",
  avatar: "🧠",
  color: "from-zinc-500 to-stone-600",
}

export type AgentChatLaunchOptions = {
  initialPrompt?: string
  scope?: AgentThreadScope
}

/** Legacy export — plaza / web still reference scenario roster elsewhere. */
export const MINDER_DEMO_MY_AGENTS: Agent[] = MINDER_DEFAULT_SCENARIO_AGENTS

interface AgentTabProps {
  onOpenConversation: (scope: AgentThreadScope, options?: AgentChatLaunchOptions) => void
  onOpenKnowledgeBase: (kb: KnowledgeBase) => void
  allKnowledgeBases?: KnowledgeBase[]
  onNavigateToKnowledge?: (factoryKind?: FactoryModalKind) => void
  /** Run send / attach only after demo sign-in. */
  requireAuthThen?: (run: () => void) => void
}

const AGENT_LINKABLE_NOTES = mockNotes
  .filter((n) => !isNoteRecording(n))
  .slice(0, 8)
  .map((n) => ({ id: n.id, title: n.title }))

function agentAvatarIsRemoteUrl(avatar: string) {
  return /^https?:\/\//i.test(avatar) || avatar.startsWith("/")
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

export function AgentTab({
  onOpenConversation,
  onOpenKnowledgeBase,
  allKnowledgeBases,
  onNavigateToKnowledge,
  requireAuthThen,
}: AgentTabProps) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const libraries = allKnowledgeBases ?? MOCK_KNOWLEDGE_BASES
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [agentPagerPage, setAgentPagerPage] = useState<AgentHomePagerPage>("agent")
  const [plazaCategory, setPlazaCategory] = useState<PlazaCategoryId>("recommended")
  const [plazaQuery, setPlazaQuery] = useState("")
  const [homeScope, setHomeScope] = useState<AgentThreadScope>({ type: "home" })
  const homeThreadId = resolveAgentThreadKey(homeScope)

  const flatThreads = useMemo(() => listAgentThreadSummaries(), [homeThreadId, sidebarOpen])

  function openThread(thread: AgentThreadSummary) {
    setSidebarOpen(false)
    if (thread.scope.type === "home") {
      setHomeScope(thread.scope)
      setAgentPagerPage("agent")
      return
    }
    onOpenConversation(thread.scope)
  }

  function startNewHomeSession() {
    setHomeScope({ type: "home", sessionId: newHomeSessionId() })
  }

  const agentHomeChat = (
    <AgentChat
      key={homeThreadId}
      agent={MINDER_COPILOT_AGENT}
      threadId={homeThreadId}
      threadScope={homeScope}
      embedded
      tabRoot
      requireAuthThen={requireAuthThen}
      onNavigateToKnowledge={onNavigateToKnowledge}
      onBack={() => {}}
      onNewChatSession={startNewHomeSession}
      onOpenSidebar={() => runWithAuth(() => setSidebarOpen(true))}
    />
  )

  const agentPlazaPanel = (
    <div className={cn("flex h-full min-h-0 flex-col", mx.pageBg)}>
      <header
        className={cn(
          "flex shrink-0 items-center gap-2 border-b px-3 py-2.5",
          "border-stone-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        )}
      >
        <button
          type="button"
          onClick={() => setAgentPagerPage("agent")}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 hover:bg-stone-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-label="Back to Mindar"
        >
          <ChevronRight className="h-5 w-5 rotate-180" strokeWidth={1.75} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Plaza</h1>
          <p className="truncate text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Discover knowledge libraries</p>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <LibraryPlazaView
          embedded
          hideOuterNav
          onBack={() => setAgentPagerPage("agent")}
          onPickLibrary={(kb) => runWithAuth(() => onOpenKnowledgeBase(kb))}
          activeCategory={plazaCategory}
          onCategoryChange={setPlazaCategory}
          query={plazaQuery}
          onQueryChange={setPlazaQuery}
        />
      </div>
    </div>
  )

  return (
    <div className={cn("relative flex h-full min-h-0 flex-col overflow-x-hidden font-sans text-zinc-800 dark:text-zinc-200", mx.pageBg)}>
      <AgentHomePlazaPager
        page={agentPagerPage}
        onPageChange={setAgentPagerPage}
        plaza={agentPlazaPanel}
        agent={agentHomeChat}
        className="min-h-0 flex-1"
      />

      {/* Create agent sheet */}
      {sidebarOpen ? (
        <AgentHomeSidebar
          open
          threads={flatThreads}
          libraries={libraries}
          onClose={() => setSidebarOpen(false)}
          onAskMindar={() => {
            runWithAuth(startNewHomeSession)
          }}
          onOpenLibraries={() => {
            runWithAuth(() => {
              setSidebarOpen(false)
              setAgentPagerPage("plaza")
            })
          }}
          onOpenThread={(thread) => {
            runWithAuth(() => openThread(thread))
          }}
          onOpenLibrary={(kb) => {
            runWithAuth(() => onOpenKnowledgeBase(kb))
          }}
        />
      ) : null}
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
  /** `recording` = Plaud-style Ask sheet for audio memos; `text` = rich-note assistant. */
  noteChatStyle?: "text" | "recording"
  /** From Mindar home composer — auto-send on mount. */
  initialPrompt?: string
  /** Web split pane: no back chevron; wider transcript */
  embedded?: boolean
  /** Plaza library agent — quick questions above the composer. */
  quickQuestions?: string[]
  /** Multi-turn Q&A vs autonomous task delivery (Agent tab tasks). */
  composerMode?: AgentComposerMode
  /** Hide Studio factory rail — use in popup chat tied to a note or library. */
  hideFactoryRail?: boolean
  /** Full-screen modal (ima-style): show × in embedded header. */
  showModalClose?: boolean
  /** Separate transcript per KB / note / home — single Mindar agent. */
  threadId?: string
  /** Scope for thread metadata updates. */
  threadScope?: AgentThreadScope
  /** Agent tab root — inline Mindar home chat, no back navigation. */
  tabRoot?: boolean
  onNewChatSession?: () => void
  onOpenSidebar?: () => void
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
  noteChatStyle = "text",
  initialPrompt,
  embedded = false,
  quickQuestions,
  composerMode: composerModeProp = "dialog",
  hideFactoryRail = false,
  showModalClose = false,
  threadId,
  threadScope,
  tabRoot = false,
  onNewChatSession,
  onOpenSidebar,
}: AgentChatProps) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const avatar = agent.avatar ?? ""
  const showRemoteAvatar = agentAvatarIsRemoteUrl(avatar)
  const isMindarAgent = agent.id === 0
  const hasKbGrounding = Boolean(knowledgeContext)
  const isLegacyLibraryChat = hasKbGrounding
  const isNoteChat = Boolean(noteContext)
  const isRecordingNoteChat = isNoteChat && noteChatStyle === "recording"
  const isTextNoteChat = isNoteChat && noteChatStyle === "text"
  const kbLabel = knowledgeContext?.kbName ?? ""
  const noteTitle = noteContext?.noteTitle ?? ""
  const scopeLabel = knowledgeContext?.contentTitle
    ? `「${knowledgeContext.contentTitle}」· ${kbLabel}`
    : isNoteChat
      ? noteTitle
      : kbLabel

  const chatHeaderTitle = isMindarAgent || hasKbGrounding || isNoteChat ? "Mindar" : agent.name
  const chatHeaderSubtitle =
    hasKbGrounding ? scopeLabel : isNoteChat ? noteTitle : undefined

  const agentProfile =
    agent.profile ?? getMindAgentProfile(agent.id) ?? (agent.id === 0 ? MINDER_COPILOT_PROFILE : undefined)

  const headerSubtitle =
    chatHeaderSubtitle ??
    (agentProfile?.multiRole && agentProfile.teamRoles?.length
      ? null
      : agentProfile?.tagline ?? agent.description)

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMsg[]>(() =>
    threadId ? readThreadMessages(threadId) : []
  )
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
  const seededInitialPromptRef = useRef(false)
  const locale = "en-US" as const

  const resolvedThreadScope = useMemo((): AgentThreadScope | undefined => {
    if (threadScope) return threadScope
    if (isNoteChat && noteContext) {
      const note = mockNotes.find((n) => n.title === noteTitle)
      return { type: "note", noteId: note?.id ?? 0, noteTitle }
    }
    if (hasKbGrounding) {
      return {
        type: "kb",
        kbName: kbLabel,
        contentTitle: knowledgeContext?.contentTitle,
      }
    }
    if (threadId?.startsWith("mindar:home:")) {
      return { type: "home", sessionId: threadId.slice("mindar:home:".length) }
    }
    if (threadId === "mindar:home") return { type: "home" }
    return undefined
  }, [threadScope, isNoteChat, noteContext, noteTitle, hasKbGrounding, kbLabel, knowledgeContext, threadId])

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (!threadId) return
    writeThreadMessages(threadId, messages, resolvedThreadScope)
  }, [threadId, messages, resolvedThreadScope])

  useEffect(() => {
    if (!threadId) return
    setMessages(readThreadMessages(threadId))
    seededInitialPromptRef.current = false
  }, [threadId])

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


  useEffect(() => {
    const q = initialPrompt?.trim()
    if (!q || seededInitialPromptRef.current) return
    seededInitialPromptRef.current = true
    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: "user", content: q }
    const modeAtSend: AgentComposerMode = composerModeProp
    const kbGround = (
      pickedNoteTitle ||
      pickedKbName ||
      (hasKbGrounding ? kbLabel : isNoteChat ? noteTitle : "")
    ).trim()
    setMessages([userMsg])
    setQaHistoryItems((prev) => [{ id: `qa-${Date.now()}`, at: Date.now(), query: q }, ...prev])
    startGeneration(modeAtSend, kbGround, q)
  }, [initialPrompt, hasKbGrounding, isNoteChat, kbLabel, noteTitle, pickedKbName, pickedNoteTitle, startGeneration, composerModeProp])

  const handleSend = () => {
    if (!input.trim()) return
    submitUserQuery(input.trim())
    setInput("")
    setKbMenuOpen(false)
  }

  function submitUserQuery(content: string) {
    const query = content.trim()
    if (!query) return
    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: "user", content: query }
    const modeAtSend: AgentComposerMode = composerModeProp
    const kbGround = (
      pickedNoteTitle ||
      pickedKbName ||
      (hasKbGrounding ? kbLabel : isNoteChat ? noteTitle : "")
    ).trim()
    setMessages((prev) => [...prev, userMsg])
    setQaHistoryItems((prev) => [{ id: `qa-${Date.now()}`, at: Date.now(), query }, ...prev])
    startGeneration(modeAtSend, kbGround, query)
  }

  const trySend = () => runWithAuth(handleSend)

  function regenerateMessage(msgId: string) {
    const kbGround = (
      pickedNoteTitle ||
      pickedKbName ||
      (hasKbGrounding ? kbLabel : isNoteChat ? noteTitle : "")
    ).trim()
    const userQuery = lastUserQueryBefore(msgId, messages)
    runWithAuth(() => startGeneration(composerModeProp, kbGround, userQuery, msgId))
  }

  function startNewChat() {
    if (tabRoot && onNewChatSession) {
      onNewChatSession()
      setInput("")
      setKbMenuOpen(false)
      setPickedKbName(null)
      setPickedNoteTitle(null)
      setQaHistoryOpen(false)
      setMessageFeedback({})
      seededInitialPromptRef.current = false
      toast.message("New chat", { description: "Started a fresh thread (demo)." })
      return
    }
    setMessages([])
    if (threadId) clearThreadMessages(threadId)
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
        void navigator.share({ title: "Mindar", text }).catch(() => {
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
    (hasKbGrounding ? kbLabel : isNoteChat ? noteTitle : null)

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
      items={MOCK_KNOWLEDGE_BASES.map((kb) => ({ id: kb.id, name: kb.name }))}
      selectedName={displayScopeName}
      isItemSelected={(kb) =>
        pickedKbName === kb.name || (hasKbGrounding && kbLabel === kb.name && !pickedKbName && !pickedNoteTitle)
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

  const isContactStyleChat = !isLegacyLibraryChat && !isNoteChat
  const showContentFactoryRail =
    !hideFactoryRail && (isContactStyleChat || hasKbGrounding || isNoteChat)
  const useMindarHomeEmpty = isMindarAgent && !hasKbGrounding && !isNoteChat
  const inConversation = messages.length > 0

  const composer = (
    <MindChatComposer
      variant={isContactStyleChat ? (inConversation ? "thread" : "home") : "thread"}
      value={input}
      onChange={setInput}
      onSubmit={trySend}
      placeholder={
        hasKbGrounding
          ? "Ask this knowledge base…"
          : isRecordingNoteChat
            ? "Ask about this recording"
            : isTextNoteChat
              ? "Message or hold to speak"
              : isNoteChat
                ? "Ask about this note…"
              : entryHint
                ? "Turn saved knowledge into an outcome…"
                : ""
      }
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
      showScreenshotButton={isNoteChat && !isRecordingNoteChat && !isTextNoteChat}
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
    if (hasKbGrounding) {
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

  const noteQuickPrompts = useMemo(
    () =>
      TEXT_NOTE_AI_PROMPTS.map((item) => ({
        id: item.id,
        label: item.label,
        prompt: item.prompt,
      })),
    []
  )

  const quickQuestionItems = useMemo(
    () =>
      (quickQuestions ?? []).slice(0, 3).map((q, index) => ({
        id: `kq-${index}`,
        label: q,
        prompt: q,
      })),
    [quickQuestions]
  )

  const showHeroExamplePrompts =
    messages.length === 0 && useMindarHomeEmpty && examplePrompts.length > 0

  const mindarHomeCentered = useMindarHomeEmpty && !hasKbGrounding && !isNoteChat

  const footerExamplePrompts =
    isNoteChat
      ? undefined
      : mindarHomeCentered && showHeroExamplePrompts
        ? examplePrompts
        : isContactStyleChat
          ? undefined
          : showHeroExamplePrompts
            ? undefined
            : examplePrompts

  const submitQuickQuestion = (prompt: string) => runWithAuth(() => submitUserQuery(prompt))

  const recordingChatFooter = isRecordingNoteChat ? (
    <div className={cn("w-full", embedded ? "max-w-3xl mx-auto" : "max-w-2xl mx-auto")}>
      <MindChatFactoryRail
        items={RECORDING_NOTE_FACTORY_ITEMS}
        layout="scroll"
        railStyle="pill"
        density="tight"
        selectedId={selectedFactoryKind}
        onSelect={handleFactorySelect}
        className="mb-2"
      />
      <div className="relative">
        <span className="absolute left-4 top-0 z-10 -translate-y-1/2 rounded border border-stone-200/90 bg-stone-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          Beta
        </span>
        <div className="rounded-[22px] bg-gradient-to-r from-violet-400/90 via-fuchsia-300/80 to-teal-400/90 p-[1.5px]">
          <div className="overflow-hidden rounded-[20.5px] bg-white dark:bg-zinc-950">{composer}</div>
        </div>
      </div>
      <p className={cn("mt-2 text-center", mx.typeCaption)}>
        AI-generated content is for reference only.
      </p>
    </div>
  ) : null

  const textChatFooter = isTextNoteChat ? (
    <div className={cn("w-full", embedded ? "max-w-3xl mx-auto" : "max-w-2xl mx-auto")}>
      <MindChatFactoryRail
        items={CHAT_FACTORY_RAIL_ITEMS}
        layout="scroll"
        railStyle="pill"
        density="tight"
        selectedId={selectedFactoryKind}
        onSelect={handleFactorySelect}
        className="mb-2"
      />
      <div className="overflow-hidden rounded-[22px] border border-stone-200/90 bg-white dark:border-zinc-700 dark:bg-zinc-950">
        <MindChatComposer
          variant="thread"
          className="max-w-none !rounded-none !border-0"
          value={input}
          onChange={setInput}
          onSubmit={trySend}
          placeholder="Message or hold to speak"
          voiceOn={voiceOn}
          onVoiceToggle={() =>
            runWithAuth(() => {
              setVoiceOn((prev) => {
                const next = !prev
                toast.message(next ? "Voice input on" : "Voice input off", {
                  description: next ? "Demo: tap again to stop." : "Demo: no audio uploaded.",
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
          showScreenshotButton={false}
          onUploadClick={() =>
            runWithAuth(() => toast.message("Attachment", { description: "Coming soon (demo)." }))
          }
        />
      </div>
      <p className={cn("mt-2 text-center", mx.typeCaption)}>
        AI-generated content is for reference only.
      </p>
    </div>
  ) : null

  const chatFooter = recordingChatFooter ?? textChatFooter ?? (
    <div className={cn("w-full", embedded ? "max-w-3xl mx-auto" : "max-w-2xl mx-auto")}>
      <AgentHomeComposerStack
        showFactoryRail={showContentFactoryRail}
        factoryPlacement={hasKbGrounding || isNoteChat ? "above" : "below"}
        factoryRailDensity={inConversation || hasKbGrounding ? "tight" : "compact"}
        elevateComposer={inConversation && !hasKbGrounding}
        factoryRailLayout="scroll"
        promptLayout={mindarHomeCentered && showHeroExamplePrompts ? "wrap" : "stack"}
        selectedFactoryId={selectedFactoryKind}
        onFactorySelect={handleFactorySelect}
        examplePrompts={footerExamplePrompts?.length ? footerExamplePrompts : undefined}
        onExampleSelect={
          footerExamplePrompts?.length
            ? (prompt) => runWithAuth(() => setInput(prompt))
            : undefined
        }
        composer={composer}
      />
    </div>
  )

  return (
    <div className={cn("relative flex h-full flex-col font-sans", mx.pageBg)}>
      {/* Header */}
      {embedded || tabRoot ? (
        <div
          className={cn(
            "flex shrink-0 items-center gap-3 bg-white px-4 py-3 dark:bg-zinc-900",
            tabRoot || ((isRecordingNoteChat || isTextNoteChat) && showModalClose)
              ? ""
              : cn("border-b", mx.shellHairlineSubtle)
          )}
        >
          {tabRoot ? (
            <>
              {onOpenSidebar ? (
                <button
                  type="button"
                  onClick={() => runWithAuth(onOpenSidebar)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-stone-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" strokeWidth={1.75} />
                </button>
              ) : (
                <div className="h-10 w-10 shrink-0" aria-hidden />
              )}
              <div className="min-w-0 flex-1 text-center">
                <h3 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Mindar</h3>
              </div>
              <div className="h-10 w-10 shrink-0" aria-hidden />
            </>
          ) : isTextNoteChat && showModalClose ? (
            <>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <MindarLogo variant="inline" className="!h-7 !max-w-[92px]" priority />
              </div>
              <button
                type="button"
                onClick={() => toast.message("More", { description: "Chat settings (demo)." })}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-stone-100 dark:hover:bg-zinc-800"
                aria-label="More options"
              >
                <MoreHorizontal className="h-5 w-5" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={onBack}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-stone-100 dark:hover:bg-zinc-800"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </>
          ) : isRecordingNoteChat && showModalClose ? (
            <>
              <button
                type="button"
                onClick={() => runWithAuth(startNewChat)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-stone-100 dark:hover:bg-zinc-800"
                aria-label="Clear chat"
              >
                <Trash2 className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <h3 className="min-w-0 flex-1 text-center text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Ask Mindar
              </h3>
              <button
                type="button"
                onClick={onBack}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-stone-100 dark:hover:bg-zinc-800"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </>
          ) : (
            <>
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br text-xl",
              isMindarAgent || hasKbGrounding || isNoteChat ? "from-zinc-500 to-stone-600" : agent.color
            )}
          >
            {isMindarAgent || hasKbGrounding || isNoteChat ? (
              <MindarLogo variant="avatar" className="!h-[70%] !w-[90%]" />
            ) : showRemoteAvatar ? (
              <img src={avatar} alt="" className="h-full w-full rounded-xl object-cover" />
            ) : (
              avatar || "·"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{chatHeaderTitle}</h3>
            <p className="min-w-0 truncate text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {agentProfile?.multiRole && agentProfile.teamRoles?.length ? (
                <AgentMultiRoleBlurb profile={agentProfile} variant="header" />
              ) : (
                headerSubtitle
              )}
            </p>
          </div>
          <MindChatHeaderActions
            newChatAccent={false}
            onNewChat={() => runWithAuth(startNewChat)}
            onOpenHistory={() => runWithAuth(() => setQaHistoryOpen(true))}
          />
          {showModalClose ? (
            <button
              type="button"
              onClick={onBack}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-stone-100 dark:hover:bg-zinc-800"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          ) : null}
            </>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "grid shrink-0 grid-cols-[2.75rem_1fr_auto] items-center gap-1 border-b bg-white px-3 py-2.5 dark:bg-zinc-900",
            mx.shellHairlineSubtle
          )}
        >
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
              {chatHeaderTitle}
            </h3>
            <p className="min-w-0 truncate px-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              {agentProfile?.multiRole && agentProfile.teamRoles?.length ? (
                <AgentMultiRoleBlurb profile={agentProfile} variant="header" />
              ) : (
                headerSubtitle ?? "Content generated by AI"
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

      {entryHint && !hasKbGrounding && !isNoteChat ? (
        <div
          className={cn(
            "shrink-0 border-b bg-zinc-50/95 px-4 py-2.5 dark:bg-zinc-900/60",
            mx.shellHairlineSubtle
          )}
        >
          <p className="text-[13px] leading-snug text-zinc-700 dark:text-zinc-300">{entryHint}</p>
        </div>
      ) : null}

      {messages.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col">
          {mindarHomeCentered ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
              <div className="flex w-full max-w-2xl -translate-y-8 flex-col items-center sm:-translate-y-10">
                <div className="relative flex flex-col items-center" aria-label="Mindar">
                  <div
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[min(260px,68vw)] w-[min(260px,68vw)] -translate-x-1/2 -translate-y-[46%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--mind-blue)_11%,transparent)_0%,color-mix(in_oklch,var(--mind-blue)_4%,transparent)_42%,transparent_72%)] dark:bg-[radial-gradient(circle,color-mix(in_oklch,var(--mind-blue)_13%,transparent)_0%,color-mix(in_oklch,var(--mind-blue)_5%,transparent)_42%,transparent_72%)]"
                    aria-hidden
                  />
                  <MindarLogo
                    variant="hero"
                    className="relative z-[1] !h-11 !max-w-[188px] sm:!h-12 sm:!max-w-[208px]"
                    priority
                  />
                </div>
                <p className={cn("relative z-[1] mt-3 text-center", mx.typeHeroSubtitle)}>
                  What can I help you with?
                </p>
                <div className="relative z-[1] mt-6 w-full max-w-2xl">{chatFooter}</div>
              </div>
            </div>
          ) : (
            <>
          <div
            className={cn(
              "scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-3",
              isRecordingNoteChat || isTextNoteChat ? "pt-4" : "pt-6"
            )}
          >
            <div
              className={cn(
                "flex w-full flex-col",
                isRecordingNoteChat || isTextNoteChat ? "items-stretch" : "items-center"
              )}
            >
              {hasKbGrounding ? (
                <>
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-mind/10 text-mind ring-1 ring-mind/15">
                    <Sparkles className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="mb-1 max-w-[320px] text-center text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {scopeLabel}
                  </h3>
                  <p className={cn("mt-2 max-w-[300px] text-center", mx.typeBodySecondary)}>
                    Questions are grounded in this library&apos;s sources — no setup required.
                  </p>
                  {quickQuestionItems.length > 0 ? (
                    <AgentExamplePromptRail
                      layout="stack"
                      prompts={quickQuestionItems}
                      onSelect={submitQuickQuestion}
                      className="mt-5 w-full max-w-md self-stretch"
                    />
                  ) : null}
                </>
              ) : isRecordingNoteChat ? (
                <div className="flex w-full max-w-md flex-col self-stretch">
                  <NoteRecordingChatSuggestionCards
                    suggestions={RECORDING_NOTE_CHAT_SUGGESTIONS}
                    onSelect={(prompt) => runWithAuth(() => submitUserQuery(prompt))}
                  />
                </div>
              ) : isTextNoteChat ? (
                <div className="flex w-full flex-col self-stretch">
                  <p className="text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200">
                    {entryHint ?? "Hi, I'm Mindar — ask me to read your notes, answer questions, or turn ideas into deliverables."}
                  </p>
                  <div className="mt-4 w-full">
                    <AgentExamplePromptRail
                      layout="stack"
                      tone="note"
                      prompts={noteQuickPrompts}
                      onSelect={(prompt) => runWithAuth(() => submitUserQuery(prompt))}
                      className="w-full"
                    />
                  </div>
                </div>
              ) : isNoteChat ? (
                <>
                  <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-stone-200/90">
                    <MindarLogo variant="avatar" className="!h-[70%] !w-[90%]" />
                  </div>
                  <p className={cn("max-w-[320px] text-center", mx.typeBody)}>
                    {entryHint ?? "Hi, I'm Mindar — ask me to read your notes, answer questions, or turn ideas into deliverables."}
                  </p>
                  <div className="mt-4 w-full max-w-md">
                    <AgentExamplePromptRail
                      layout="stack"
                      tone="note"
                      prompts={noteQuickPrompts}
                      onSelect={(prompt) => runWithAuth(() => submitUserQuery(prompt))}
                      className="w-full"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={cn(
                      "mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br text-4xl",
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
                  {agentProfile?.multiRole && agentProfile.teamRoles?.length ? (
                    <AgentMultiRoleBlurb profile={agentProfile} variant="hero" className="mt-3" />
                  ) : entryHint ? (
                    <p className={cn("max-w-[280px] text-center", mx.typeBodySecondary)}>
                      {entryHint}
                    </p>
                  ) : agentProfile ? (
                    <p className={cn("max-w-[280px] text-center", mx.typeBodySecondary)}>
                      {agentProfile.tagline}
                    </p>
                  ) : null}
                  {showHeroExamplePrompts ? (
                <>
                  {embedded || tabRoot ? (
                    <h2 className="mb-5 text-center text-[22px] font-semibold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-[26px]">
                      What can I help you with?
                    </h2>
                  ) : null}
                  <AgentExamplePromptRail
                    layout={embedded || tabRoot ? "wrap" : "stack"}
                    prompts={examplePrompts}
                    onSelect={(prompt) => runWithAuth(() => setInput(prompt))}
                    className={cn(
                      "w-full",
                      embedded || tabRoot ? "max-w-3xl" : "mt-4 max-w-md"
                    )}
                  />
                </>
                  ) : null}
                </>
              )}
            </div>
          </div>
          <div
            className={cn(
              "shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
              inConversation ? cn("pt-2.5", mx.chatFooterBar) : "bg-white pt-3 dark:bg-zinc-950"
            )}
          >
            {chatFooter}
          </div>
            </>
          )}
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
                          : "rounded-bl-md border border-black/[0.06] bg-white text-zinc-800 dark:border-white/[0.08] dark:bg-zinc-900 dark:text-zinc-100"
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    {msg.role === "ai" && msg.content ? (
                      <MindChatMessageActions
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
                        onCopy={() =>
                          runWithAuth(() => {
                            void navigator.clipboard?.writeText(msg.content).then(
                              () => toast.message("Copied"),
                              () => toast.message("Copy", { description: msg.content.slice(0, 120) })
                            )
                          })
                        }
                      />
                    ) : null}
                  </div>
                </div>
            ))}
          </div>
          <div
            className={cn(
              "shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
              inConversation ? cn("pt-2.5", mx.chatFooterBar) : "bg-white pt-3 dark:bg-zinc-950"
            )}
          >
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

      {!isNoteChat || isRecordingNoteChat ? (
        <ContentFactoryModals
          open={factoryModal}
          onClose={() => setFactoryModal(null)}
          libraryName={hasKbGrounding ? factoryLibraryLabel || undefined : undefined}
          modalDensity="compact"
          onGenerateSubmit={handleFactoryGenerateSubmit}
        />
      ) : null}

      {saveToLibrarySheet ? (
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
