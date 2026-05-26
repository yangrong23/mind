"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import type { MindAccountId } from "@/lib/mind-accounts"
import { KnowledgeDetail, type LibraryChatLaunchContext } from "./knowledge-detail"
import { MINDAR_COPILOT_AGENT, MINDAR_DEMO_MY_AGENTS, type Agent } from "./agent-tab"
import type { FactoryModalKind } from "./content-factory-modals"
import {
  MOCK_KNOWLEDGE_BASES,
  type KBCategory,
  type KnowledgeBase,
  type TeamLibrarySettings,
} from "@/lib/mock-knowledge-bases"
import { MindAuthWeb } from "./mind-auth-web"
import type { WebTabType } from "./web-sidebar-nav"
import { WebIconRail } from "./web-icon-rail"
import { WebAgentSidebar } from "./web-agent-sidebar"
import { WebPlazaDiscoverPage } from "./web-plaza-discover-page"
import { plazaRowToKnowledgeBase, type PlazaLibraryRow } from "@/lib/mock-plaza-libraries"
import { WebKnowledgeBrowser } from "./web-knowledge-browser"
import { WebMeTab } from "./web-me-tab"
import { WebCreditsUpgradeModal } from "./web-credits-upgrade-modal"
import { WebRailSettingsPanel } from "./web-rail-settings-panel"
import { WebAgentCopilotPage } from "./web-agent-copilot-page"
import { WebAgentWorkspace } from "./web-agent-workspace"
import { WebDocumentEditorPage } from "./web-document-editor-page"
import { WebNotesWorkspace } from "./web-notes-workspace"
import { webNavMotion } from "./web-nav-motion"
import { web } from "./web-design"
import {
  MIND_FONT_ZOOM_DEFAULT,
  readStoredFontZoomPercent,
} from "@/lib/mind-display-prefs"
import { cn } from "@/lib/utils"
import {
  isLibrarySubscribed,
  readPlazaSubscriptions,
  subscribePlazaLibrary,
  unsubscribePlazaLibrary,
} from "@/lib/plaza-subscription-store"
import { agentFromPublicKbSettings, libraryAssistantChatMeta } from "@/lib/plaza-agent-runtime"
import { getKbAgentSuggestions } from "@/lib/kb-agent-suggestions"
import { mockNotes } from "@/lib/mock-notes"
import type { Note } from "@/lib/note-types"
import {
  readRecentAgentIds,
  readRecentNoteIds,
  readRecentPrivateKbIds,
  readRecentPublicKbIds,
  resolveRecentAgentIds,
  resolveRecentNoteIds,
  resolveRecentPrivateKbIds,
  resolveRecentPublicKbIds,
  touchRecentAgent,
  touchRecentKbFromBase,
  touchRecentNote,
} from "@/lib/web-recent-usage"
import { WebRecentsNavPanel } from "@/components/mind-v2/web-recents-nav-panel"
import { WebShellHeader } from "@/components/mind-v2/web-shell-header"

const DEMO_AUTH_SESSION_KEY = "mind-v2-demo-auth"

const DEMO_CREDITS = {
  creditsRemaining: 32_400,
  creditsMonthlyAllowance: 50_000,
}

const SHELL_TAB_LABELS: Record<WebTabType, { title: string; subtitle?: string }> = {
  plaza: { title: "Square", subtitle: "Discover and follow public libraries" },
  library: { title: "Library", subtitle: "Personal, following, shared — full browser" },
  agent: { title: "Agent", subtitle: "Chat and generate from your libraries" },
  memos: { title: "Notes", subtitle: "Memos, drafts, and rich text" },
  me: { title: "Me", subtitle: "Profile, timeline, and billing" },
}

const WEB_AGENT_ROSTER: Agent[] = [MINDAR_COPILOT_AGENT, ...MINDAR_DEMO_MY_AGENTS]

type KbDetailPayload = {
  id?: number
  name: string
  color: string
  description?: string
  coverVariant?: import("@/lib/product-media").LibraryCoverVariant
  isPublicKb?: boolean
  contentCount?: number
  subscriberCount?: number
  viewCount?: number
  publicTagline?: string
  publisherName?: string
  initialLikeCount?: number
  initialCommentCount?: number
  category?: KBCategory
  teamSettings?: TeamLibrarySettings
  isPublicPublished?: boolean
  publicSettings?: import("@/lib/public-kb-settings").PublicKbSettings
}

type WebView =
  | { type: "shell" }
  | {
      type: "notebook"
      kb: KbDetailPayload
      initialFactoryModal?: FactoryModalKind
      initialOpenTeamInfo?: boolean
      initialOpenContentId?: number
      /** From plaza discover — highlight Studio / content factory column */
      initialFocusStudio?: boolean
    }
  | {
      type: "agent-chat"
      agent: Agent
      initialPrompt?: string
    }
  | {
      type: "kb-agent-chat"
      context: LibraryChatLaunchContext
      kb: KbDetailPayload
    }
  | { type: "editor"; docTitle?: string }

function kbToDetailPayload(kb: KnowledgeBase): KbDetailPayload {
  return {
    id: kb.id,
    name: kb.name,
    color: kb.color,
    description: kb.description,
    coverVariant: kb.coverVariant,
    isPublicKb: kb.category === "subscribed" || Boolean(kb.isPublicPublished),
    contentCount: kb.count,
    subscriberCount: kb.subscribers,
    viewCount: kb.viewCount,
    publicTagline: kb.publicTagline,
    publisherName: kb.publisherName,
    initialLikeCount: kb.category === "subscribed" ? 56 : undefined,
    initialCommentCount: kb.category === "subscribed" ? 1 : undefined,
    category: kb.category,
    teamSettings: kb.teamSettings,
    isPublicPublished: kb.isPublicPublished,
    publicSettings: kb.publicSettings,
  }
}

export function MindAppWeb() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authOverlayOpen, setAuthOverlayOpen] = useState(false)
  const pendingAfterAuth = useRef<(() => void) | null>(null)
  const [activeTab, setActiveTab] = useState<WebTabType>("agent")
  const [currentView, setCurrentView] = useState<WebView>({ type: "shell" })
  const [activeAccountId] = useState<MindAccountId>("work")
  const [fontZoomPercent, setFontZoomPercent] = useState(MIND_FONT_ZOOM_DEFAULT)
  const [selectedKbId, setSelectedKbId] = useState<number | null>(null)
  const [editorReturn, setEditorReturn] = useState<WebView | null>(null)
  const [agentHistoryDraft, setAgentHistoryDraft] = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState(MINDAR_COPILOT_AGENT.id)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [creditsModalOpen, setCreditsModalOpen] = useState(false)
  const [creditsOpenSignal, setCreditsOpenSignal] = useState(0)
  const [plazaSubscribedKbs, setPlazaSubscribedKbs] = useState<KnowledgeBase[]>(() => readPlazaSubscriptions())
  const [recentPublicKbIds, setRecentPublicKbIds] = useState<number[]>(() =>
    resolveRecentPublicKbIds(readRecentPublicKbIds())
  )
  const [recentPrivateKbIds, setRecentPrivateKbIds] = useState<number[]>(() =>
    resolveRecentPrivateKbIds(readRecentPrivateKbIds())
  )
  const [recentAgentIds, setRecentAgentIds] = useState<number[]>(() =>
    resolveRecentAgentIds(readRecentAgentIds())
  )
  const [recentNoteIds, setRecentNoteIds] = useState<number[]>(() =>
    resolveRecentNoteIds(readRecentNoteIds())
  )
  const [focusNoteId, setFocusNoteId] = useState<number | null>(null)

  const recentKbIds = useMemo(
    () => [...recentPublicKbIds, ...recentPrivateKbIds],
    [recentPublicKbIds, recentPrivateKbIds]
  )

  function syncRecentsFromStorage() {
    setRecentPublicKbIds(resolveRecentPublicKbIds(readRecentPublicKbIds()))
    setRecentPrivateKbIds(resolveRecentPrivateKbIds(readRecentPrivateKbIds()))
    setRecentAgentIds(resolveRecentAgentIds(readRecentAgentIds()))
    setRecentNoteIds(resolveRecentNoteIds(readRecentNoteIds()))
  }

  const allKbsById = useMemo(() => {
    const map = new Map<number, KnowledgeBase>()
    for (const kb of [...MOCK_KNOWLEDGE_BASES, ...plazaSubscribedKbs]) {
      map.set(kb.id, kb)
    }
    return map
  }, [plazaSubscribedKbs])

  const recentPublicKbs = useMemo(
    () =>
      recentPublicKbIds
        .map((id) => allKbsById.get(id))
        .filter((kb): kb is KnowledgeBase => Boolean(kb)),
    [recentPublicKbIds, allKbsById]
  )

  const recentPrivateKbs = useMemo(
    () =>
      recentPrivateKbIds
        .map((id) => allKbsById.get(id))
        .filter((kb): kb is KnowledgeBase => Boolean(kb)),
    [recentPrivateKbIds, allKbsById]
  )

  const recentAgents = useMemo(
    () =>
      recentAgentIds
        .map((id) => WEB_AGENT_ROSTER.find((a) => a.id === id))
        .filter((a): a is Agent => Boolean(a)),
    [recentAgentIds]
  )

  const recentNotes = useMemo(
    () =>
      recentNoteIds
        .map((id) => mockNotes.find((n) => n.id === id))
        .filter((n): n is Note => Boolean(n)),
    [recentNoteIds]
  )

  function noteAgentUsed(agent: Agent) {
    touchRecentAgent(agent.id)
    syncRecentsFromStorage()
    setSelectedAgentId(agent.id)
  }

  function refreshPlazaSubscriptions() {
    setPlazaSubscribedKbs(readPlazaSubscriptions())
  }

  function plazaAccessForKb(kb: KbDetailPayload) {
    const subscribed = isLibrarySubscribed({
      id: kb.id ?? 0,
      category: kb.category ?? "subscribed",
      subscribedRole: kb.isPublicPublished ? "published" : "followed",
    })
    const isOwner = Boolean(kb.isPublicPublished)
    return {
      isSubscribed: subscribed,
      isOwner,
      onSubscribe: () => {
        if (kb.id == null) return
        const fullKb: KnowledgeBase = {
          id: kb.id,
          name: kb.name,
          description: kb.description ?? "",
          category: "subscribed",
          count: kb.contentCount ?? 0,
          lastUpdate: "Just now",
          color: kb.color,
          coverVariant: kb.coverVariant ?? "default",
          publicSettings: kb.publicSettings,
          publicTagline: kb.publicTagline,
          publisherName: kb.publisherName,
          subscribers: kb.subscriberCount,
          viewCount: kb.viewCount,
          subscribedRole: "followed",
        }
        subscribePlazaLibrary(fullKb)
        refreshPlazaSubscriptions()
        toast.success("Subscribed", { description: `"${kb.name}" added to your libraries.` })
      },
      onUnsubscribe: () => {
        if (kb.id == null) return
        unsubscribePlazaLibrary(kb.id)
        refreshPlazaSubscriptions()
        toast.message("Unsubscribed", { description: `"${kb.name}" removed from followed libraries.` })
      },
    }
  }

  useEffect(() => {
    setFontZoomPercent(readStoredFontZoomPercent())
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k") return
      if (currentView.type !== "shell") return
      e.preventDefault()
      setSettingsOpen(false)
      setActiveTab("agent")
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [currentView.type])

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && sessionStorage.getItem(DEMO_AUTH_SESSION_KEY) === "1") {
        setIsLoggedIn(true)
      }
    } catch {
      /* ignore */
    }
  }, [])

  function handleAuthenticated() {
    try {
      sessionStorage.setItem(DEMO_AUTH_SESSION_KEY, "1")
    } catch {
      /* ignore */
    }
    setIsLoggedIn(true)
    setAuthOverlayOpen(false)
    pendingAfterAuth.current?.()
    pendingAfterAuth.current = null
  }

  function handleDismissAuthOverlay() {
    pendingAfterAuth.current = null
    setAuthOverlayOpen(false)
  }

  function requireAuthThen(run: () => void) {
    if (isLoggedIn) {
      run()
      return
    }
    pendingAfterAuth.current = run
    setAuthOverlayOpen(true)
  }

  function switchTab(tab: WebTabType) {
    setActiveTab(tab)
    setSettingsOpen(false)
    if (currentView.type === "notebook" || currentView.type === "kb-agent-chat") {
      setCurrentView({ type: "shell" })
    }
  }

  function openNotebook(
    kb: KnowledgeBase,
    options?: { openTeamInfo?: boolean; initialFocusStudio?: boolean }
  ) {
    touchRecentKbFromBase(kb)
    syncRecentsFromStorage()
    setSelectedKbId(kb.id)
    setActiveTab("library")
    setCurrentView({
      type: "notebook",
      kb: kbToDetailPayload(kb),
      initialOpenTeamInfo: options?.openTeamInfo,
      initialFocusStudio: options?.initialFocusStudio,
    })
  }

  function openPlazaLibraryFromDiscover(row: PlazaLibraryRow) {
    const kb = plazaRowToKnowledgeBase(row)
    const access = plazaAccessForKb(kbToDetailPayload(kb))
    requireAuthThen(() => {
      if (!access.isSubscribed && !access.isOwner) {
        access.onSubscribe?.()
      }
      openNotebook(kb, { initialFocusStudio: true })
    })
  }

  function closeNotebook() {
    setCurrentView({ type: "shell" })
  }

  const shellMain = currentView.type === "shell"

  return (
    <div
      className={cn("min-h-screen font-sans antialiased", web.softType)}
      style={{ zoom: fontZoomPercent / 100 }}
    >
      <div className={cn("flex h-screen min-h-0 w-full overflow-hidden", web.canvas)}>
        <WebIconRail
          activeTab={activeTab}
          onTabChange={switchTab}
          activeAccountId={activeAccountId}
          onOpenSettings={() => setSettingsOpen((v) => !v)}
          settingsActive={settingsOpen}
        />

        {shellMain && !settingsOpen ? (
          <WebRecentsNavPanel
            recentPublicKbs={recentPublicKbs}
            recentPrivateKbs={recentPrivateKbs}
            recentAgents={recentAgents}
            recentNotes={recentNotes}
            selectedKbId={selectedKbId}
            selectedAgentId={selectedAgentId}
            selectedNoteId={focusNoteId}
            onOpenPlaza={() => switchTab("plaza")}
            onOpenPublicKb={(kb) => requireAuthThen(() => openNotebook(kb))}
            onOpenPrivateKb={(kb) => requireAuthThen(() => openNotebook(kb))}
            onOpenAgent={(agent) => {
              noteAgentUsed(agent)
              if (agent.id === MINDAR_COPILOT_AGENT.id) {
                switchTab("agent")
              } else {
                requireAuthThen(() => setCurrentView({ type: "agent-chat", agent }))
              }
            }}
            onOpenNote={(note) => {
              touchRecentNote(note.id)
              syncRecentsFromStorage()
              setFocusNoteId(note.id)
              switchTab("memos")
            }}
            onMorePublic={() => switchTab("library")}
            onMorePrivate={() => switchTab("library")}
            onMoreAgents={() => switchTab("agent")}
            onMoreNotes={() => switchTab("memos")}
          />
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {shellMain ? (
            <WebShellHeader
              title={settingsOpen ? "Settings" : SHELL_TAB_LABELS[activeTab].title}
              subtitle={
                settingsOpen ? "Preferences, display, and workspace" : SHELL_TAB_LABELS[activeTab].subtitle
              }
              creditsRemaining={DEMO_CREDITS.creditsRemaining}
              onOpenCredits={() => setCreditsModalOpen(true)}
            />
          ) : null}

          <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <WebCreditsUpgradeModal
          open={creditsModalOpen}
          onClose={() => setCreditsModalOpen(false)}
          stats={DEMO_CREDITS}
          currentPlanId="standard"
          onUpgrade={() => {
            setCreditsModalOpen(false)
            setCreditsOpenSignal((n) => n + 1)
            switchTab("me")
          }}
        />

        {shellMain && !settingsOpen && activeTab === "agent" ? (
          <WebAgentSidebar
            selectedAgentId={selectedAgentId}
            recentAgentIds={recentAgentIds}
            onScrollToAllAgents={() =>
              document.getElementById("web-all-agents")?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            onSelectAgent={(agent) => {
              noteAgentUsed(agent)
              setSelectedThreadId(null)
              setAgentHistoryDraft(null)
              if (agent.id === MINDAR_COPILOT_AGENT.id) {
                if (currentView.type !== "shell") setCurrentView({ type: "shell" })
              } else {
                requireAuthThen(() => setCurrentView({ type: "agent-chat", agent }))
              }
            }}
            onNewChat={() => {
              setSelectedThreadId(null)
              setAgentHistoryDraft("")
              if (selectedAgentId === MINDAR_COPILOT_AGENT.id) {
                if (currentView.type !== "shell") setCurrentView({ type: "shell" })
                toast.message("New chat", { description: "Ready for a fresh thread with Mindar." })
              } else {
                const agent = [...MINDAR_DEMO_MY_AGENTS, MINDAR_COPILOT_AGENT].find(
                  (a) => a.id === selectedAgentId
                )
                if (agent) requireAuthThen(() => setCurrentView({ type: "agent-chat", agent }))
              }
            }}
            selectedThreadId={selectedThreadId}
            onSelectThread={(thread) => {
              setSelectedThreadId(thread.id)
              const agent =
                thread.agentId === MINDAR_COPILOT_AGENT.id
                  ? MINDAR_COPILOT_AGENT
                  : MINDAR_DEMO_MY_AGENTS.find((a) => a.id === thread.agentId)
              if (!agent) return
              noteAgentUsed(agent)
              if (thread.agentId === MINDAR_COPILOT_AGENT.id) {
                setAgentHistoryDraft(thread.title)
                if (currentView.type !== "shell") setCurrentView({ type: "shell" })
              } else {
                requireAuthThen(() =>
                  setCurrentView({
                    type: "agent-chat",
                    agent,
                    initialPrompt: thread.title,
                  })
                )
              }
            }}
            onDiscoverAgents={() =>
              toast.message("Agent plaza", { description: "Browse scenario agents (demo)." })
            }
            onSearchAgents={() =>
              toast.message("Search agents", { description: "Find agents by name or topic (demo)." })
            }
          />
        ) : null}

        <main
          key={shellMain ? (settingsOpen ? "settings" : activeTab) : currentView.type}
          className={cn("relative min-h-0 min-w-0 flex-1 overflow-hidden", webNavMotion.contentEnter)}
        >
          {shellMain && settingsOpen ? (
            <WebRailSettingsPanel
              embedded
              onClose={() => setSettingsOpen(false)}
              fontZoomPercent={fontZoomPercent}
              onFontZoomPercentChange={setFontZoomPercent}
            />
          ) : null}

          {shellMain && !settingsOpen && activeTab === "library" && (
            <WebKnowledgeBrowser
              selectedKbId={selectedKbId}
              recentKbIds={recentKbIds}
              onSelectKb={(kb) => setSelectedKbId(kb.id)}
              onDeselectKb={() => setSelectedKbId(null)}
              onOpenWorkspace={(kb) => openNotebook(kb)}
              onBrowsePlaza={() => switchTab("plaza")}
              requireAuthThen={requireAuthThen}
              extraSubscribedKbs={plazaSubscribedKbs}
            />
          )}

          {shellMain && !settingsOpen && activeTab === "plaza" && (
            <WebPlazaDiscoverPage onPickRow={openPlazaLibraryFromDiscover} />
          )}

          {shellMain && !settingsOpen && activeTab === "memos" && (
            <WebNotesWorkspace
              requireAuthThen={requireAuthThen}
              initialSelectedNoteId={focusNoteId ?? undefined}
              onNoteActivated={(note) => {
                touchRecentNote(note.id)
                syncRecentsFromStorage()
                setFocusNoteId(note.id)
              }}
            />
          )}

          {shellMain && !settingsOpen && activeTab === "agent" && (
            <WebAgentCopilotPage
              draftSeed={agentHistoryDraft}
              onDraftSeedConsumed={() => setAgentHistoryDraft(null)}
              requireAuthThen={requireAuthThen}
              onAgentChat={(agent, options) =>
                requireAuthThen(() => {
                  noteAgentUsed(agent)
                  setCurrentView({
                    type: "agent-chat",
                    agent,
                    initialPrompt: options?.initialPrompt,
                  })
                })
              }
            />
          )}

          {shellMain && !settingsOpen && activeTab === "me" && (
            <WebMeTab
              activeAccountId={activeAccountId}
              onActiveAccountChange={() => {}}
              fontZoomPercent={fontZoomPercent}
              onFontZoomPercentChange={setFontZoomPercent}
              creditsOpenSignal={creditsOpenSignal}
            />
          )}

          {currentView.type === "notebook" && (
            <KnowledgeDetail
              webLayout
              embedded
              requireAuthThen={requireAuthThen}
              onBack={closeNotebook}
              knowledgeBase={currentView.kb}
              initialOpenTeamInfo={currentView.initialOpenTeamInfo}
              initialOpenContentId={currentView.initialOpenContentId}
              initialFactoryModal={currentView.initialFactoryModal}
              initialFocusStudio={currentView.initialFocusStudio}
              onAgentChat={(context) =>
                requireAuthThen(() =>
                  setCurrentView({
                    type: "kb-agent-chat",
                    context,
                    kb: currentView.kb,
                  })
                )
              }
              plazaAccess={
                currentView.kb.isPublicKb ? plazaAccessForKb(currentView.kb) : undefined
              }
              onOpenDocumentEditor={(title) => {
                setEditorReturn(currentView)
                setCurrentView({ type: "editor", docTitle: title })
              }}
            />
          )}

          {currentView.type === "agent-chat" && (
            <WebAgentWorkspace
              agent={currentView.agent}
              initialPrompt={currentView.initialPrompt}
              onBack={() => {
                noteAgentUsed(currentView.agent)
                setCurrentView({ type: "shell" })
                setActiveTab("agent")
              }}
              requireAuthThen={requireAuthThen}
            />
          )}

          {currentView.type === "kb-agent-chat" && (
            <WebAgentWorkspace
              agent={agentFromPublicKbSettings(currentView.kb.publicSettings, currentView.kb.name)}
              libraryAssistant={libraryAssistantChatMeta(
                currentView.kb.publicSettings,
                currentView.kb.name
              )}
              librarySuggestions={getKbAgentSuggestions({
                name: currentView.kb.name,
                description: currentView.kb.description,
                category: currentView.kb.category,
                coverVariant: currentView.kb.coverVariant,
                isPublicKb: currentView.kb.isPublicKb,
                exampleQuestions: currentView.kb.publicSettings?.exampleQuestions,
              })}
              scopedLibraryName={currentView.kb.name}
              initialPrompt={currentView.context.initialPrompt}
              onBack={() =>
                setCurrentView({
                  type: "notebook",
                  kb: currentView.kb,
                  initialOpenContentId: currentView.context.contentDocId,
                })
              }
              requireAuthThen={requireAuthThen}
            />
          )}

          {currentView.type === "editor" && (
            <WebDocumentEditorPage
              title={currentView.docTitle}
              onBack={() => setCurrentView(editorReturn ?? { type: "shell" })}
            />
          )}
        </main>
          </div>
        </div>

        {authOverlayOpen ? (
          <div
            className="fixed inset-0 z-[200] flex min-h-0 flex-col bg-[#f5f5f4]"
            role="dialog"
            aria-modal="true"
          >
            <MindAuthWeb
              embedded
              onAuthenticated={handleAuthenticated}
              onDismiss={handleDismissAuthOverlay}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
