"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import type { MindAccountId } from "@/lib/mind-accounts"
import type { NoteFolder } from "@/lib/note-folders"
import { BottomNav, type TabType } from "./bottom-nav"
import { NotesTab, mockNotes, type Note } from "./notes-tab"
import { NoteDetail } from "./note-detail"
import { KnowledgeTab } from "./knowledge-tab"
import { KnowledgeDetail } from "./knowledge-detail"
import { AgentTab, AgentChat } from "./agent-tab"
import { MeTab } from "./me-tab"
import { RecordingPage } from "./recording-page"
import type { FactoryModalKind } from "./content-factory-modals"

type View = 
  | { type: "tabs" }
  | { type: "note-detail"; note?: Note }
  | { type: "recording" }
  | {
      type: "kb-detail"
      kb?: { name: string; color: string; description?: string; coverImage?: string }
      initialView?: "content" | "graph" | "factory"
      initialFactoryModal?: FactoryModalKind
    }
  | { type: "agent-chat"; agent: { id: number; name: string; description: string; avatar: string; color: string } }
  | {
      type: "kb-agent-chat"
      context: { kbName: string; contentTitle?: string }
      /** Preserve notebook when returning from library Chat */
      kb?: { name: string; color: string; description?: string; coverImage?: string }
      initialView?: "content" | "graph" | "factory"
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
  const [activeTab, setActiveTab] = useState<TabType>("notes")
  const [currentView, setCurrentView] = useState<View>({ type: "tabs" })
  const [activeAccountId, setActiveAccountId] = useState<MindAccountId>("work")
  const [folders, setFolders] = useState<NoteFolder[]>([
    { id: SEED_FOLDER_WELCOME, name: "Welcome", color: "#0284c7", iconKey: "folder" },
    { id: SEED_FOLDER_TUTORIAL, name: "Tutorial", color: "#0ea5e9", iconKey: "folder" },
  ])
  const [notes, setNotes] = useState<Note[]>(() =>
    mockNotes.map((n) =>
      n.id === 1 ? { ...n, folderId: SEED_FOLDER_WELCOME } : n.id === 2 ? { ...n, folderId: SEED_FOLDER_TUTORIAL } : n
    )
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50/80 via-stone-50 to-teal-50/50 p-4 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Phone chrome */}
      <div className="relative h-[844px] w-[390px] overflow-hidden rounded-[3rem] border-[14px] border-zinc-700 bg-white shadow-2xl dark:border-zinc-600 dark:bg-zinc-900">
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-50 h-[35px] w-[120px] -translate-x-1/2 rounded-b-3xl bg-zinc-700 dark:bg-zinc-800" />
        
        {/* Status bar */}
        <div className="absolute left-0 right-0 top-0 z-40 flex h-[50px] items-end justify-between bg-transparent px-8 pb-1">
          <span className="text-[13px] font-semibold text-gray-900 dark:text-zinc-100">9:41</span>
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
                    onNoteClick={(note) => setCurrentView({ type: "note-detail", note })}
                    onStartRecording={() => setCurrentView({ type: "recording" })}
                  />
                )}
                {activeTab === "knowledge" && (
                  <KnowledgeTab
                    onKBClick={(kb) =>
                      setCurrentView({
                        type: "kb-detail",
                        kb: {
                          name: kb.name,
                          color: kb.color,
                          description: kb.description,
                          coverImage: kb.coverImage,
                        },
                      })
                    }
                  />
                )}
                {activeTab === "agent" && (
                  <AgentTab
                    onAgentChat={(agent) =>
                      setCurrentView({
                        type: "agent-chat",
                        agent,
                      })
                    }
                  />
                )}
                {activeTab === "me" && (
                  <MeTab
                    activeAccountId={activeAccountId}
                    onActiveAccountChange={setActiveAccountId}
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
              />
            )}

            {/* Recording */}
            {currentView.type === "recording" && (
              <RecordingPage
                onStop={() => setCurrentView({ type: "note-detail" })}
                onClose={() => setCurrentView({ type: "tabs" })}
              />
            )}

            {/* Library detail */}
            {currentView.type === "kb-detail" && (
              <KnowledgeDetail
                onBack={() => setCurrentView({ type: "tabs" })}
                knowledgeBase={currentView.kb}
                initialView={currentView.initialView}
                initialFactoryModal={currentView.initialFactoryModal}
                onAgentChat={(context) =>
                  setCurrentView({
                    type: "kb-agent-chat",
                    context,
                    kb: currentView.kb,
                    initialView: currentView.initialView,
                  })
                }
              />
            )}

            {/* Agent chat */}
            {currentView.type === "agent-chat" && (
              <AgentChat
                agent={currentView.agent}
                onBack={() => setCurrentView({ type: "tabs" })}
              />
            )}

            {/* Library-grounded agent chat */}
            {currentView.type === "kb-agent-chat" && (
              <AgentChat
                agent={{
                  id: 999,
                  name: "Chat",
                  description: currentView.context.contentTitle
                    ? `Grounded on “${currentView.context.contentTitle}” and your library`
                    : `Grounded on “${currentView.context.kbName}” and your library`,
                  avatar: "💬",
                  color: "from-sky-400 to-sky-700",
                }}
                entryHint="Route what you saved into answers and artifacts: retrieve, connect, and ship outcomes—not one-off replies disconnected from your library."
                onBack={() =>
                  setCurrentView({
                    type: "kb-detail",
                    kb: currentView.kb,
                    initialView: currentView.initialView,
                  })
                }
              />
            )}
          </div>

          {/* Bottom nav (tabs only) */}
          {currentView.type === "tabs" && (
            <div className="shrink-0 overflow-visible bg-gradient-to-t from-[#fafaf9] via-[#fafaf9]/85 to-transparent pb-0.5 pt-1 dark:from-zinc-950 dark:via-zinc-950/90 dark:to-transparent">
              <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          )}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-zinc-500/80 dark:bg-zinc-400/70" />
      </div>
    </div>
  )
}
