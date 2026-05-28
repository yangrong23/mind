"use client"

import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import type { MindAccountId } from "@/lib/mind-accounts"
import { KnowledgeDetail, type LibraryChatLaunchContext } from "@/components/mind-v2/knowledge-detail"
import {
  MINDAR_COPILOT_AGENT,
  MINDAR_DEMO_MY_AGENTS,
  type Agent,
} from "@/components/mind-v2/agent-tab"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import type { KBCategory, KnowledgeBase, TeamLibrarySettings } from "@/lib/mock-knowledge-bases"
import type { WebTabType } from "@/components/mind-v2/web-sidebar-nav"
import { WebIconRail } from "@/components/mind-v2/web-icon-rail"
import { WebAgentSidebar } from "@/components/mind-v2/web-agent-sidebar"
import { WebPlazaDiscoverPage } from "@/components/mind-v2/web-plaza-discover-page"
import { WebKnowledgeBrowser } from "@/components/mind-v2/web-knowledge-browser"
import { WebMeTab } from "@/components/mind-v2/web-me-tab"
import { WebCreditsUpgradeModal } from "@/components/mind-v2/web-credits-upgrade-modal"
import { WebRailSettingsConnected } from "@/web-connected/web-rail-settings-connected"
import { WebAgentCopilotPage } from "@/components/mind-v2/web-agent-copilot-page"
import { WebAgentWorkspace } from "@/components/mind-v2/web-agent-workspace"
import { WebDocumentEditorPage } from "@/components/mind-v2/web-document-editor-page"
import { WebNotesWorkspace } from "@/components/mind-v2/web-notes-workspace"
import { webNavMotion } from "@/components/mind-v2/web-nav-motion"
import { web } from "@/components/mind-v2/web-design"
import {
  MIND_FONT_ZOOM_DEFAULT,
  readStoredFontZoomPercent,
} from "@/lib/mind-display-prefs"
import { cn } from "@/lib/utils"
import { isLoggedInFromStorage } from "@/auth/session"
import { useWebData } from "@/web-api/WebDataProvider"
import { plazaRowToKnowledgeBase, type PlazaLibraryRow } from "@/lib/mock-plaza-libraries"

const DEMO_CREDITS = {
  creditsRemaining: 32_400,
  creditsMonthlyAllowance: 50_000,
}

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

/** Mindar web product shell — original Next.js design + mind-api backend (Vue kept for system/KB admin). */
export function MindAppWebConnected() {
  const navigate = useNavigate()
  const webData = useWebData()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
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

  useEffect(() => {
    setFontZoomPercent(readStoredFontZoomPercent())
    setIsLoggedIn(isLoggedInFromStorage())
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

  function requireAuthThen(run: () => void) {
    if (isLoggedIn) {
      run()
      return
    }
    navigate("/login")
    pendingAfterAuth.current = run
  }

  function switchTab(tab: WebTabType) {
    setActiveTab(tab)
    setSettingsOpen(false)
    if (currentView.type === "notebook" || currentView.type === "kb-agent-chat") {
      setCurrentView({ type: "shell" })
    }
  }

  function openNotebook(kb: KnowledgeBase, options?: { openTeamInfo?: boolean }) {
    setSelectedKbId(kb.id)
    setActiveTab(kb.category === "subscribed" ? "plaza" : "library")
    setCurrentView({
      type: "notebook",
      kb: kbToDetailPayload(kb),
      initialOpenTeamInfo: options?.openTeamInfo,
    })
  }

  function closeNotebook() {
    setCurrentView({ type: "shell" })
  }

  function openPlazaNotebookFromDiscover(row: PlazaLibraryRow) {
    requireAuthThen(() => openNotebook(plazaRowToKnowledgeBase(row)))
  }

  function openPlazaChatFromDiscover(row: PlazaLibraryRow, prompt?: string) {
    const kb = plazaRowToKnowledgeBase(row)
    const payload = kbToDetailPayload(kb)
    requireAuthThen(() => {
      setSelectedKbId(kb.id)
      setActiveTab("plaza")
      setCurrentView({
        type: "kb-agent-chat",
        kb: payload,
        context: {
          kbName: kb.name,
          kbId: kb.id,
          initialPrompt: prompt,
          publicSettings: kb.publicSettings,
          publisherName: kb.publisherName,
        },
      })
    })
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
          creditsRemaining={DEMO_CREDITS.creditsRemaining}
          creditsMonthlyAllowance={DEMO_CREDITS.creditsMonthlyAllowance}
          onOpenCredits={() => setCreditsModalOpen(true)}
          onOpenSettings={() => setSettingsOpen((v) => !v)}
          settingsActive={settingsOpen}
        />

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
            onSelectAgent={(agent) => {
              setSelectedAgentId(agent.id)
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
              setSelectedAgentId(thread.agentId)
              const agent =
                thread.agentId === MINDAR_COPILOT_AGENT.id
                  ? MINDAR_COPILOT_AGENT
                  : MINDAR_DEMO_MY_AGENTS.find((a) => a.id === thread.agentId)
              if (!agent) return
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
            <WebRailSettingsConnected
              embedded
              onClose={() => setSettingsOpen(false)}
              fontZoomPercent={fontZoomPercent}
              onFontZoomPercentChange={setFontZoomPercent}
            />
          ) : null}

          {shellMain && !settingsOpen && activeTab === "library" && (
            <WebKnowledgeBrowser
              selectedKbId={selectedKbId}
              onSelectKb={(kb) => setSelectedKbId(kb.id)}
              onDeselectKb={() => setSelectedKbId(null)}
              onOpenWorkspace={(kb) => openNotebook(kb)}
              onBrowsePlaza={() => switchTab("plaza")}
              requireAuthThen={requireAuthThen}
              knowledgeBases={webData.knowledgeBases}
              knowledgeBasesLoading={webData.knowledgeBasesLoading}
              onRefreshKnowledgeBases={() => void webData.refreshKnowledgeBases()}
              onCreateKnowledgeBase={webData.createKnowledgeBaseFromWeb}
              onUpdateKnowledgeBase={webData.updateKnowledgeBaseMeta}
              onDeleteKnowledgeBase={webData.deleteKnowledgeBaseById}
              onOpenKnowledgeBaseSettings={webData.openKnowledgeBaseSettings}
            />
          )}

          {shellMain && !settingsOpen && activeTab === "plaza" && (
            <WebPlazaDiscoverPage
              onBrowseLibrary={openPlazaNotebookFromDiscover}
              onStartThread={openPlazaChatFromDiscover}
            />
          )}

          {shellMain && !settingsOpen && activeTab === "memos" && (
            <WebNotesWorkspace requireAuthThen={requireAuthThen} />
          )}

          {shellMain && !settingsOpen && activeTab === "agent" && (
            <WebAgentCopilotPage
              draftSeed={agentHistoryDraft}
              onDraftSeedConsumed={() => setAgentHistoryDraft(null)}
              requireAuthThen={requireAuthThen}
              onAgentChat={(agent, options) =>
                requireAuthThen(() =>
                  setCurrentView({
                    type: "agent-chat",
                    agent,
                    initialPrompt: options?.initialPrompt,
                  })
                )
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
              onAgentChat={(context) =>
                requireAuthThen(() =>
                  setCurrentView({
                    type: "kb-agent-chat",
                    context,
                    kb: currentView.kb,
                  })
                )
              }
              onOpenDocumentEditor={(title) => {
                setEditorReturn(currentView)
                setCurrentView({ type: "editor", docTitle: title })
              }}
              onOpenAdvancedKbSettings={
                currentView.kb.id != null
                  ? () => webData.openKnowledgeBaseSettings(currentView.kb.id!)
                  : undefined
              }
            />
          )}

          {currentView.type === "agent-chat" && (
            <WebAgentWorkspace
              agent={currentView.agent}
              initialPrompt={currentView.initialPrompt}
              onBack={() => {
                setSelectedAgentId(currentView.agent.id)
                setCurrentView({ type: "shell" })
                setActiveTab("agent")
              }}
              requireAuthThen={requireAuthThen}
            />
          )}

          {currentView.type === "kb-agent-chat" && (
            <WebAgentWorkspace
              agent={{
                id: 999,
                name: "Library chat",
                description: currentView.context.contentTitle
                  ? `"${currentView.context.contentTitle}"`
                  : `"${currentView.context.kbName}"`,
                avatar: "💬",
                color: "from-mind/38 to-mind",
              }}
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
  )
}
