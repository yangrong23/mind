"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { knowledgeBaseIconForTitle } from "@/components/mind-v2/knowledge-base-icon"
import {
  ChevronLeft,
  Share2,
  MoreHorizontal,
  Play,
  Pause,
  ChevronRight,
  X,
  Check,
  Clock,
  Sparkles,
  FileText,
  MessageSquare,
  Plus,
  Library,
  Link2,
  Copy,
  Flag,
  Mic,
  RefreshCw,
  User,
  Trash2,
  FolderInput,
  FileSearch,
  Pencil,
  ImageIcon,
  Languages,
  Cpu,
} from "lucide-react"

const knowledgeBases = [
  { id: 1, name: "Product library", category: "Personal", count: 156, recent: true, color: "from-zinc-400 to-stone-600", description: "Specs and PRDs" },
  { id: 2, name: "Tech docs", category: "Team", count: 89, recent: true, color: "from-zinc-500 to-stone-600", description: "Playbooks and internal docs" },
  { id: 3, name: "Meeting notes", category: "Personal", count: 234, recent: false, color: "from-stone-500 to-stone-700", description: "Calls and standups" },
  { id: 4, name: "User research", category: "Team", count: 67, recent: false, color: "from-zinc-500 to-zinc-600", description: "Interviews and insights" },
]

const recommendedKBs = [
  { id: 1, name: "Product library", category: "Personal", count: 156, match: 95, reason: "Matches product requirements discussion", description: "Specs and PRDs", color: "from-zinc-400 to-stone-600" },
  { id: 2, name: "Tech docs", category: "Team", count: 89, match: 72, reason: "Contains implementation notes", description: "Playbooks and internal docs", color: "from-zinc-500 to-stone-600" },
]

export type MovedLibraryMeta = { name: string; color: string; description?: string }

interface NoteDetailProps {
  onBack: () => void
  /** After a successful move, opens the destination library for a continuous Notes → Library flow */
  onMovedToLibrary?: (kb: MovedLibraryMeta) => void
}

const TRANSCRIPT_BLOCKS = [
  { t: "00:00:00", text: "Alright—kicking off today’s product requirements session. First, the headline topic: knowledge graph visualization." },
  { t: "00:00:35", text: "The graph helps people understand and manage knowledge assets. Visualization makes relationships between ideas obvious." },
  { t: "00:01:15", text: "We’ll support four node types: people, orgs, projects, and themes—each with distinct colors for quick scanning." },
  { t: "00:02:00", text: "We also need automatic link discovery: the system should infer connections from content without manual wiring." },
  { t: "00:05:30", text: "On UX, interactions must feel fluid—zoom, pan, and inspect nodes without friction." },
  { t: "00:10:15", text: "For implementation we’re weighing D3.js versus React Flow; next step is a performance and maintainability review." },
] as const

export function NoteDetail({ onBack, onMovedToLibrary }: NoteDetailProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "transcript">("summary")
  const [isPlaying, setIsPlaying] = useState(false)
  const [playheadPct, setPlayheadPct] = useState(0.32)
  const [showKBSheet, setShowKBSheet] = useState(false)
  /** Share icon: export / copy / share link */
  const [showShareOptions, setShowShareOptions] = useState(false)
  /** More menu: note utilities */
  const [showToolsMenu, setShowToolsMenu] = useState(false)
  const [showCreateTemplateSheet, setShowCreateTemplateSheet] = useState(false)
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false)
  const [templateDraftName, setTemplateDraftName] = useState("")
  const [templateDraftPrompt, setTemplateDraftPrompt] = useState("")
  const [customTemplates, setCustomTemplates] = useState<{ id: string; name: string; desc: string; prompt: string }[]>(
    []
  )
  const [templateLanguage, setTemplateLanguage] = useState("Auto")
  const [templateModel, setTemplateModel] = useState("Auto")
  const [selectedKB, setSelectedKB] = useState<number | null>(null)
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferComplete, setTransferComplete] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<{id: string, name: string, desc: string} | null>(null)
  const [showTemplatePage, setShowTemplatePage] = useState(false)
  const [templateTab, setTemplateTab] = useState<"mine" | "recommend" | "explore">("mine")

  const openMoveToLibrary = () => {
    setShowToolsMenu(false)
    setShowShareOptions(false)
    setShowKBSheet(true)
  }

  const closeAllOverlays = () => {
    setShowShareOptions(false)
    setShowToolsMenu(false)
    setShowCreateTemplateSheet(false)
    setShowTemplateConfirm(false)
  }

  const handleTransfer = () => {
    if (!selectedKB) return
    const kbMeta =
      knowledgeBases.find((k) => k.id === selectedKB) ??
      recommendedKBs.find((k) => k.id === selectedKB)
    if (!kbMeta) return
    setIsTransferring(true)
    setTimeout(() => {
      setIsTransferring(false)
      setTransferComplete(true)
      setTimeout(() => {
        onMovedToLibrary?.({
          name: kbMeta.name,
          color: kbMeta.color,
          description: "description" in kbMeta ? kbMeta.description : undefined,
        })
        setShowKBSheet(false)
        setTransferComplete(false)
        setSelectedKB(null)
      }, 900)
    }, 1200)
  }

  useEffect(() => {
    if (!isPlaying) return
    const id = window.setInterval(() => {
      setPlayheadPct((p) => {
        const n = p + 0.0045
        if (n >= 1) {
          queueMicrotask(() => setIsPlaying(false))
          return 1
        }
        return n
      })
    }, 100)
    return () => window.clearInterval(id)
  }, [isPlaying])

  const activeTranscriptIdx = Math.min(
    TRANSCRIPT_BLOCKS.length - 1,
    Math.max(0, Math.floor(playheadPct * TRANSCRIPT_BLOCKS.length))
  )

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
        <button type="button" onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full shrink-0">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex items-center justify-end gap-1 sm:gap-1.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={openMoveToLibrary}
            className={cn(
              "flex items-center gap-1.5 rounded-full pl-2.5 pr-3 py-1.5 text-xs font-semibold tracking-tight active:scale-[0.98] transition-transform shrink-0",
              mx.brandCta
            )}
            aria-label="Move to library"
          >
            <Library className="w-4 h-4 opacity-90" strokeWidth={2} />
            <span className="sm:hidden">Library</span>
            <span className="hidden sm:inline">Move to library</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setShowToolsMenu(false)
              setShowShareOptions(true)
            }}
            className="p-2 hover:bg-gray-100 rounded-full shrink-0"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5 text-zinc-600" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowShareOptions(false)
              setShowToolsMenu((v) => !v)
            }}
            className="p-2 hover:bg-gray-100 rounded-full shrink-0"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5 text-zinc-600" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Audio player */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-b from-stone-50/80 to-white">
        {/* Minimal waveform + brand playhead */}
        <div className="relative h-12 mb-3 flex items-end justify-center gap-[2px] px-1">
          {Array.from({ length: 72 }).map((_, i) => {
            const h = 0.28 + Math.sin(i * 0.35) * 0.22 + ((i * 17) % 9) * 0.02
            const barPos = i / 71
            const played = barPos <= playheadPct
            return (
              <div
                key={i}
                className={cn(
                  "w-[2px] rounded-full transition-colors duration-150",
                  played ? "bg-zinc-500/35" : "bg-stone-200"
                )}
                style={{
                  height: `${Math.min(1, h) * 100}%`,
                  minHeight: 3,
                }}
              />
            )
          })}
          <div
            className="absolute bottom-0 top-0 w-0.5 rounded-full bg-zinc-500 shadow-[0_0_12px_rgba(63,63,70,0.4)] pointer-events-none"
            style={{ left: `calc(${playheadPct * 100}% - 1px)` }}
            aria-hidden
          />
        </div>
        
        {/* Time & controls */}
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-zinc-700 font-medium">07:23</span>
          <span className="text-gray-400">23:45</span>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <button className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <span className="text-xs font-semibold">-15</span>
          </button>
          <button 
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 bg-zinc-500 rounded-full flex items-center justify-center hover:bg-zinc-600 transition-colors shadow-lg shadow-zinc-500/35"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-white" fill="white" />
            ) : (
              <Play className="w-7 h-7 text-white ml-1" fill="white" />
            )}
          </button>
          <button className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <span className="text-xs font-semibold">+15</span>
          </button>
          <button className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <span className="text-xs font-semibold">1x</span>
          </button>
        </div>
      </div>

      {/* Summary / Transcript + template (+) */}
      <div className="flex items-stretch justify-between gap-3 border-b border-stone-100 px-5">
        <div className="flex gap-8">
          {(
            [
              { id: "summary" as const, label: "Summary" },
              { id: "transcript" as const, label: "Transcript" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "py-3.5 text-[15px] font-medium tracking-tight border-b-[2.5px] transition-colors -mb-px",
                activeTab === tab.id
                  ? "text-zinc-900 border-zinc-500"
                  : "text-zinc-400 border-transparent hover:text-zinc-600"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center pb-px">
          <button
            type="button"
            onClick={() => {
              closeAllOverlays()
              setShowTemplatePage(true)
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 hover:bg-stone-100"
            aria-label="Choose template"
            title="Templates"
          >
            <Plus className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* More (…) dropdown */}
      {showToolsMenu && (
        <div className="absolute inset-0 z-[46]">
          <button
            type="button"
            className="absolute inset-0 min-h-[120px] bg-transparent"
            aria-label="Close menu"
            onClick={() => setShowToolsMenu(false)}
          />
          <div
            role="menu"
            className="absolute right-3 top-[50px] z-[47] w-[min(280px,calc(100%-24px))] overflow-hidden rounded-xl border border-stone-200/95 bg-white py-1 shadow-xl shadow-stone-900/12"
          >
            <button
              type="button"
              role="menuitem"
              onClick={openMoveToLibrary}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] text-zinc-900 hover:bg-stone-50"
            >
              <FolderInput className="h-5 w-5 shrink-0 text-zinc-500" strokeWidth={1.5} />
              Move to folder
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => setShowToolsMenu(false)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] text-zinc-900 hover:bg-stone-50"
            >
              <FileSearch className="h-5 w-5 shrink-0 text-zinc-500" strokeWidth={1.5} />
              Find and replace
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => setShowToolsMenu(false)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] text-zinc-900 hover:bg-stone-50"
            >
              <RefreshCw className="h-5 w-5 shrink-0 text-zinc-500" strokeWidth={1.5} />
              Re-transcribe
            </button>
            <div
              className="flex w-full cursor-not-allowed items-center gap-3 px-4 py-3 text-left text-[15px] text-zinc-400"
              aria-disabled
            >
              <User className="h-5 w-5 shrink-0 text-zinc-300" strokeWidth={1.5} />
              Name speakers
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={() => setShowToolsMenu(false)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] font-medium text-red-600 hover:bg-red-50/80"
            >
              <Trash2 className="h-5 w-5 shrink-0 text-red-500" strokeWidth={1.5} />
              Move to trash
            </button>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        {/* Transcript */}
        {activeTab === "transcript" && (
          <div className="h-full overflow-y-auto">
            <div className="px-5 py-5 max-w-prose mx-auto">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400 mb-6">
                Transcript
              </p>
              <div className="space-y-6">
                {TRANSCRIPT_BLOCKS.map((block, i) => (
                  <div key={i} className="space-y-1.5">
                    <span className="text-[12px] tabular-nums text-zinc-400">{block.t}</span>
                    <p
                      className={cn(
                        "text-[17px] leading-[1.65] tracking-[-0.01em] transition-colors duration-200",
                        i === activeTranscriptIdx ? "text-zinc-900 font-normal" : "text-zinc-400"
                      )}
                    >
                      {block.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        {activeTab === "summary" && (
          <div className="p-5 pb-8 space-y-10 overflow-y-auto max-w-prose mx-auto">
            <p className="text-center text-[12px] text-zinc-400 leading-relaxed">
              AI-generated · for reference only
            </p>

            <header className="space-y-3">
              <h1 className="text-[26px] font-semibold tracking-tight text-zinc-900 leading-tight">
                Product requirements discussion
              </h1>
              <p className="text-[15px] text-zinc-500">
                Jan 15, 2024 · 2:32 PM · 23 min
              </p>
              <div className="flex flex-wrap gap-2">
                {["Meeting", "Product", "Knowledge"].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-stone-100 text-[12px] font-medium text-zinc-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </header>

            <section className="space-y-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                Overview
              </h2>
              <p className="text-[17px] leading-[1.7] text-zinc-800">
                The team reviewed knowledge-graph visualization—how it helps organize information, surface relationships, and compound learning. The graph should speed up processing and support decisions while helping users build a personal knowledge system.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                Key points
              </h2>
              <ul className="space-y-4">
                {[
                  "Support rich node taxonomy (people, orgs, projects, themes)",
                  "Ship automatic link discovery and smart recommendations",
                  "Enable library-grounded AI assistance",
                ].map((line) => (
                  <li key={line} className="flex gap-3 text-[17px] leading-[1.65] text-zinc-800">
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-zinc-400" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                Action items
              </h2>
              <div className="space-y-3">
                {[
                  { t: "Prototype the knowledge graph UI", who: "@design" },
                  { t: "Research competitor graph implementations", who: "@product" },
                ].map((row) => (
                  <div
                    key={row.t}
                    className="flex items-start gap-3 rounded-xl border border-stone-200/80 bg-stone-50/50 px-4 py-3.5"
                  >
                    <div className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-zinc-300" aria-hidden />
                    <p className="flex-1 text-[16px] leading-snug text-zinc-800">{row.t}</p>
                    <span className="text-[12px] text-zinc-400 shrink-0">{row.who}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        <div className="relative">
          <span className="absolute left-3 top-0 z-10 -translate-y-1/2 rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-sky-800">
            Beta
          </span>
          <input
            type="text"
            placeholder="Ask about this note…"
            className="w-full rounded-xl border border-sky-200/90 bg-white px-4 py-3 pr-12 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2">
            <MessageSquare className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Template picker (fullscreen) */}
      {showTemplatePage && (
        <div className="absolute inset-0 z-50 flex flex-col bg-[#f7f7f8] animate-in slide-in-from-right duration-200">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
            <button
              type="button"
              onClick={() => {
                setShowCreateTemplateSheet(false)
                setShowTemplateConfirm(false)
                setShowTemplatePage(false)
              }}
              className="-ml-2 rounded-full p-2 hover:bg-gray-100"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Choose template</h1>
            <div className="w-10" />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-100 bg-white px-5 py-3">
            <div className="flex gap-6">
              {[
                { id: "mine" as const, label: "Mine" },
                { id: "recommend" as const, label: "For you" },
                { id: "explore" as const, label: "Explore" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTemplateTab(tab.id)}
                  className={cn(
                    "border-b-2 pb-1 text-[15px] font-medium transition-colors",
                    templateTab === tab.id
                      ? "border-zinc-800 text-zinc-900"
                      : "border-transparent text-gray-400"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {/* Mine */}
            {templateTab === "mine" && (
              <div className="p-5 pb-28">
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">Recently used</h2>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                <div className="mb-8">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTemplate({
                        id: "smart-summary",
                        name: "Smart summary",
                        desc: "Adaptive summaries across contexts",
                      })
                    }
                    className={cn(
                      "relative w-full max-w-[220px] rounded-xl border bg-white p-4 text-left shadow-sm",
                      selectedTemplate?.id === "smart-summary" ? "border-zinc-600 ring-1 ring-zinc-200" : "border-gray-200"
                    )}
                  >
                    <span className="absolute right-2 top-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      Last used
                    </span>
                    <div className="mb-2 flex items-start justify-between gap-2 pr-16">
                      <span className="text-violet-500" aria-hidden>
                        ✦✦
                      </span>
                      <span className="text-gray-400" aria-hidden>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                        </svg>
                      </span>
                    </div>
                    <div className="mb-1 font-semibold text-gray-900">Smart summary</div>
                    <div className="text-xs leading-relaxed text-gray-500">Adaptive summaries across contexts</div>
                    <div className="mt-4 text-xs text-gray-400">Plaud</div>
                  </button>
                </div>

                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">My templates</h2>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                <div className="mb-6 flex flex-wrap gap-3">
                  {customTemplates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setSelectedTemplate({ id: t.id, name: t.name, desc: t.desc })
                      }
                      className={cn(
                        "w-full max-w-[200px] rounded-xl border bg-white p-4 text-left shadow-sm",
                        selectedTemplate?.id === t.id ? "border-zinc-600 ring-1 ring-zinc-200" : "border-gray-200"
                      )}
                    >
                      <div className="mb-2 flex items-center gap-2 text-violet-500">
                        <Pencil className="h-4 w-4" />
                      </div>
                      <div className="mb-1 font-semibold text-gray-900">{t.name}</div>
                      <div className="line-clamp-2 text-xs text-gray-500">{t.desc}</div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCreateTemplateSheet(true)}
                    className="flex aspect-[4/5] w-full max-w-[200px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white transition-colors hover:border-gray-400"
                  >
                    <Pencil className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
                    <span className="text-sm text-gray-500">New template</span>
                  </button>
                </div>

                <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <button
                    type="button"
                    onClick={() =>
                      setTemplateLanguage((v) => (v === "Auto" ? "English" : v === "English" ? "Spanish" : "Auto"))
                    }
                    className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3.5 text-left"
                  >
                    <span className="flex items-center gap-2 text-[15px] text-gray-900">
                      <Languages className="h-5 w-5 text-gray-400" />
                      Language
                    </span>
                    <span className="flex items-center gap-1 text-[15px] text-gray-500">
                      {templateLanguage}
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateModel((v) => (v === "Auto" ? "GPT-4o" : v === "GPT-4o" ? "Claude" : "Auto"))}
                    className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                  >
                    <span className="flex items-center gap-2 text-[15px] text-gray-900">
                      <Cpu className="h-5 w-5 text-gray-400" />
                      AI model
                    </span>
                    <span className="flex items-center gap-1 text-[15px] text-gray-500">
                      {templateModel}
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Recommend */}
            {templateTab === "recommend" && (
              <div className="p-5">
                {/* Popular */}
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Popular</h2>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { id: "meeting-expert", name: "Meeting recap pro", desc: "Structured minutes with decisions and todos", icon: "orange", author: "massif", count: 0 },
                    { id: "verbatim", name: "Verbatim", desc: "Full verbatim transcript", icon: "green", author: "Chao Ma", count: 0 },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate({ id: t.id, name: t.name, desc: t.desc })}
                      className={cn(
                        "p-4 rounded-xl border bg-white text-left",
                        selectedTemplate?.id === t.id ? "border-zinc-500" : "border-gray-200"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                        t.icon === "orange" ? "bg-zinc-100" : "bg-stone-100"
                      )}>
                        {t.icon === "orange" ? (
                          <svg className="w-5 h-5 text-zinc-600" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-stone-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        )}
                      </div>
                      <div className="font-semibold text-gray-900 text-sm mb-1">{t.name}</div>
                      <div className="text-xs text-gray-500 leading-relaxed mb-4">{t.desc}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        {t.count} · {t.author}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Inspiration */}
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Inspiration</h2>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "meeting-points", name: "Meeting highlights", desc: "Key takeaways for review and decisions", icon: "purple", author: "Plaud" },
                    { id: "meeting-minutes", name: "Meeting minutes", desc: "Full notes with actions and decisions", icon: "blue", author: "Plaud" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate({ id: t.id, name: t.name, desc: t.desc })}
                      className={cn(
                        "p-4 rounded-xl border bg-white text-left",
                        selectedTemplate?.id === t.id ? "border-zinc-500" : "border-gray-200"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                        t.icon === "purple" ? "bg-zinc-100" : "bg-stone-100"
                      )}>
                        {t.icon === "purple" ? (
                          <svg className="w-5 h-5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="9" y1="9" x2="15" y2="9" />
                            <line x1="9" y1="13" x2="15" y2="13" />
                            <line x1="9" y1="17" x2="13" y2="17" />
                          </svg>
                        ) : (
                          <span className="text-zinc-600 font-bold text-lg">99</span>
                        )}
                      </div>
                      <div className="font-semibold text-gray-900 text-sm mb-1">{t.name}</div>
                      <div className="text-xs text-gray-500 leading-relaxed mb-4">{t.desc}</div>
                      <div className="text-xs text-gray-400">{t.author}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Explore */}
            {templateTab === "explore" && (
              <div className="p-5">
                {/* General */}
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">General</h2>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { id: "smart-summary-2", name: "Smart summary", desc: "Adaptive summaries across contexts", icon: "purple-star", author: "Plaud" },
                    { id: "reasoning", name: "Reasoning recap", desc: "Structured recap of the essentials", icon: "purple-connect", author: "Plaud" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate({ id: t.id, name: t.name, desc: t.desc })}
                      className={cn(
                        "p-4 rounded-xl border bg-white text-left",
                        selectedTemplate?.id === t.id ? "border-zinc-500" : "border-gray-200"
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                          {t.icon === "purple-star" ? (
                            <svg className="w-5 h-5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="6" cy="6" r="3" />
                              <circle cx="18" cy="6" r="3" />
                              <circle cx="6" cy="18" r="3" />
                              <circle cx="18" cy="18" r="3" />
                              <line x1="9" y1="6" x2="15" y2="6" />
                              <line x1="6" y1="9" x2="6" y2="15" />
                              <line x1="18" y1="9" x2="18" y2="15" />
                              <line x1="9" y1="18" x2="15" y2="18" />
                            </svg>
                          )}
                        </div>
                        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                      </div>
                      <div className="font-semibold text-gray-900 text-sm mb-1">{t.name}</div>
                      <div className="text-xs text-gray-500 leading-relaxed mb-4">{t.desc}</div>
                      <div className="text-xs text-gray-400">{t.author}</div>
                    </button>
                  ))}
                </div>

                {/* Meetings */}
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Meetings</h2>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "consultation", name: "Consultation Q&A", desc: "Capture Q&A and actions from consult calls", icon: "orange-doc", author: "Plaud" },
                    { id: "discussion", name: "Discussion digest", desc: "Discussion summary with clear next steps", icon: "orange-people", author: "Plaud" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate({ id: t.id, name: t.name, desc: t.desc })}
                      className={cn(
                        "p-4 rounded-xl border bg-white text-left",
                        selectedTemplate?.id === t.id ? "border-zinc-500" : "border-gray-200"
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                          {t.icon === "orange-doc" ? (
                            <svg className="w-5 h-5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <line x1="9" y1="9" x2="15" y2="9" />
                              <line x1="9" y1="13" x2="15" y2="13" />
                              <line x1="9" y1="17" x2="13" y2="17" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-stone-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                          )}
                        </div>
                        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                      </div>
                      <div className="font-semibold text-gray-900 text-sm mb-1">{t.name}</div>
                      <div className="text-xs text-gray-500 leading-relaxed mb-4">{t.desc}</div>
                      <div className="text-xs text-gray-400">{t.author}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 bg-white p-5">
            {templateTab === "mine" && (
              <p className="mb-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-gray-500">
                <Languages className="h-3.5 w-3.5 shrink-0 opacity-70" />
                Translated. View original
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                if (selectedTemplate) {
                  setShowCreateTemplateSheet(false)
                  setShowTemplateConfirm(false)
                  setShowTemplatePage(false)
                }
              }}
              disabled={!selectedTemplate}
              className={cn(
                "w-full rounded-xl py-4 text-base font-medium transition-colors",
                selectedTemplate
                  ? "bg-zinc-900 text-white hover:bg-zinc-800"
                  : "bg-gray-200 text-gray-400"
              )}
            >
              Generate note
            </button>
          </div>

          {/* Create template sheet */}
          {showCreateTemplateSheet && (
            <div className="absolute inset-0 z-[60] flex flex-col justify-end">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                aria-label="Close"
                onClick={() => setShowCreateTemplateSheet(false)}
              />
              <div className="relative max-h-[55%] rounded-t-[1.25rem] bg-white px-4 pb-6 pt-3 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom duration-300">
                <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-base font-semibold text-zinc-900">Create template</span>
                  <button
                    type="button"
                    onClick={() => setShowCreateTemplateSheet(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateTemplateSheet(false)
                    setTemplateDraftName("Photo template")
                    setTemplateDraftPrompt(
                      "After you upload a photo of a paper document, AI extracts structure and key points into a reusable prompt (demo)."
                    )
                    setShowTemplateConfirm(true)
                  }}
                  className="flex w-full items-center gap-3 border-b border-gray-100 py-4 text-left"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 text-white shadow-sm">
                    <ImageIcon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-[16px] font-semibold text-transparent">
                      Photo to template
                    </div>
                    <p className="mt-0.5 text-[13px] leading-snug text-gray-500">
                      Take or upload a photo; AI builds a template for you
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateTemplateSheet(false)
                    setTemplateDraftName("")
                    setTemplateDraftPrompt("")
                    setShowTemplateConfirm(true)
                  }}
                  className="flex w-full items-center gap-3 py-4 text-left"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white">
                    <Pencil className="h-5 w-5 text-zinc-700" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[16px] font-semibold text-zinc-900">Write template prompt</div>
                    <p className="mt-0.5 text-[13px] leading-snug text-gray-500">Define your own template in your words</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
                </button>
              </div>
            </div>
          )}

          {/* Confirm template */}
          {showTemplateConfirm && (
            <div className="absolute inset-0 z-[61] flex items-end justify-center bg-black/45 sm:items-center">
              <button
                type="button"
                className="absolute inset-0"
                aria-label="Close"
                onClick={() => setShowTemplateConfirm(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="tpl-confirm-title"
                className="relative z-[62] m-4 w-full max-w-[360px] rounded-2xl bg-white p-5 shadow-xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 id="tpl-confirm-title" className="text-lg font-semibold text-zinc-900">
                    Confirm template
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowTemplateConfirm(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <label className="mb-1.5 block text-[15px] font-semibold text-zinc-900">Template name</label>
                <input
                  value={templateDraftName}
                  onChange={(e) => setTemplateDraftName(e.target.value)}
                  placeholder="Enter a template name"
                  className="mb-4 w-full rounded-xl border border-gray-200 px-3 py-3 text-[15px] text-zinc-900 placeholder:text-gray-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-100"
                />
                <label className="mb-1.5 block text-[15px] font-semibold text-zinc-900">Prompt</label>
                <div className="relative mb-5">
                  <textarea
                    value={templateDraftPrompt}
                    onChange={(e) => setTemplateDraftPrompt(e.target.value)}
                    placeholder="How should recordings be summarized?"
                    rows={5}
                    className="w-full resize-y rounded-xl border border-gray-200 px-3 py-3 pr-8 text-[15px] text-zinc-900 placeholder:text-gray-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-100"
                  />
                  <span
                    className="pointer-events-none absolute bottom-2 right-2 text-gray-300"
                    aria-hidden
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const name = templateDraftName.trim()
                    if (!name) return
                    const prompt = templateDraftPrompt.trim() || "(No description)"
                    const id = `custom-${Date.now()}`
                    const descShort = prompt.length > 72 ? `${prompt.slice(0, 72)}…` : prompt
                    setCustomTemplates((prev) => [...prev, { id, name, desc: descShort, prompt }])
                    setShowTemplateConfirm(false)
                    setTemplateDraftName("")
                    setTemplateDraftPrompt("")
                    setSelectedTemplate({ id, name, desc: descShort })
                  }}
                  className="w-full rounded-xl bg-zinc-900 py-3.5 text-[15px] font-semibold text-white hover:bg-zinc-800"
                >
                  Save to my templates
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share & export sheet */}
      {showShareOptions && (
        <div className="absolute inset-0 z-[45]">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/25 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={() => setShowShareOptions(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[1.25rem] max-h-[88vh] flex flex-col shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-zinc-200" />
            </div>
            <div className="px-5 pb-1 flex items-center justify-between border-b border-zinc-100">
              <span className="text-base font-semibold text-zinc-900">Share & export</span>
              <button
                type="button"
                onClick={() => setShowShareOptions(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-500"
                aria-label="Close"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 pb-8">
              <div className="mb-5">
                <h3 className="text-[13px] font-semibold text-zinc-900 mb-2">Share</h3>
                <div className="rounded-xl border border-zinc-200/90 divide-y divide-zinc-100 overflow-hidden bg-white">
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-50/90 active:bg-zinc-100/80 transition-colors"
                    onClick={() => setShowShareOptions(false)}
                  >
                    <Link2 className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 text-[15px] text-zinc-900">Share link</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <h3 className="text-[13px] font-semibold text-zinc-900 mb-2">Copy to clipboard</h3>
                <div className="rounded-xl border border-zinc-200/90 divide-y divide-zinc-100 overflow-hidden bg-white">
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-50/90 active:bg-zinc-100/80 transition-colors"
                    onClick={() => setShowShareOptions(false)}
                  >
                    <FileText className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 text-[15px] text-zinc-900">Transcript</span>
                    <Copy className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-50/90 active:bg-zinc-100/80 transition-colors"
                    onClick={() => setShowShareOptions(false)}
                  >
                    <Flag className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 text-[15px] text-zinc-900">Marks</span>
                    <Copy className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-50/90 active:bg-zinc-100/80 transition-colors"
                    onClick={() => setShowShareOptions(false)}
                  >
                    <FileText className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 text-[15px] text-zinc-900">Note</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              <div className="mb-2">
                <h3 className="text-[13px] font-semibold text-zinc-900 mb-2">Export file</h3>
                <div className="rounded-xl border border-zinc-200/90 divide-y divide-zinc-100 overflow-hidden bg-white">
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-50/90 active:bg-zinc-100/80 transition-colors"
                    onClick={() => setShowShareOptions(false)}
                  >
                    <Mic className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 text-[15px] text-zinc-900">Recording</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-50/90 active:bg-zinc-100/80 transition-colors"
                    onClick={() => setShowShareOptions(false)}
                  >
                    <FileText className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 text-[15px] text-zinc-900">Transcript</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-50/90 active:bg-zinc-100/80 transition-colors"
                    onClick={() => setShowShareOptions(false)}
                  >
                    <Flag className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 text-[15px] text-zinc-900">Marks</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Library picker */}
      {showKBSheet && (
        <div className="absolute inset-0 z-50">
          <div 
            className="absolute inset-0 bg-zinc-900/25 backdrop-blur-sm"
            onClick={() => !isTransferring && setShowKBSheet(false)}
          />
          
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[70%] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            
            <div className="px-5 pb-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Choose library</h3>
              <button 
                onClick={() => !isTransferring && setShowKBSheet(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Suggested */}
              <div className="flex items-center gap-2 text-sm mb-3">
                <Sparkles className="w-4 h-4 text-zinc-500" />
                <span className="text-gray-900 font-medium">Suggested</span>
                <span className="text-xs text-gray-400">Matched from content</span>
              </div>
              <div className="space-y-2 mb-6">
                {recommendedKBs.map((kb) => {
                  const KbIcon = knowledgeBaseIconForTitle(kb.name, kb.reason)
                  return (
                  <button
                    key={`rec-${kb.id}`}
                    onClick={() => setSelectedKB(kb.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                      selectedKB === kb.id
                        ? "border-zinc-500 bg-zinc-50/60"
                        : "border-stone-200 bg-stone-50/80 hover:border-zinc-200/80"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
                      kb.color
                    )}>
                      <KbIcon className="w-5 h-5 text-white" strokeWidth={2} aria-hidden />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{kb.name}</span>
                        <span className="px-1.5 py-0.5 bg-stone-200/90 text-zinc-700 text-[10px] rounded font-medium">{kb.match}% match</span>
                      </div>
                      <div className="text-xs text-gray-500">{kb.reason}</div>
                    </div>
                    {selectedKB === kb.id && (
                      <div className="w-6 h-6 rounded-full bg-zinc-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                  )
                })}
              </div>

              {/* Recent */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <Clock className="w-4 h-4" />
                <span>Recent</span>
              </div>
              <div className="space-y-2 mb-6">
                {knowledgeBases.filter(kb => kb.recent).map((kb) => {
                  const KbIcon = knowledgeBaseIconForTitle(kb.name, kb.category)
                  return (
                  <button
                    key={kb.id}
                    onClick={() => setSelectedKB(kb.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                      selectedKB === kb.id
                        ? "border-zinc-500 bg-zinc-50/40"
                        : "border-gray-100 hover:border-zinc-200/60"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
                      kb.color
                    )}>
                      <KbIcon className="w-5 h-5 text-white" strokeWidth={2} aria-hidden />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{kb.name}</div>
                      <div className="text-xs text-gray-500">{kb.category} · {kb.count} items</div>
                    </div>
                    {selectedKB === kb.id && (
                      <div className="w-6 h-6 rounded-full bg-zinc-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                  )
                })}
              </div>

              <div className="text-sm text-gray-500 mb-3">All libraries</div>
              <div className="space-y-2">
                {knowledgeBases.filter(kb => !kb.recent).map((kb) => {
                  const KbIcon = knowledgeBaseIconForTitle(kb.name, kb.category)
                  return (
                  <button
                    key={kb.id}
                    onClick={() => setSelectedKB(kb.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                      selectedKB === kb.id
                        ? "border-zinc-500 bg-zinc-50/40"
                        : "border-gray-100 hover:border-zinc-200/60"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
                      kb.color
                    )}>
                      <KbIcon className="w-5 h-5 text-white" strokeWidth={2} aria-hidden />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{kb.name}</div>
                      <div className="text-xs text-gray-500">{kb.category} · {kb.count} items</div>
                    </div>
                    {selectedKB === kb.id && (
                      <div className="w-6 h-6 rounded-full bg-zinc-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                  )
                })}
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowKBSheet(false)}
                disabled={isTransferring}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={!selectedKB || isTransferring}
                className={cn(
                  "flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2",
                  selectedKB && !transferComplete
                    ? "bg-zinc-500 text-white hover:bg-zinc-600"
                    : transferComplete
                    ? "bg-zinc-600 text-white"
                    : "bg-gray-200 text-gray-400"
                )}
              >
                {isTransferring ? (
                  <span className="flex items-center gap-2">
                    <span className="flex gap-1" aria-hidden>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse [animation-delay:300ms]" />
                    </span>
                    Moving to library…
                  </span>
                ) : transferComplete ? (
                  <>
                    <Check className="w-5 h-5" />
                    Done
                  </>
                ) : (
                  "Confirm move"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
