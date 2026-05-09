"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { knowledgeBaseIconForTitle } from "@/components/mind-v2/knowledge-base-icon"
import { 
  ChevronLeft, Share2, MoreHorizontal, Play, Pause,
  ChevronRight, X,
  Check, Clock, Sparkles, FileText, 
  MessageSquare, Plus,
  Library, Link2, Copy, Flag, Mic, Search, RefreshCw, User, Trash2,
} from "lucide-react"

const knowledgeBases = [
  { id: 1, name: "Product library", category: "Personal", count: 156, recent: true, color: "from-teal-400 to-cyan-600", description: "Specs and PRDs" },
  { id: 2, name: "Tech docs", category: "Team", count: 89, recent: true, color: "from-teal-500 to-cyan-600", description: "Playbooks and internal docs" },
  { id: 3, name: "Meeting notes", category: "Personal", count: 234, recent: false, color: "from-stone-500 to-stone-700", description: "Calls and standups" },
  { id: 4, name: "User research", category: "Team", count: 67, recent: false, color: "from-zinc-500 to-zinc-600", description: "Interviews and insights" },
]

const recommendedKBs = [
  { id: 1, name: "Product library", category: "Personal", count: 156, match: 95, reason: "Matches product requirements discussion", description: "Specs and PRDs", color: "from-teal-400 to-cyan-600" },
  { id: 2, name: "Tech docs", category: "Team", count: 89, match: 72, reason: "Contains implementation notes", description: "Playbooks and internal docs", color: "from-teal-500 to-cyan-600" },
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
  const [showMoreSheet, setShowMoreSheet] = useState(false)
  const [selectedKB, setSelectedKB] = useState<number | null>(null)
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferComplete, setTransferComplete] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<{id: string, name: string, desc: string} | null>(null)
  const [showTemplatePage, setShowTemplatePage] = useState(false)
  const [templateTab, setTemplateTab] = useState<"mine" | "recommend" | "explore">("mine")

  const openMoveToLibrary = () => {
    setShowMoreSheet(false)
    setShowKBSheet(true)
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
      {/* 顶部导航 */}
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
            onClick={() => setShowTemplatePage(true)}
            className="p-2 hover:bg-gray-100 rounded-full shrink-0 text-teal-600"
            aria-label="Processing templates"
            title="Templates"
          >
            <Plus className="w-5 h-5" strokeWidth={1.75} />
          </button>
          <button type="button" className="p-2 hover:bg-gray-100 rounded-full shrink-0" aria-label="Share">
            <Share2 className="w-5 h-5 text-zinc-600" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => setShowMoreSheet(true)}
            className="p-2 hover:bg-gray-100 rounded-full shrink-0"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5 text-zinc-600" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* 音频播放器 */}
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
                  played ? "bg-teal-500/35" : "bg-stone-200"
                )}
                style={{
                  height: `${Math.min(1, h) * 100}%`,
                  minHeight: 3,
                }}
              />
            )
          })}
          <div
            className="absolute bottom-0 top-0 w-0.5 rounded-full bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.45)] pointer-events-none"
            style={{ left: `calc(${playheadPct * 100}% - 1px)` }}
            aria-hidden
          />
        </div>
        
        {/* 时间和控制 */}
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
            className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/35"
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

      {/* Summary · Transcript */}
      <div className="flex items-stretch border-b border-stone-100 px-5 gap-8">
        {(
          [
            { id: "summary" as const, label: "Summary" },
            { id: "transcript" as const, label: "Transcript" },
          ]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "py-3.5 text-[15px] font-medium tracking-tight border-b-[2.5px] transition-colors -mb-px",
              activeTab === tab.id
                ? "text-zinc-900 border-teal-500"
                : "text-zinc-400 border-transparent hover:text-zinc-600"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {/* 转录视图 */}
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

        {/* 总结视图 */}
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

      {/* 底部操作栏 */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask about this note…"
            className="w-full px-4 py-3 pr-12 rounded-xl border border-stone-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/25 focus:outline-none text-sm"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2">
            <MessageSquare className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* 全屏模版选择页面 */}
      {showTemplatePage && (
        <div className="absolute inset-0 z-50 bg-gray-50 flex flex-col animate-in slide-in-from-right duration-200">
          {/* 顶部导航 */}
          <div className="bg-white flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <button onClick={() => setShowTemplatePage(false)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Choose template</h1>
            <div className="w-10" />
          </div>

          {/* Tab切换 */}
          <div className="bg-white px-5 py-3 border-b border-gray-100">
            <div className="flex gap-6">
              {[
                { id: "mine", label: "Mine" },
                { id: "recommend", label: "For you" },
                { id: "explore", label: "Explore" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTemplateTab(tab.id as typeof templateTab)}
                  className={cn(
                    "text-[15px] font-medium pb-1 border-b-2 transition-colors",
                    templateTab === tab.id
                      ? "text-gray-900 border-gray-900"
                      : "text-gray-400 border-transparent"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto">
            {/* 我的空间 */}
            {templateTab === "mine" && (
              <div className="p-5">
                {/* 最近使用 */}
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Recent</h2>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="mb-8">
                  <button
                    onClick={() => {
                      setSelectedTemplate({ id: "smart-summary", name: "Smart summary", desc: "Adaptive summaries across contexts" })
                    }}
                    className={cn(
                      "relative w-full max-w-[200px] p-4 rounded-xl border bg-white text-left",
                      selectedTemplate?.id === "smart-summary" ? "border-teal-500" : "border-gray-200"
                    )}
                  >
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] rounded">Last used</span>
                    <svg className="w-6 h-6 text-teal-500 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
                    </svg>
                    <div className="font-semibold text-gray-900 mb-1">Smart summary</div>
                    <div className="text-xs text-gray-500 leading-relaxed">Adaptive summaries across contexts</div>
                    <div className="text-xs text-gray-400 mt-4">Plaud</div>
                  </button>
                </div>

                {/* 我的模板 */}
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">My templates</h2>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <button className="w-full max-w-[200px] aspect-[4/5] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors">
                  <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span className="text-sm text-gray-500">New template</span>
                </button>
              </div>
            )}

            {/* 推荐 */}
            {templateTab === "recommend" && (
              <div className="p-5">
                {/* 他人常用 */}
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
                        selectedTemplate?.id === t.id ? "border-teal-500" : "border-gray-200"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                        t.icon === "orange" ? "bg-teal-100" : "bg-cyan-100"
                      )}>
                        {t.icon === "orange" ? (
                          <svg className="w-5 h-5 text-teal-600" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-cyan-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

                {/* 灵感推荐 */}
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
                        selectedTemplate?.id === t.id ? "border-teal-500" : "border-gray-200"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                        t.icon === "purple" ? "bg-teal-100" : "bg-cyan-100"
                      )}>
                        {t.icon === "purple" ? (
                          <svg className="w-5 h-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="9" y1="9" x2="15" y2="9" />
                            <line x1="9" y1="13" x2="15" y2="13" />
                            <line x1="9" y1="17" x2="13" y2="17" />
                          </svg>
                        ) : (
                          <span className="text-teal-600 font-bold text-lg">99</span>
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

            {/* 探索 */}
            {templateTab === "explore" && (
              <div className="p-5">
                {/* 通用 */}
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
                        selectedTemplate?.id === t.id ? "border-teal-500" : "border-gray-200"
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                          {t.icon === "purple-star" ? (
                            <svg className="w-5 h-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

                {/* 会议 */}
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
                        selectedTemplate?.id === t.id ? "border-teal-500" : "border-gray-200"
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                          {t.icon === "orange-doc" ? (
                            <svg className="w-5 h-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <line x1="9" y1="9" x2="15" y2="9" />
                              <line x1="9" y1="13" x2="15" y2="13" />
                              <line x1="9" y1="17" x2="13" y2="17" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-cyan-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

          {/* 底部按钮 */}
          <div className="p-5 bg-white border-t border-gray-100">
            <button
              onClick={() => {
                if (selectedTemplate) {
                  setShowTemplatePage(false)
                }
              }}
              disabled={!selectedTemplate}
              className={cn(
                "w-full py-4 rounded-xl font-medium text-base transition-colors",
                selectedTemplate
                  ? "bg-teal-500 text-white hover:bg-teal-600"
                  : "bg-gray-200 text-gray-400"
              )}
            >
              Generate note
            </button>
          </div>
        </div>
      )}

      {/* 更多选项 — 分组样式参考设计稿（分享 / 复制 / 导出 + 编辑与删除） */}
      {showMoreSheet && (
        <div className="absolute inset-0 z-[45]">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/25 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={() => setShowMoreSheet(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[1.25rem] max-h-[88vh] flex flex-col shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-zinc-200" />
            </div>
            <div className="px-5 pb-1 flex items-center justify-between border-b border-zinc-100">
              <span className="text-base font-semibold text-zinc-900">Options</span>
              <button
                type="button"
                onClick={() => setShowMoreSheet(false)}
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
                    onClick={() => setShowMoreSheet(false)}
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
                    onClick={() => setShowMoreSheet(false)}
                  >
                    <FileText className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 text-[15px] text-zinc-900">Transcript</span>
                    <Copy className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-50/90 active:bg-zinc-100/80 transition-colors"
                    onClick={() => setShowMoreSheet(false)}
                  >
                    <Flag className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 text-[15px] text-zinc-900">Marks</span>
                    <Copy className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-50/90 active:bg-zinc-100/80 transition-colors"
                    onClick={() => setShowMoreSheet(false)}
                  >
                    <FileText className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 text-[15px] text-zinc-900">Note</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <h3 className="text-[13px] font-semibold text-zinc-900 mb-2">Export file</h3>
                <div className="rounded-xl border border-zinc-200/90 divide-y divide-zinc-100 overflow-hidden bg-white">
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-50/90 active:bg-zinc-100/80 transition-colors"
                    onClick={() => setShowMoreSheet(false)}
                  >
                    <Mic className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 text-[15px] text-zinc-900">Recording</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-50/90 active:bg-zinc-100/80 transition-colors"
                    onClick={() => setShowMoreSheet(false)}
                  >
                    <FileText className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 text-[15px] text-zinc-900">Transcript</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-50/90 active:bg-zinc-100/80 transition-colors"
                    onClick={() => setShowMoreSheet(false)}
                  >
                    <Flag className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 text-[15px] text-zinc-900">Marks</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              <div className="mb-2">
                <div className="rounded-xl border border-zinc-200/90 divide-y divide-zinc-100 overflow-hidden bg-white">
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-50/90 active:bg-zinc-100/80 transition-colors"
                    onClick={() => setShowMoreSheet(false)}
                  >
                    <Search className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 text-[15px] text-zinc-900">Find and replace</span>
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-50/90 active:bg-zinc-100/80 transition-colors"
                    onClick={() => setShowMoreSheet(false)}
                  >
                    <RefreshCw className="w-5 h-5 text-zinc-500 shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 text-[15px] text-zinc-900">Re-transcribe</span>
                  </button>
                  <div
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left opacity-40 pointer-events-none select-none"
                    aria-disabled
                  >
                    <User className="w-5 h-5 text-zinc-400 shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 text-[15px] text-zinc-500">Name speaker</span>
                  </div>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-teal-50 active:bg-teal-100/60 transition-colors"
                    onClick={() => setShowMoreSheet(false)}
                  >
                    <Trash2 className="w-5 h-5 text-teal-800 shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 text-[15px] font-medium text-teal-900">Move to trash</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 知识库选择 Bottom Sheet */}
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
              {/* 推荐移入 */}
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
                        ? "border-teal-500 bg-teal-50/60"
                        : "border-stone-200 bg-stone-50/80 hover:border-teal-200/80"
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
                      <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                  )
                })}
              </div>

              {/* 最近使用 */}
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
                        ? "border-teal-500 bg-teal-50/40"
                        : "border-gray-100 hover:border-teal-200/60"
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
                      <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
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
                        ? "border-teal-500 bg-teal-50/40"
                        : "border-gray-100 hover:border-teal-200/60"
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
                      <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
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
                    ? "bg-teal-500 text-white hover:bg-teal-600"
                    : transferComplete
                    ? "bg-teal-600 text-white"
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
