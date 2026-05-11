"use client"

import { useState } from "react"
import type { MindAccountId } from "@/lib/mind-accounts"
import { BottomNav, type TabType } from "./bottom-nav"
import { NotesTab, type Note } from "./notes-tab"
import { NoteDetail } from "./note-detail"
import { KnowledgeTab } from "./knowledge-tab"
import { KnowledgeDetail } from "./knowledge-detail"
import { AgentTab, AgentChat } from "./agent-tab"
import { MeTab } from "./me-tab"
import { RecordingPage } from "./recording-page"

type View = 
  | { type: "tabs" }
  | { type: "note-detail"; note?: Note }
  | { type: "recording" }
  | { type: "kb-detail"; kb?: { name: string; color: string; description?: string }; initialView?: "content" | "graph" | "factory" }
  | { type: "agent-chat"; agent: { id: number; name: string; description: string; avatar: string; color: string } }
  | {
      type: "kb-agent-chat"
      context: { kbName: string; contentTitle?: string }
      /** Preserve notebook when returning from Mind Agent chat */
      kb?: { name: string; color: string; description?: string }
      initialView?: "content" | "graph" | "factory"
    }

export function MindAppV2() {
  const [activeTab, setActiveTab] = useState<TabType>("notes")
  const [currentView, setCurrentView] = useState<View>({ type: "tabs" })
  const [activeAccountId, setActiveAccountId] = useState<MindAccountId>("work")

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50/80 via-stone-50 to-teal-50/50 p-4">
      {/* Phone chrome */}
      <div className="relative w-[390px] h-[844px] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[14px] border-zinc-700">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-zinc-700 rounded-b-3xl z-50" />
        
        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 h-[50px] bg-transparent z-40 flex items-end justify-between px-8 pb-1">
          <span className="text-[13px] font-semibold text-gray-900">9:41</span>
          <div className="flex items-center gap-1.5">
            {/* Cellular */}
            <svg className="w-[18px] h-[12px] text-zinc-800" viewBox="0 0 18 12" fill="currentColor">
              <rect x="0" y="8" width="3" height="4" rx="0.5"/>
              <rect x="5" y="5" width="3" height="7" rx="0.5"/>
              <rect x="10" y="2" width="3" height="10" rx="0.5"/>
              <rect x="15" y="0" width="3" height="12" rx="0.5"/>
            </svg>
            {/* WiFi */}
            <svg className="w-[16px] h-[12px] text-zinc-800" viewBox="0 0 16 12" fill="currentColor">
              <path d="M8 2.4c2.5 0 4.8 1 6.5 2.6l-1.3 1.4c-1.4-1.3-3.2-2-5.2-2s-3.8.7-5.2 2L1.5 5c1.7-1.6 4-2.6 6.5-2.6zm0 4c1.5 0 2.8.6 3.9 1.5L10.6 9.3c-.7-.7-1.6-1-2.6-1s-1.9.4-2.6 1L4.1 7.9c1.1-1 2.4-1.5 3.9-1.5zM8 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
            </svg>
            {/* Battery */}
            <div className="flex items-center gap-0.5">
              <div className="w-[25px] h-[12px] border-[1.5px] border-zinc-700 rounded-[3px] relative p-[1.5px]">
                <div className="h-full bg-zinc-700 rounded-[1px]" style={{ width: '85%' }} />
              </div>
              <div className="w-[1.5px] h-[5px] bg-zinc-700 rounded-r-full" />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="absolute inset-0 pt-[50px] pb-0 flex flex-col">
          <div className="flex-1 overflow-hidden relative">
            {/* Tab root */}
            {currentView.type === "tabs" && (
              <>
                {activeTab === "notes" && (
                  <NotesTab
                    activeAccountId={activeAccountId}
                    onNoteClick={(note) => setCurrentView({ type: "note-detail", note })}
                    onStartRecording={() => setCurrentView({ type: "recording" })}
                  />
                )}
                {activeTab === "knowledge" && (
                  <KnowledgeTab
                    onKBClick={(kb) => setCurrentView({ 
                      type: "kb-detail", 
                      kb: { name: kb.name, color: kb.color, description: kb.description } 
                    })}
                  />
                )}
                {activeTab === "agent" && (
                  <AgentTab
                    onAgentChat={(agent) => setCurrentView({ 
                      type: "agent-chat", 
                      agent 
                    })}
                    onOpenContentFactory={() => {
                      setActiveTab("knowledge")
                      setCurrentView({
                        type: "kb-detail",
                        kb: {
                          name: "Product library",
                          color: "from-stone-500 to-zinc-700",
                          description: "Specs and PRDs",
                        },
                        initialView: "factory",
                      })
                    }}
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
                onBack={() => setCurrentView({ type: "tabs" })}
                onMovedToLibrary={(kb) => {
                  setActiveTab("knowledge")
                  setCurrentView({ type: "kb-detail", kb })
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
                  name: "Mind Agent",
                  description: currentView.context.contentTitle 
                    ? `Q&A grounded in “${currentView.context.contentTitle}”`
                    : `Q&A grounded in the “${currentView.context.kbName}” library`,
                  avatar: "🧠",
                  color: "from-stone-500 to-zinc-700",
                }}
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
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          )}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-500/80 rounded-full" />
      </div>
    </div>
  )
}
