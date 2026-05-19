"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Moon, Sun } from "lucide-react"
import type { MindAccountId } from "@/lib/mind-accounts"
import type { NoteFolder } from "@/lib/note-folders"
import { BottomNav, type TabType } from "./bottom-nav"
import { NotesTab, createRecordingNote, mockNotes, type Note } from "./notes-tab"
import { NoteDetail } from "./note-detail"
import { KnowledgeTab } from "./knowledge-tab"
import { KnowledgeDetail, type LibraryChatLaunchContext } from "./knowledge-detail"
import { AgentTab, AgentChat } from "./agent-tab"
import { MeTab } from "./me-tab"
import { ActiveRecordingView, type RecordingCaptureEntry } from "./active-recording-view"
import { isNoteRecording } from "@/lib/note-status"
import type { FactoryModalKind } from "./content-factory-modals"
import type { KBCategory, KnowledgeBase, TeamLibrarySettings } from "@/lib/mock-knowledge-bases"
import { MindAuthScreens } from "./mind-auth-screens"
import {
  MIND_FONT_ZOOM_DEFAULT,
  readStoredFontZoomPercent,
  writeStoredFontZoomPercent,
} from "@/lib/mind-display-prefs"

const DEMO_AUTH_SESSION_KEY = "mind-v2-demo-auth"

type View = 
  | { type: "tabs" }
  | { type: "note-detail"; note?: Note }
  | { type: "active-recording"; note: Note; entries?: RecordingCaptureEntry[] }
  | {
      type: "kb-detail"
      kb?: {
        name: string
        color: string
        description?: string
        coverImage?: string
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
      }
      initialView?: "content" | "graph" | "factory"
      initialFactoryModal?: FactoryModalKind
      initialOpenTeamInfo?: boolean
      initialOpenContentId?: number
    }
  | {
      type: "agent-chat"
      agent: { id: number; name: string; description: string; avatar: string; color: string }
      initialPrompt?: string
      initialChatMode?: "dialog" | "agent"
      initialModelLabel?: string
    }
  | {
      type: "kb-agent-chat"
      context: LibraryChatLaunchContext
      /** Preserve notebook when returning from library Chat */
      kb?: {
        name: string
        color: string
        description?: string
        coverImage?: string
        isPublicKb?: boolean
        contentCount?: number
        subscriberCount?: number
        viewCount?: number
        publicTagline?: string
        publisherName?: string
        initialLikeCount?: number
        initialCommentCount?: number
        category?: KBCategory
      }
      initialView?: "content" | "graph" | "factory"
    }

function kbToDetailPayload(kb: KnowledgeBase) {
  return {
    name: kb.name,
    color: kb.color,
    description: kb.description,
    coverImage: kb.coverImage,
    isPublicKb: kb.category === "subscribed",
    contentCount: kb.count,
    subscriberCount: kb.subscribers,
    viewCount: kb.viewCount,
    publicTagline: kb.publicTagline,
    publisherName: kb.publisherName,
    initialLikeCount: kb.category === "subscribed" ? 56 : undefined,
    initialCommentCount: kb.category === "subscribed" ? 1 : undefined,
    category: kb.category,
    teamSettings: kb.teamSettings,
  }
}

const SEED_FOLDER_WELCOME = "seed-folder-welcome"
const SEED_FOLDER_TUTORIAL = "seed-folder-tutorial"

function MindThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return <span className="inline-flex h-7 w-7 shrink-0" aria-hidden />
  }
  const dark = resolvedTheme === "dark"
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="shrink-0 rounded-full p-1.5 text-zinc-800 transition-colors hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/10"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun className="h-[15px] w-[15px]" strokeWidth={2} /> : <Moon className="h-[15px] w-[15px]" strokeWidth={2} />}
    </button>
  )
}

export function MindAppV2() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authOverlayOpen, setAuthOverlayOpen] = useState(false)
  const pendingAfterAuth = useRef<(() => void) | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("notes")
  const [currentView, setCurrentView] = useState<View>({ type: "tabs" })
  const [activeAccountId, setActiveAccountId] = useState<MindAccountId>("work")
  const [folders, setFolders] = useState<NoteFolder[]>([
    { id: SEED_FOLDER_WELCOME, name: "Welcome", color: "#0284c7", iconKey: "folder" },
    { id: SEED_FOLDER_TUTORIAL, name: "Tutorial", color: "#0284c7", iconKey: "folder" },
  ])
  const [notes, setNotes] = useState<Note[]>(() =>
    mockNotes.map((n) =>
      n.id === 3 ? { ...n, folderId: SEED_FOLDER_WELCOME } : n.id === 4 ? { ...n, folderId: SEED_FOLDER_TUTORIAL } : n
    )
  )
  const [fontZoomPercent, setFontZoomPercent] = useState(MIND_FONT_ZOOM_DEFAULT)
  const [recordingEntriesByNoteId, setRecordingEntriesByNoteId] = useState<
    Record<number, RecordingCaptureEntry[]>
  >({})

  useEffect(() => {
    setFontZoomPercent(readStoredFontZoomPercent())
  }, [])

  function handleFontZoomPercentChange(next: number) {
    setFontZoomPercent(next)
    writeStoredFontZoomPercent(next)
  }

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && sessionStorage.getItem(DEMO_AUTH_SESSION_KEY) === "1") {
        setIsLoggedIn(true)
      }
    } catch {
      /* ignore */
    }
  }, [])

  function persistDemoSession() {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(DEMO_AUTH_SESSION_KEY, "1")
      }
    } catch {
      /* ignore */
    }
  }

  function clearDemoSession() {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(DEMO_AUTH_SESSION_KEY)
      }
    } catch {
      /* ignore */
    }
  }

  function handleAuthenticated() {
    persistDemoSession()
    setIsLoggedIn(true)
    setAuthOverlayOpen(false)
    const next = pendingAfterAuth.current
    pendingAfterAuth.current = null
    next?.()
  }

  function handleDismissAuthOverlay() {
    pendingAfterAuth.current = null
    setAuthOverlayOpen(false)
  }

  /** Run immediately if logged in; otherwise open full-screen auth and run after successful sign-in. */
  function requireAuthThen(run: () => void) {
    if (isLoggedIn) {
      run()
      return
    }
    pendingAfterAuth.current = run
    setAuthOverlayOpen(true)
  }

  function handleSessionSignOut() {
    clearDemoSession()
    setIsLoggedIn(false)
    setAuthOverlayOpen(false)
    pendingAfterAuth.current = null
    setCurrentView({ type: "tabs" })
    setActiveTab("notes")
    toast.message("Signed out", { description: "Sign in again to continue the demo." })
  }

  function startRecordingFlow() {
    const nextId = notes.reduce((max, n) => Math.max(max, n.id), 0) + 1
    const newNote = createRecordingNote(nextId)
    setNotes((prev) => [newNote, ...prev])
    setCurrentView({ type: "active-recording", note: newNote, entries: [] })
  }

  function openNoteFromList(note: Note) {
    if (isNoteRecording(note)) {
      setCurrentView({
        type: "active-recording",
        note,
        entries: recordingEntriesByNoteId[note.id] ?? [],
      })
      return
    }
    requireAuthThen(() => setCurrentView({ type: "note-detail", note }))
  }

  function finishActiveRecording(
    note: Note,
    payload: { durationSec: number; entries: RecordingCaptureEntry[] }
  ) {
    const mins = Math.floor(payload.durationSec / 60)
    const secs = payload.durationSec % 60
    const duration = `${mins}:${String(secs).padStart(2, "0")}`
    const markCount = payload.entries.filter((e) => e.kind === "mark").length
    const updated: Note = {
      ...note,
      status: "synced",
      duration,
      highlightCount: markCount > 0 ? markCount : undefined,
      listSubtitle: undefined,
    }
    setRecordingEntriesByNoteId((prev) => ({ ...prev, [note.id]: payload.entries }))
    setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)))
    setCurrentView({ type: "note-detail", note: updated })
    toast.success("Recording saved", { description: "Open the note to generate a summary." })
  }

  function navigateToKnowledgeForStudio() {
    setActiveTab("knowledge")
    setCurrentView({ type: "tabs" })
    toast.message("Studio", {
      description: "Open a notebook, then switch to the Studio tab to run outputs.",
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-mind/80 via-stone-50 to-mind/50 p-4 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Phone chrome */}
      <div
        className="relative h-[844px] w-[390px] overflow-hidden rounded-[3rem] border-[14px] border-zinc-700 bg-white font-sans shadow-2xl dark:border-zinc-600 dark:bg-zinc-900"
        style={{ zoom: fontZoomPercent / 100 }}
      >
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-50 h-[35px] w-[120px] -translate-x-1/2 rounded-b-3xl bg-zinc-700 dark:bg-zinc-800" />
        
        {/* Status bar */}
        <div className="absolute left-0 right-0 top-0 z-40 flex h-[50px] items-end justify-between bg-transparent px-8 pb-1">
          <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">9:41</span>
          <div className="flex items-center gap-1">
            {/* Cellular */}
            <svg className="h-[12px] w-[18px] text-zinc-800 dark:text-zinc-200" viewBox="0 0 18 12" fill="currentColor">
              <rect x="0" y="8" width="3" height="4" rx="0.5"/>
              <rect x="5" y="5" width="3" height="7" rx="0.5"/>
              <rect x="10" y="2" width="3" height="10" rx="0.5"/>
              <rect x="15" y="0" width="3" height="12" rx="0.5"/>
            </svg>
            {/* WiFi */}
            <svg className="w-[16px] h-[12px] text-zinc-800 dark:text-zinc-200" viewBox="0 0 16 12" fill="currentColor">
              <path d="M8 2.4c2.5 0 4.8 1 6.5 2.6l-1.3 1.4c-1.4-1.3-3.2-2-5.2-2s-3.8.7-5.2 2L1.5 5c1.7-1.6 4-2.6 6.5-2.6zm0 4c1.5 0 2.8.6 3.9 1.5L10.6 9.3c-.7-.7-1.6-1-2.6-1s-1.9.4-2.6 1L4.1 7.9c1.1-1 2.4-1.5 3.9-1.5zM8 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
            </svg>
            <MindThemeToggle />
            {/* Battery */}
            <div className="flex items-center gap-0.5">
              <div className="relative h-[12px] w-[25px] rounded-[3px] border-[1.5px] border-zinc-700 p-[1.5px] dark:border-zinc-500">
                <div className="h-full rounded-[1px] bg-zinc-700 dark:bg-zinc-400" style={{ width: "85%" }} />
              </div>
              <div className="h-[5px] w-[1.5px] rounded-r-full bg-zinc-700 dark:bg-zinc-500" />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="absolute inset-0 flex min-h-0 flex-col pt-[50px] pb-0">
          <div className="relative min-h-0 flex-1 overflow-hidden">
            {/* Tab root */}
            {currentView.type === "tabs" && (
              <>
                {activeTab === "notes" && (
                  <NotesTab
                    activeAccountId={activeAccountId}
                    notes={notes}
                    folders={folders}
                    onNotesChange={setNotes}
                    onNoteClick={openNoteFromList}
                    onStartRecording={startRecordingFlow}
                  />
                )}
                {activeTab === "knowledge" && (
                  <KnowledgeTab
                    requireAuthThen={requireAuthThen}
                    onKBClick={(kb, options) =>
                      setCurrentView({
                        type: "kb-detail",
                        kb: kbToDetailPayload(kb),
                        initialOpenTeamInfo: options?.openTeamInfo,
                      })
                    }
                  />
                )}
                {activeTab === "agent" && (
                  <AgentTab
                    requireAuthThen={requireAuthThen}
                    onAgentChat={(agent, options) =>
                      requireAuthThen(() =>
                        setCurrentView({
                          type: "agent-chat",
                          agent,
                          initialPrompt: options?.initialPrompt,
                          initialChatMode: options?.initialChatMode,
                          initialModelLabel: options?.initialModelLabel,
                        })
                      )
                    }
                  />
                )}
                {activeTab === "me" && (
                  <MeTab
                    activeAccountId={activeAccountId}
                    onActiveAccountChange={setActiveAccountId}
                    onSessionSignOut={handleSessionSignOut}
                    fontZoomPercent={fontZoomPercent}
                    onFontZoomPercentChange={handleFontZoomPercentChange}
                  />
                )}
              </>
            )}

            {/* Note detail (recording/import) */}
            {currentView.type === "note-detail" && (
              <NoteDetail
                note={currentView.note}
                onBack={() => setCurrentView({ type: "tabs" })}
                onMovedToLibrary={(kb) => {
                  setActiveTab("knowledge")
                  setCurrentView({ type: "kb-detail", kb })
                }}
                onAssignNoteToNewFolder={(noteId, folder) => {
                  setFolders((prev) => [...prev, folder])
                  setNotes((prev) =>
                    prev.map((n) => (n.id === noteId ? { ...n, folderId: folder.id } : n))
                  )
                }}
                onTrashNote={(noteId) => {
                  setNotes((prev) => prev.filter((n) => n.id !== noteId))
                  setCurrentView({ type: "tabs" })
                }}
                onNoteAnalyzed={(noteId, patch) => {
                  setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, ...patch } : n)))
                  setCurrentView((view) =>
                    view.type === "note-detail" && view.note?.id === noteId
                      ? { ...view, note: { ...view.note, ...patch } }
                      : view
                  )
                }}
              />
            )}

            {/* Active recording (in-progress note) */}
            {currentView.type === "active-recording" && (
              <ActiveRecordingView
                key={currentView.note.id}
                title={currentView.note.title}
                initialEntries={currentView.entries}
                onEnd={(payload) => finishActiveRecording(currentView.note, payload)}
                onPersist={(payload) => {
                  setRecordingEntriesByNoteId((prev) => ({
                    ...prev,
                    [currentView.note.id]: payload.entries,
                  }))
                }}
                onClose={() => setCurrentView({ type: "tabs" })}
              />
            )}

            {/* Library detail */}
            {currentView.type === "kb-detail" && (
              <KnowledgeDetail
                requireAuthThen={requireAuthThen}
                onBack={() => setCurrentView({ type: "tabs" })}
                knowledgeBase={currentView.kb}
                initialView={currentView.initialView}
                initialFactoryModal={currentView.initialFactoryModal}
                initialOpenTeamInfo={currentView.initialOpenTeamInfo}
                initialOpenContentId={currentView.initialOpenContentId}
                onAgentChat={(context) =>
                  requireAuthThen(() =>
                    setCurrentView({
                      type: "kb-agent-chat",
                      context,
                      kb: currentView.kb,
                      initialView: currentView.initialView,
                    })
                  )
                }
              />
            )}

            {/* Agent chat */}
            {currentView.type === "agent-chat" && (
              <AgentChat
                requireAuthThen={requireAuthThen}
                agent={currentView.agent}
                initialPrompt={currentView.initialPrompt}
                initialChatMode={currentView.initialChatMode}
                initialModelLabel={currentView.initialModelLabel}
                onBack={() => setCurrentView({ type: "tabs" })}
                onNavigateToKnowledge={navigateToKnowledgeForStudio}
              />
            )}

            {/* Library-grounded agent chat */}
            {currentView.type === "kb-agent-chat" && (
              <AgentChat
                requireAuthThen={requireAuthThen}
                agent={{
                  id: 999,
                  name: "Chat",
                  description: currentView.context.contentTitle
                    ? `Grounded on “${currentView.context.contentTitle}” and your library`
                    : `Grounded on “${currentView.context.kbName}” and your library`,
                  avatar: "💬",
                  color: "from-mind/38 to-mind",
                }}
                entryHint="Route what you saved into answers and artifacts: retrieve, connect, and ship outcomes—not one-off replies disconnected from your library."
                knowledgeContext={{
                  kbName: currentView.context.kbName,
                  contentTitle: currentView.context.contentTitle,
                }}
                initialPrompt={currentView.context.initialPrompt}
                initialChatMode={currentView.context.initialChatMode}
                initialModelLabel={currentView.context.initialModelLabel}
                onBack={() =>
                  setCurrentView({
                    type: "kb-detail",
                    kb: currentView.kb,
                    initialView: currentView.initialView,
                    initialOpenContentId: currentView.context.contentDocId,
                  })
                }
                onNavigateToKnowledge={(factoryKind) => {
                  setCurrentView({
                    type: "kb-detail",
                    kb: currentView.kb,
                    initialView: "factory",
                    initialFactoryModal: factoryKind,
                  })
                  if (!factoryKind) {
                    toast.message("Studio", {
                      description: "Pick an output type from the Studio tab.",
                    })
                  }
                }}
              />
            )}
          </div>

          {/* Bottom nav (tabs only) */}
          {currentView.type === "tabs" && (
            <div className="shrink-0 overflow-visible bg-stone-50 dark:bg-zinc-950">
              <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          )}

          {/* Full-bleed auth inside device chrome (browse first; opens from gated actions) */}
          {authOverlayOpen ? (
            <div
              className="absolute inset-0 z-[100] flex min-h-0 flex-col bg-gradient-to-b from-mind/95 via-white to-stone-50/95 pt-[50px] dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mind-auth-title"
            >
              <div className="flex min-h-0 flex-1 flex-col">
                <MindAuthScreens
                  onAuthenticated={handleAuthenticated}
                  onDismiss={handleDismissAuthOverlay}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-zinc-500/80 dark:bg-zinc-400/70" />
      </div>
    </div>
  )
}
