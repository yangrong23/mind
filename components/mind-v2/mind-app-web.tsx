"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"
import type { MindAccountId } from "@/lib/mind-accounts"
import { KnowledgeDetail } from "./knowledge-detail"
import { MINDAR_COPILOT_AGENT, type Agent } from "./agent-tab"
import {
  MOCK_KNOWLEDGE_BASES,
  type KnowledgeBase,
} from "@/lib/mock-knowledge-bases"
import { MindAuthWeb, type MindAuthResult } from "./mind-auth-web"
import { WebLibraryOnboarding } from "./web-library-onboarding"
import {
  readOnboardingComplete,
  PENDING_ONBOARDING_SESSION_KEY,
  writeOnboardingComplete,
} from "@/lib/web-library-onboarding"
import type { WebTabType } from "./web-sidebar-nav"
import { WebAgentSidebar } from "./web-agent-sidebar"
import { WebPlazaDiscoverPage } from "./web-plaza-discover-page"
import {
  MOCK_PLAZA_LIBRARIES,
  knowledgeBaseToPlazaRow,
  plazaRowToKnowledgeBase,
  type PlazaLibraryRow,
} from "@/lib/mock-plaza-libraries"
import { WebKnowledgeBrowser } from "./web-knowledge-browser"
import { WebMeTab } from "./web-me-tab"
import { WebMeTimelineDayPage, WebMeTimelinePage } from "./web-me-timeline-pages"
import { getMindAccount } from "@/lib/mind-accounts"
import {
  buildDayShareCardText,
  formatHeatmapDayLabel,
  getDayUploads,
  getDayViralSlogan,
} from "@/lib/me-capture-diary-helpers"
import { buildTimelineSharePayload, type MindSharePayload } from "@/lib/mind-share-payload"
import { MindShareSheet } from "@/components/mind-v2/mind-share-sheet"
import type { ActivityTimelineDay } from "@/lib/mock-activity-timeline"
import { WebCreditsUpgradeModal } from "./web-credits-upgrade-modal"
import { WebAgentWorkspace } from "./web-agent-workspace"
import { WebDocumentEditorPage } from "./web-document-editor-page"
import { WebKbDocumentReaderPage } from "./web-kb-document-reader-page"
import { WebKbRichTextEditorPage } from "./web-kb-rich-text-editor-page"
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
import type { AgentChatScope } from "@/lib/web-agent-scope"
import { webMindarChatHref } from "@/lib/web-app-routes"
import {
  readRecentPrivateKbIds,
  readRecentPublicKbIds,
  resolveRecentPrivateKbIds,
  resolveRecentPublicKbIds,
  touchRecentAgent,
  touchRecentKbFromBase,
  touchRecentNote,
} from "@/lib/web-recent-usage"
import { latestGlobalAgentThread } from "@/lib/web-agent-threads"
import { recentKbIdsForNav } from "@/lib/web-recent-kb-nav"
import { WebShellNavPanel } from "@/components/mind-v2/web-shell-nav-panel"
import { WebWorkspaceChromeProvider } from "@/components/mind-v2/web-workspace-chrome"
import { WebCreditsChip } from "@/components/mind-v2/web-credits-chip"
import {
  kbToDetailPayload,
  useWebAppRouter,
  type KbDetailPayload,
  type WebView,
} from "@/components/mind-v2/use-web-app-router"
import { webKbHref } from "@/lib/web-app-routes"
import { cacheKbDocument, hubItemToLibraryDocument } from "@/lib/web-kb-document-cache"

export type { KbDetailPayload, WebView }
export { kbToDetailPayload }

const DEMO_AUTH_SESSION_KEY = "mind-v2-demo-auth"

const DEMO_CREDITS = {
  creditsRemaining: 32_400,
  creditsMonthlyAllowance: 50_000,
}

/** Tabs that already show credits in-page — no floating chip. */
const TABS_WITHOUT_FLOATING_CREDITS: WebTabType[] = ["plaza", "me", "memos"]

const DEMO_ME_STREAK_DAYS = 7

export function MindAppWeb() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authOverlayOpen, setAuthOverlayOpen] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const pendingAfterAuth = useRef<(() => void) | null>(null)
  const [activeAccountId] = useState<MindAccountId>("work")
  const [fontZoomPercent, setFontZoomPercent] = useState(MIND_FONT_ZOOM_DEFAULT)
  const [selectedKbId, setSelectedKbId] = useState<number | null>(null)
  const [agentHistoryDraft, setAgentHistoryDraft] = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState(MINDAR_COPILOT_AGENT.id)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [agentSidebarCollapsed, setAgentSidebarCollapsed] = useState(false)
  const [creditsModalOpen, setCreditsModalOpen] = useState(false)
  const [creditsOpenSignal, setCreditsOpenSignal] = useState(0)
  const [plazaSubscribedKbs, setPlazaSubscribedKbs] = useState<KnowledgeBase[]>(() => readPlazaSubscriptions())
  const [userPublishedPlazaRows, setUserPublishedPlazaRows] = useState<PlazaLibraryRow[]>([])
  const [recentPublicKbIds, setRecentPublicKbIds] = useState<number[]>(() =>
    resolveRecentPublicKbIds(readRecentPublicKbIds())
  )
  const [recentPrivateKbIds, setRecentPrivateKbIds] = useState<number[]>(() =>
    resolveRecentPrivateKbIds(readRecentPrivateKbIds())
  )
  const [focusNoteId, setFocusNoteId] = useState<number | null>(null)
  const [libraryNavSlot, setLibraryNavSlot] = useState<ReactNode>(null)
  const [timelineShareSheet, setTimelineShareSheet] = useState<MindSharePayload | null>(null)

  const recentKbIds = useMemo(
    () => [...recentPublicKbIds, ...recentPrivateKbIds],
    [recentPublicKbIds, recentPrivateKbIds]
  )

  function syncRecentsFromStorage() {
    setRecentPublicKbIds(resolveRecentPublicKbIds(readRecentPublicKbIds()))
    setRecentPrivateKbIds(resolveRecentPrivateKbIds(readRecentPrivateKbIds()))
  }

  const allKbsById = useMemo(() => {
    const map = new Map<number, KnowledgeBase>()
    for (const kb of MOCK_KNOWLEDGE_BASES) {
      map.set(kb.id, kb)
    }
    for (const row of [...MOCK_PLAZA_LIBRARIES, ...userPublishedPlazaRows]) {
      if (!map.has(row.kbId)) {
        map.set(row.kbId, plazaRowToKnowledgeBase(row))
      }
    }
    for (const kb of plazaSubscribedKbs) {
      map.set(kb.id, kb)
    }
    return map
  }, [plazaSubscribedKbs, userPublishedPlazaRows])

  const recentLibrariesForNav = useMemo(
    () =>
      recentKbIdsForNav()
        .map((id) => allKbsById.get(id))
        .filter((kb): kb is KnowledgeBase => Boolean(kb)),
    [allKbsById, recentPublicKbIds, recentPrivateKbIds]
  )

  const {
    location,
    currentView,
    activeTab,
    settingsOpen,
    shellMain,
    navigate,
    goToParent,
    switchTab,
    openNotebook,
    closeNotebook,
    openAgentChat,
    openKbChat,
    openMeTimeline,
    openMeTimelineDay,
    openSettings,
    closeSettings,
    selectLibraryKb,
    selectNote,
  } = useWebAppRouter(allKbsById)

  useEffect(() => {
    if (location.mode === "tab") {
      if (location.tab === "library") setSelectedKbId(location.kbId ?? null)
      if (location.tab === "memos") setFocusNoteId(location.noteId ?? null)
    } else if (location.mode === "kb") {
      setSelectedKbId(location.kbId)
    }
    if (location.mode === "agent-chat") setSelectedAgentId(location.agentId)
  }, [location])

  const onLibraryNavMount = useCallback((node: ReactNode) => {
    setLibraryNavSlot(node)
  }, [])

  useEffect(() => {
    if (activeTab !== "library") setLibraryNavSlot(null)
  }, [activeTab])

  function openMindarAgent() {
    const latest = latestGlobalAgentThread()
    noteAgentUsed(MINDAR_COPILOT_AGENT)
    setSelectedThreadId(latest?.id ?? null)
    setAgentHistoryDraft(latest?.title ?? null)
    requireAuthThen(() => {
      if (latest?.title) {
        openAgentChat(MINDAR_COPILOT_AGENT, latest.title)
      } else {
        switchTab("agent")
      }
    })
  }

  useEffect(() => {
    if (!shellMain || activeTab !== "agent") return
    if (location.mode !== "tab" || location.tab !== "agent") return
    const latest = latestGlobalAgentThread()
    if (!latest) return
    setSelectedThreadId(latest.id)
    openAgentChat(MINDAR_COPILOT_AGENT, latest.title)
  }, [shellMain, activeTab, location])

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
      switchTab("agent")
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [currentView.type, switchTab])

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && sessionStorage.getItem(DEMO_AUTH_SESSION_KEY) === "1") {
        setIsLoggedIn(true)
        if (
          sessionStorage.getItem(PENDING_ONBOARDING_SESSION_KEY) === "1" &&
          !readOnboardingComplete()
        ) {
          sessionStorage.removeItem(PENDING_ONBOARDING_SESSION_KEY)
          setOnboardingOpen(true)
        }
      }
    } catch {
      /* ignore */
    }
  }, [])

  function runPendingAfterAuth() {
    pendingAfterAuth.current?.()
    pendingAfterAuth.current = null
  }

  function maybeStartOnboarding(result?: MindAuthResult) {
    if (!result?.isNewSignup || readOnboardingComplete()) return false
    setOnboardingOpen(true)
    return true
  }

  function handleAuthenticated(result?: MindAuthResult) {
    try {
      sessionStorage.setItem(DEMO_AUTH_SESSION_KEY, "1")
    } catch {
      /* ignore */
    }
    setIsLoggedIn(true)
    setAuthOverlayOpen(false)
    if (maybeStartOnboarding(result)) return
    runPendingAfterAuth()
  }

  function completeLibraryOnboarding(rows: PlazaLibraryRow[]) {
    for (const row of rows) {
      subscribePlazaLibrary(plazaRowToKnowledgeBase(row))
    }
    refreshPlazaSubscriptions()
    writeOnboardingComplete()
    setOnboardingOpen(false)
    switchTab("plaza")
    toast.success("Libraries added", {
      description:
        rows.length === 1
          ? `"${rows[0].title}" is ready in your library.`
          : `${rows.length} libraries are ready to explore.`,
    })
    runPendingAfterAuth()
  }

  function skipLibraryOnboarding() {
    writeOnboardingComplete()
    setOnboardingOpen(false)
    runPendingAfterAuth()
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

  function shareTimelineDay(day: ActivityTimelineDay) {
    const account = getMindAccount(activeAccountId)
    const title = formatHeatmapDayLabel(day.isoDate)
    const sharePreview = buildDayShareCardText(
      day.isoDate,
      day.activity,
      account.displayName,
      DEMO_ME_STREAK_DAYS
    )
    const captures = getDayUploads(day.isoDate, day.activity).length
    const activityLine =
      day.activity > 0
        ? `${captures} capture${captures === 1 ? "" : "s"} · level ${day.activity}`
        : "A quiet day on my timeline"
    setTimelineShareSheet(
      buildTimelineSharePayload({
        displayName: account.displayName,
        dateLabel: title,
        slogan: getDayViralSlogan(day.isoDate, day.activity),
        activityLine,
        streakDays: DEMO_ME_STREAK_DAYS,
        body: sharePreview,
      })
    )
  }

  function openNotebookWithRecents(
    kb: KnowledgeBase,
    options?: { openTeamInfo?: boolean; initialFocusStudio?: boolean }
  ) {
    touchRecentKbFromBase(kb)
    syncRecentsFromStorage()
    setSelectedKbId(kb.id)
    openNotebook(kb, options)
  }

  function plazaDiscoverAccessForRow(row: PlazaLibraryRow) {
    const kb = plazaRowToKnowledgeBase(row)
    const access = plazaAccessForKb(kbToDetailPayload(kb))
    const canChat = access.isSubscribed || access.isOwner
    return {
      access,
      kb,
      chatDisabled: !canChat,
      chatDisabledReason: canChat ? undefined : "Subscribe to ask Mindar about this library",
    }
  }

  function openPlazaNotebookFromDiscover(row: PlazaLibraryRow) {
    const { kb } = plazaDiscoverAccessForRow(row)
    requireAuthThen(() => openNotebookWithRecents(kb))
  }

  function openPlazaChatFromDiscover(row: PlazaLibraryRow, prompt?: string) {
    const { kb, access } = plazaDiscoverAccessForRow(row)
    requireAuthThen(() => {
      if (!access.isSubscribed && !access.isOwner) {
        access.onSubscribe?.()
      }
      touchRecentKbFromBase(kb)
      syncRecentsFromStorage()
      setSelectedKbId(kb.id)
      openKbChat(kb.id, prompt)
    })
  }

  const agentSidebarScope: AgentChatScope =
    currentView.type === "agent-chat"
      ? currentView.chatScope
      : { type: "global" }

  return (
    <div
      className={cn("min-h-screen font-sans antialiased", web.softType)}
      style={{ zoom: fontZoomPercent / 100 }}
    >
      <div className={cn("flex h-screen min-h-0 w-full overflow-hidden", web.shell)}>
        <WebShellNavPanel
            activeTab={activeTab}
            onTabChange={switchTab}
            onOpenAgent={openMindarAgent}
            activeAccountId={activeAccountId}
            libraryNav={libraryNavSlot}
            recentLibraries={recentLibrariesForNav}
            selectedKbId={selectedKbId}
            onOpenLibraryKb={(kb) =>
              requireAuthThen(() => {
                if (kb.category === "mine" || kb.category === "team") {
                  openNotebookWithRecents(kb)
                  return
                }
                selectLibraryKb(kb.id)
              })
            }
            onMoreLibraries={() => switchTab("library")}
          />

        <WebWorkspaceChromeProvider
          creditsRemaining={DEMO_CREDITS.creditsRemaining}
          onOpenCredits={() => setCreditsModalOpen(true)}
        >
        <div className={cn("relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden", web.canvas)}>
          {shellMain && !TABS_WITHOUT_FLOATING_CREDITS.includes(activeTab) ? (
            <div className="pointer-events-none absolute right-6 top-4 z-30">
              <div className="pointer-events-auto">
                <WebCreditsChip
                  creditsRemaining={DEMO_CREDITS.creditsRemaining}
                  onOpenCredits={() => setCreditsModalOpen(true)}
                />
              </div>
            </div>
          ) : null}

          <div className={cn("flex min-h-0 min-w-0 flex-1 overflow-hidden", web.canvas)}>
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

        {activeTab === "agent" && (shellMain || currentView.type === "agent-chat") ? (
          <WebAgentSidebar
            chatScope={agentSidebarScope}
            selectedThreadId={selectedThreadId}
            collapsed={agentSidebarCollapsed}
            onToggleCollapsed={() => setAgentSidebarCollapsed((v) => !v)}
            onNewChat={() => {
              setSelectedThreadId(null)
              setAgentHistoryDraft("")
              requireAuthThen(() => {
                if (agentSidebarScope.type === "kb") {
                  navigate(webMindarChatHref({ kb: agentSidebarScope.kbId }))
                } else if (agentSidebarScope.type === "note") {
                  navigate(webMindarChatHref({ note: agentSidebarScope.noteId }))
                } else {
                  switchTab("agent")
                }
                toast.message("New chat", { description: "Fresh thread in this scope (demo)." })
              })
            }}
            onSelectThread={(thread) => {
              setSelectedThreadId(thread.id)
              setAgentHistoryDraft(thread.title)
              requireAuthThen(() => {
                if (thread.scopeKey.startsWith("kb:")) {
                  const kbId = parseInt(thread.scopeKey.slice(3), 10)
                  if (!Number.isNaN(kbId)) openKbChat(kbId, thread.title)
                } else if (thread.scopeKey.startsWith("note:")) {
                  const noteId = parseInt(thread.scopeKey.slice(5), 10)
                  if (!Number.isNaN(noteId)) navigate(webMindarChatHref({ note: noteId, q: thread.title }))
                } else {
                  openAgentChat(MINDAR_COPILOT_AGENT, thread.title)
                }
              })
            }}
            onOpenScopedChat={(scope) => {
              requireAuthThen(() => {
                if (scope.type === "kb") openKbChat(scope.kbId)
                else if (scope.type === "note") navigate(webMindarChatHref({ note: scope.noteId }))
                else switchTab("agent")
              })
            }}
            onSearchThreads={() =>
              toast.message("Search chats", { description: "Find threads by library, note, or title (demo)." })
            }
          />
        ) : null}

        <main
          key={shellMain ? activeTab : currentView.type}
          className={cn("relative min-h-0 min-w-0 flex-1 overflow-hidden", webNavMotion.contentEnter)}
        >
          {shellMain && activeTab === "library" && (
            <WebKnowledgeBrowser
              integratedNav="shell"
              onLibraryNavMount={onLibraryNavMount}
              selectedKbId={selectedKbId}
              recentKbIds={recentKbIds}
              onSelectKb={(kb) => {
                if (kb.category === "mine") {
                  requireAuthThen(() => openNotebookWithRecents(kb))
                  return
                }
                selectLibraryKb(kb.id)
              }}
              onDeselectKb={() => selectLibraryKb(null)}
              onOpenWorkspace={(kb) => requireAuthThen(() => openNotebookWithRecents(kb))}
              onOpenDocument={(kb, item) =>
                requireAuthThen(() => {
                  const doc = hubItemToLibraryDocument(item)
                  cacheKbDocument(kb.id, doc)
                  touchRecentKbFromBase(kb)
                  navigate(webKbHref(kb.id, "doc", { docId: doc.id }))
                })
              }
              onBrowsePlaza={() => switchTab("plaza")}
              requireAuthThen={requireAuthThen}
              extraSubscribedKbs={plazaSubscribedKbs}
              onKbCreated={(kb) => touchRecentKbFromBase(kb)}
              onLibraryPublished={(kb) =>
                setUserPublishedPlazaRows((prev) => {
                  const row = knowledgeBaseToPlazaRow(kb)
                  return [row, ...prev.filter((r) => r.kbId !== kb.id)]
                })
              }
            />
          )}

          {shellMain && activeTab === "plaza" && (
            <WebPlazaDiscoverPage
              onBrowseLibrary={openPlazaNotebookFromDiscover}
              onStartThread={openPlazaChatFromDiscover}
              extraPlazaRows={userPublishedPlazaRows}
            />
          )}

          {shellMain && activeTab === "memos" && (
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

          {shellMain && activeTab === "me" && (
            <WebMeTab
              activeAccountId={activeAccountId}
              onActiveAccountChange={() => {}}
              fontZoomPercent={fontZoomPercent}
              onFontZoomPercentChange={setFontZoomPercent}
              settingsOpen={settingsOpen}
              onOpenSettings={() => requireAuthThen(openSettings)}
              onCloseSettings={closeSettings}
              creditsOpenSignal={creditsOpenSignal}
              onOpenCreditsPlans={() => requireAuthThen(() => setCreditsModalOpen(true))}
              onOpenTimeline={() => requireAuthThen(openMeTimeline)}
              onOpenTimelineDay={(day) =>
                requireAuthThen(() => openMeTimelineDay(day, "me"))
              }
            />
          )}

          {currentView.type === "me-timeline" && (
            <WebMeTimelinePage
              displayName={getMindAccount(activeAccountId).displayName}
              onBack={goToParent}
              onOpenDay={(day) => openMeTimelineDay(day, "me-timeline")}
              onShare={shareTimelineDay}
            />
          )}

          {currentView.type === "me-timeline-day" && (
            <WebMeTimelineDayPage
              isoDate={currentView.isoDate}
              activity={currentView.activity}
              displayName={getMindAccount(activeAccountId).displayName}
              onBack={goToParent}
              onShare={shareTimelineDay}
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
                requireAuthThen(() => {
                  if (currentView.kb.id != null) {
                    openKbChat(currentView.kb.id, context.initialPrompt)
                  }
                })
              }
              plazaAccess={
                currentView.kb.isPublicKb ? plazaAccessForKb(currentView.kb) : undefined
              }
              onOpenDocumentEditor={(title) => {
                if (currentView.kb.id == null) return
                navigate(webKbHref(currentView.kb.id, "content-editor", { docTitle: title }))
              }}
              onOpenRichTextEditor={() => {
                if (currentView.kb.id == null) return
                navigate(webKbHref(currentView.kb.id, "rich-editor"))
              }}
            />
          )}

          {currentView.type === "kb-rich-editor" && (
            <WebKbRichTextEditorPage
              kb={currentView.kb}
              onBack={goToParent}
              requireAuthThen={requireAuthThen}
              onSave={() => {
                toast.success("Note saved", { description: "Added to library sources (demo)." })
              }}
            />
          )}

          {currentView.type === "kb-document" && (
            <WebKbDocumentReaderPage
              kb={currentView.kb}
              document={currentView.document}
              onBack={goToParent}
              onOpenLibrary={() => {
                if (currentView.kb.id == null) return
                navigate(
                  webKbHref(currentView.kb.id, "detail", {
                    initialOpenContentId: currentView.document.id,
                  })
                )
              }}
              onOpenAgentChat={() => {
                if (currentView.kb.id == null) return
                requireAuthThen(() =>
                  openKbChat(
                    currentView.kb.id!,
                    `Help me understand “${currentView.document.title}”.`
                  )
                )
              }}
              requireAuthThen={requireAuthThen}
            />
          )}

          {currentView.type === "agent-chat" && (
            <WebAgentWorkspace
              chatScope={currentView.chatScope}
              kbContext={currentView.chatScope.type === "kb" ? currentView.kbContext : undefined}
              initialPrompt={currentView.initialPrompt}
              onBack={() => {
                noteAgentUsed(MINDAR_COPILOT_AGENT)
                goToParent()
              }}
              requireAuthThen={requireAuthThen}
            />
          )}

          {currentView.type === "editor" && (
            <WebDocumentEditorPage
              title={currentView.docTitle}
              onBack={goToParent}
            />
          )}
        </main>
          </div>
        </div>
        </WebWorkspaceChromeProvider>

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

        <MindShareSheet
          open={timelineShareSheet != null}
          payload={timelineShareSheet}
          onClose={() => setTimelineShareSheet(null)}
        />

        {onboardingOpen ? (
          <div
            className="fixed inset-0 z-[210] flex min-h-0 flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Library recommendations"
          >
            <WebLibraryOnboarding
              onComplete={completeLibraryOnboarding}
              onSkip={skipLibraryOnboarding}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
