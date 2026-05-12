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
  ChevronDown,
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
  Pencil,
  ImageIcon,
  Languages,
  Cpu,
  ThumbsUp,
  ThumbsDown,
  Maximize2,
} from "lucide-react"
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"
import { CreateFolderSheet } from "./create-folder-sheet"
import { SocialShareRow } from "./social-share-row"
import type { Note } from "./notes-tab"
import { toast } from "sonner"
import type { NoteFolder } from "@/lib/note-folders"

const knowledgeBases = [
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
  note?: Note | null
  onBack: () => void
  /** After a successful move, opens the destination library for a continuous Notes → Library flow */
  onMovedToLibrary?: (kb: MovedLibraryMeta) => void
  /** Create a new folder and assign the current note to it (folder color/name on Notes home) */
  onAssignNoteToNewFolder?: (noteId: number, folder: NoteFolder) => void
  /** Move current note to trash and leave detail */
  onTrashNote?: (noteId: number) => void
}

const TRANSCRIPT_BLOCKS = [
  { t: "00:00:00", text: "Alright—kicking off today’s product requirements session. First, the headline topic: knowledge graph visualization." },
  { t: "00:00:35", text: "The graph helps people understand and manage knowledge assets. Visualization makes relationships between ideas obvious." },
  { t: "00:01:15", text: "We’ll support four node types: people, orgs, projects, and themes—each with distinct colors for quick scanning." },
  { t: "00:02:00", text: "We also need automatic link discovery: the system should infer connections from content without manual wiring." },
  { t: "00:05:30", text: "On UX, interactions must feel fluid—zoom, pan, and inspect nodes without friction." },
  { t: "00:10:15", text: "For implementation we’re weighing D3.js versus React Flow; next step is a performance and maintainability review." },
] as const

/** AI timestamp marks — demo content aligned with transcript times */
const RECORDING_MARKS = [
  {
    t: "00:00:35",
    title: "Multimodal capture: voice, screen, and images",
    body: "Discussed marking moments in one recording with both audio and visuals, then jumping back on the timeline.",
  },
  {
    t: "00:02:15",
    title: "Knowledge graph and visual decisions",
    body: "Confirmed people–project–theme as core nodes, color by type, and room for automatic edge discovery later.",
  },
] as const

const MIND_INSIGHT_CARDS = [
  {
    title: "Can Mind sync with your calendar or task apps?",
    desc: "Based on this note, block time for a short review and sync next steps to your usual task list.",
  },
  {
    title: "Follow-ups worth asking in the next recording",
    desc: "Capture one competitor mind-map example and a one-line tradeoff (performance vs maintainability) for review.",
  },
] as const

export function NoteDetail({ note, onBack, onMovedToLibrary, onAssignNoteToNewFolder, onTrashNote }: NoteDetailProps) {
  /** Source = transcript / raw; Note = summary and marks */
  const [segment, setSegment] = useState<"source" | "note">("note")
  const [noteSub, setNoteSub] = useState<"marks" | "summary">("summary")
  const [summaryFeedback, setSummaryFeedback] = useState<"up" | "down" | null>(null)
  const [markExpand, setMarkExpand] = useState<Record<number, boolean>>({})
  const [isPlaying, setIsPlaying] = useState(false)
  const [playheadPct, setPlayheadPct] = useState(0.32)
  const [showKBSheet, setShowKBSheet] = useState(false)
  const [showCreateFolderSheet, setShowCreateFolderSheet] = useState(false)
  /** Share icon: export / copy / share link */
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [showShareLinkModal, setShowShareLinkModal] = useState(false)
  const [shareLinkStep, setShareLinkStep] = useState<"options" | "social">("options")
  const [shareLinkPick, setShareLinkPick] = useState({
    recording: false,
    transcript: false,
    marks: true,
    summary: false,
  })
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
  const [askDraft, setAskDraft] = useState("")

  const openMoveToLibrary = () => {
    setShowToolsMenu(false)
    setShowShareOptions(false)
    setShowKBSheet(true)
  }

  const openCreateFolderSheet = () => {
    setShowToolsMenu(false)
    setShowShareOptions(false)
    setShowCreateFolderSheet(true)
  }

  const submitAskAboutNote = () => {
    const q = askDraft.trim()
    if (!q) {
      toast.error("Enter a question")
      return
    }
    toast.success("Sent to AI", { description: q.length > 120 ? `${q.slice(0, 120)}…` : q })
    setAskDraft("")
  }

  const closeAllOverlays = () => {
    setShowShareOptions(false)
    setShowShareLinkModal(false)
    setShareLinkStep("options")
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
    <div className="relative flex h-full min-w-0 flex-col overflow-x-hidden bg-white">
      {/* Top bar: Source | Note + actions */}
      <div className="flex items-center gap-1 border-b border-gray-100 px-2 py-2.5 sm:px-3">
        <button type="button" onClick={onBack} className="shrink-0 rounded-full p-2 hover:bg-gray-100" aria-label="Back">
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-6 sm:gap-10">
          {(["source", "note"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setSegment(id)}
              className={cn(
                "relative pb-1 text-[16px] font-medium tracking-tight transition-colors",
                segment === id ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {id === "source" ? "Source" : "Note"}
              {segment === id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-zinc-800" aria-hidden />
              )}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={openMoveToLibrary}
            className={cn(
              "hidden rounded-full px-2.5 py-1.5 text-[11px] font-semibold tracking-tight active:scale-[0.98] sm:flex sm:items-center sm:gap-1 sm:px-3",
              mx.brandCta
            )}
            aria-label="Move to library"
          >
            <Library className="h-3.5 w-3.5 opacity-90" strokeWidth={2} />
            <span>Library</span>
          </button>
          <button
            type="button"
            onClick={openMoveToLibrary}
            className={cn("flex h-9 w-9 items-center justify-center rounded-full sm:hidden", mx.brandCta)}
            aria-label="Move to library"
          >
            <Library className="h-4 w-4 text-white" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowToolsMenu(false)
              setShowShareOptions(true)
            }}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5 text-zinc-600" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowShareOptions(false)
              setShowToolsMenu((v) => !v)
            }}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="More"
          >
            <MoreHorizontal className="h-5 w-5 text-zinc-600" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Source: transcript only */}
      {segment === "source" && (
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full min-w-0 max-w-prose px-5 py-5">
            <p className="mb-6 text-center text-[12px] leading-relaxed text-zinc-400">
              Transcript synced with playback (demo)
            </p>
            <div className="space-y-6">
              {TRANSCRIPT_BLOCKS.map((block, i) => (
                <div key={i} className="space-y-1.5">
                  <span className="font-mono text-[12px] tabular-nums text-zinc-400">{block.t}</span>
                  <p
                    className={cn(
                      "break-words text-[17px] leading-[1.65] tracking-[-0.01em] transition-colors duration-200",
                      i === activeTranscriptIdx ? "font-normal text-zinc-900" : "text-zinc-500"
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

      {/* Note: player + Marks / Summary */}
      {segment === "note" && (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="border-b border-gray-100 bg-gradient-to-b from-stone-50/80 to-white px-5 py-4">
            <div className="relative mb-3 flex h-12 items-end justify-center gap-[2px] px-1">
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
                className="pointer-events-none absolute bottom-0 top-0 w-0.5 rounded-full bg-zinc-500 shadow-[0_0_12px_rgba(63,63,70,0.4)]"
                style={{ left: `calc(${playheadPct * 100}% - 1px)` }}
                aria-hidden
              />
            </div>
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-700">07:23</span>
              <span className="text-gray-400">23:45</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
              >
                <span className="text-xs font-semibold">-15</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-500 shadow-lg shadow-zinc-500/35 transition-colors hover:bg-zinc-600"
              >
                {isPlaying ? (
                  <Pause className="h-7 w-7 fill-white text-white" />
                ) : (
                  <Play className="ml-1 h-7 w-7 fill-white text-white" />
                )}
              </button>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
              >
                <span className="text-xs font-semibold">+15</span>
              </button>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
              >
                <span className="text-xs font-semibold">1x</span>
              </button>
            </div>
          </div>

          <div className="flex items-stretch justify-between gap-2 border-b border-stone-100 px-4 sm:px-5">
            <div className="flex min-w-0 gap-6 sm:gap-8">
              {(
                [
                  { id: "marks" as const, label: "Marks" },
                  { id: "summary" as const, label: "Summary", showChevron: true },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setNoteSub(tab.id)}
                  className={cn(
                    "flex items-center gap-0.5 py-3.5 text-[15px] font-medium tracking-tight transition-colors -mb-px border-b-[2.5px]",
                    noteSub === tab.id
                      ? "border-zinc-500 text-zinc-900"
                      : "border-transparent text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  {tab.label}
                  {"showChevron" in tab && tab.showChevron ? (
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" strokeWidth={2.5} aria-hidden />
                  ) : null}
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
                aria-label="Templates"
                title="Templates"
              >
                <Plus className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {noteSub === "marks" ? (
            <div className="mx-auto w-full min-w-0 max-w-prose flex-1 overflow-y-auto overflow-x-hidden px-5 pb-8 pt-5">
              <p className="text-center text-[12px] leading-relaxed text-zinc-400">
                AI-generated content for reference only
              </p>
              <h1 className="mt-5 break-words text-[22px] font-semibold tracking-tight text-zinc-900">Recording marks</h1>
              <div className="mt-6 space-y-5">
                {RECORDING_MARKS.map((m, idx) => (
                  <article
                    key={idx}
                    className="rounded-2xl border border-stone-200/90 bg-gradient-to-b from-white to-stone-50/80 p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Flag className="h-4 w-4 shrink-0 text-zinc-400" strokeWidth={2} aria-hidden />
                      <span className="font-mono text-[13px] tabular-nums">{m.t}</span>
                    </div>
                    <h2 className="mt-2 break-words text-[16px] font-semibold leading-snug text-zinc-900">{m.title}</h2>
                    <p
                      className={cn(
                        "mt-2 break-words text-[15px] leading-relaxed text-zinc-600",
                        markExpand[idx] ? "" : "line-clamp-3"
                      )}
                    >
                      {m.body}
                    </p>
                    <button
                      type="button"
                      className="mt-2.5 text-[14px] font-medium text-sky-600 hover:text-sky-700"
                      onClick={() => setMarkExpand((p) => ({ ...p, [idx]: !p[idx] }))}
                    >
                      {markExpand[idx] ? "Show less" : "Show more"}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full min-w-0 max-w-prose flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-4 pb-8 pt-4 sm:space-y-6 sm:px-5 sm:pb-10 sm:pt-5">
              <p className="text-center text-[11px] leading-relaxed text-zinc-400 sm:text-[12px]">
                AI-generated content for reference only
              </p>

              <header className="min-w-0 space-y-2 sm:space-y-2.5">
                <h1 className="break-words text-[20px] font-semibold leading-snug tracking-tight text-zinc-900 sm:text-[22px] sm:leading-tight">
                  Product requirements discussion
                </h1>
                <p className="text-[13px] text-zinc-500 sm:text-[14px]">Jan 15, 2024 · 2:32 PM · 23 min</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {["Meeting", "Product", "Knowledge"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 sm:px-2.5 sm:py-1 sm:text-[12px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </header>

              <section className="min-w-0 space-y-2 sm:space-y-2.5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 sm:text-[12px]">Overview</h2>
                <p className="min-w-0 break-words text-[14px] leading-[1.62] text-zinc-800 sm:text-[15px] sm:leading-[1.65]">
                  The team reviewed knowledge-graph visualization—how it helps organize information, surface relationships,
                  and compound learning. The graph should speed up processing and support decisions while helping users build
                  a personal knowledge system.
                </p>
              </section>

              <section className="min-w-0 space-y-2 sm:space-y-2.5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 sm:text-[12px]">Key points</h2>
                <ul className="space-y-2.5 sm:space-y-3">
                  {[
                    "Support rich node taxonomy (people, orgs, projects, themes)",
                    "Ship automatic link discovery and smart recommendations",
                    "Enable library-grounded AI assistance",
                  ].map((line) => (
                    <li key={line} className="flex min-w-0 gap-2.5 text-[14px] leading-[1.58] text-zinc-800 sm:gap-3 sm:text-[15px] sm:leading-[1.62]">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-400" aria-hidden />
                      <span className="min-w-0 flex-1 break-words">{line}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="min-w-0 space-y-2 sm:space-y-2.5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 sm:text-[12px]">Action items</h2>
                <div className="space-y-2 sm:space-y-2.5">
                  {[
                    { t: "Prototype the knowledge graph UI", who: "@design" },
                    { t: "Research competitor graph implementations", who: "@product" },
                  ].map((row) => (
                    <div
                      key={row.t}
                      className="flex items-start gap-2.5 rounded-xl border border-stone-200/80 bg-stone-50/50 px-3 py-2.5 sm:gap-3 sm:px-3.5 sm:py-3"
                    >
                      <div className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-2 border-zinc-300 sm:h-4 sm:w-4" aria-hidden />
                      <p className="min-w-0 flex-1 text-[14px] leading-snug text-zinc-800 sm:text-[15px]">{row.t}</p>
                      <span className="shrink-0 text-[11px] text-zinc-400 sm:text-[12px]">{row.who}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="min-w-0 space-y-2 rounded-2xl border border-stone-200/90 bg-white p-3 shadow-sm shadow-stone-900/[0.04] sm:space-y-2.5 sm:p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[14px] font-semibold text-zinc-900 sm:text-[15px]">Mind map</h3>
                  <button type="button" className="rounded-lg p-1.5 text-zinc-400 hover:bg-stone-100" aria-label="Expand">
                    <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
                  </button>
                </div>
                <p className="min-w-0 break-words text-[12px] leading-relaxed text-zinc-500 sm:text-[13px]">Thanks for using Mind—enjoy exploring.</p>
                <div className="-mx-1 overflow-x-auto pb-0.5 pt-0.5">
                  <div className="flex min-w-max items-stretch gap-1.5 px-1 sm:gap-2">
                    <span className="shrink-0 self-center rounded-xl bg-violet-100 px-2.5 py-2 text-[11px] font-semibold leading-snug text-violet-900 sm:px-3 sm:py-2.5 sm:text-[12px]">
                      How to use Mind?
                    </span>
                    {[
                      { label: "Recording", bg: "bg-sky-100 text-sky-900" },
                      { label: "Multimodal input", bg: "bg-amber-100 text-amber-900" },
                      { label: "Files UI", bg: "bg-emerald-100 text-emerald-900" },
                      { label: "Ask Mind", bg: "bg-rose-100 text-rose-900" },
                      { label: "Export & share", bg: "bg-indigo-100 text-indigo-900" },
                    ].map((b) => (
                      <span
                        key={b.label}
                        className={cn(
                          "shrink-0 self-center rounded-lg px-2 py-1.5 text-[10px] font-medium leading-tight sm:px-2.5 sm:py-2 sm:text-[11px]",
                          b.bg
                        )}
                      >
                        {b.label}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              <div className="flex min-w-0 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setSummaryFeedback((v) => (v === "up" ? null : "up"))}
                  className={cn(
                    "flex min-w-0 flex-1 basis-0 items-center justify-center gap-1.5 rounded-xl border-2 border-stone-200 bg-white px-2 py-2.5 text-[13px] font-medium text-zinc-700 transition-colors sm:gap-2 sm:py-3 sm:text-[14px]",
                    summaryFeedback === "up" && "border-sky-400 bg-sky-50 text-sky-900"
                  )}
                >
                  <ThumbsUp className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={1.85} aria-hidden />
                  <span className="whitespace-nowrap">Helpful</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSummaryFeedback((v) => (v === "down" ? null : "down"))}
                  className={cn(
                    "flex min-w-0 flex-1 basis-0 items-center justify-center gap-1.5 rounded-xl border-2 border-stone-200 bg-white px-2 py-2.5 text-[13px] font-medium text-zinc-700 transition-colors sm:gap-2 sm:py-3 sm:text-[14px]",
                    summaryFeedback === "down" && "border-orange-300 bg-orange-50 text-orange-900"
                  )}
                >
                  <ThumbsDown className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={1.85} aria-hidden />
                  <span className="whitespace-nowrap">Not helpful</span>
                </button>
              </div>

              <section className="min-w-0 space-y-2 sm:space-y-2.5">
                <h3 className="flex items-center gap-1.5 text-[14px] font-semibold text-zinc-900 sm:gap-2 sm:text-[15px]">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500 sm:h-4 sm:w-4" strokeWidth={2} aria-hidden />
                  Mind insights
                </h3>
                <div className="space-y-2 sm:space-y-2.5">
                  {MIND_INSIGHT_CARDS.map((card) => (
                    <button
                      key={card.title}
                      type="button"
                      onClick={() =>
                        toast.message(card.title, {
                          description: card.desc.length > 100 ? `${card.desc.slice(0, 100)}…` : card.desc,
                        })
                      }
                      className="flex w-full min-w-0 flex-col rounded-xl border border-stone-200/90 bg-stone-50/60 p-3 text-left transition-colors hover:border-stone-300 hover:bg-stone-50 sm:p-3.5"
                    >
                      <span className="break-words text-[14px] font-medium leading-snug text-zinc-900 sm:text-[15px]">{card.title}</span>
                      <span className="mt-1 line-clamp-2 break-words text-[12px] leading-relaxed text-zinc-600 sm:mt-1.5 sm:text-[13px]">{card.desc}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      )}

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
            className="absolute right-3 top-[108px] z-[47] w-[min(280px,calc(100%-24px))] overflow-hidden rounded-xl border border-stone-200/95 bg-white py-1 shadow-xl shadow-stone-900/12"
          >
            {note != null && onAssignNoteToNewFolder != null && (
              <button
                type="button"
                role="menuitem"
                onClick={openCreateFolderSheet}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] text-zinc-900 hover:bg-stone-50"
              >
                <FolderInput className="h-5 w-5 shrink-0 text-zinc-500" strokeWidth={1.5} />
                Save to folder
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setShowToolsMenu(false)
                toast.message("Find and replace", { description: "Full-text find and replace is coming soon (demo)." })
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] text-zinc-900 hover:bg-stone-50"
            >
              <SmartSearchIcon className="h-5 w-5 shrink-0 text-zinc-500" strokeWidth={1.5} />
              Find and replace
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setShowToolsMenu(false)
                toast.promise(
                  new Promise((r) => setTimeout(r, 900)),
                  {
                    loading: "Re-transcribing…",
                    success: "Transcription updated (demo)",
                    error: "Transcription failed",
                  }
                )
              }}
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
              onClick={() => {
                setShowToolsMenu(false)
                if (note) {
                  onTrashNote?.(note.id)
                  toast.success("Moved to trash")
                } else {
                  toast.message("Nothing to delete", { description: "No note is attached to this screen." })
                }
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] font-medium text-red-600 hover:bg-red-50/80"
            >
              <Trash2 className="h-5 w-5 shrink-0 text-red-500" strokeWidth={1.5} />
              Move to trash
            </button>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        <div className="relative">
          <span className="absolute left-3 top-0 z-10 -translate-y-1/2 rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-sky-800">
            Beta
          </span>
          <input
            type="text"
            value={askDraft}
            onChange={(e) => setAskDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                submitAskAboutNote()
              }
            }}
            placeholder="Ask about this note…"
            className="w-full rounded-xl border border-sky-200/90 bg-white px-4 py-3 pr-12 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
          <button
            type="button"
            onClick={submitAskAboutNote}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-500 hover:bg-sky-50 hover:text-sky-700"
            aria-label="Send question"
          >
            <MessageSquare className="w-5 h-5" />
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
                    onClick={() => {
                      setShareLinkStep("options")
                      setShareLinkPick({
                        recording: false,
                        transcript: false,
                        marks: true,
                        summary: false,
                      })
                      setShowShareOptions(false)
                      setShowShareLinkModal(true)
                    }}
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

      {/* Share link: scope + copy / then international social */}
      {showShareLinkModal && (
        <div className="absolute inset-0 z-[52]">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/35 backdrop-blur-[2px]"
            aria-label="Close"
            onClick={() => {
              setShowShareLinkModal(false)
              setShareLinkStep("options")
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 flex max-h-[88vh] flex-col rounded-t-[1.25rem] bg-white shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.18)] animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-zinc-200" />
            </div>
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 pb-3">
              <span className="text-base font-semibold text-zinc-900">
                {shareLinkStep === "social" ? "Share to social" : "Share link"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowShareLinkModal(false)
                  setShareLinkStep("options")
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-2">
              {shareLinkStep === "options" ? (
                <>
                  <h3 className="mb-2 text-[13px] font-semibold text-zinc-900">Included in link</h3>
                  <div className="overflow-hidden rounded-xl border border-zinc-200/90 divide-y divide-zinc-100 bg-white">
                    {(
                      [
                        { key: "recording" as const, label: "Recording", Icon: Mic },
                        { key: "transcript" as const, label: "Transcript", Icon: FileText },
                        { key: "marks" as const, label: "Marks", Icon: Flag },
                        { key: "summary" as const, label: "Summary", Icon: Sparkles },
                      ] as const
                    ).map(({ key, label, Icon }) => {
                      const on = shareLinkPick[key]
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setShareLinkPick((p) => ({ ...p, [key]: !p[key] }))}
                          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-zinc-50/90 active:bg-zinc-100/80"
                        >
                          <Icon className="h-5 w-5 shrink-0 text-zinc-500" strokeWidth={1.65} aria-hidden />
                          <span className="flex-1 text-[15px] text-zinc-900">{label}</span>
                          <span
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                              on ? "border-zinc-900 bg-zinc-900" : "border-zinc-300 bg-white"
                            )}
                            aria-hidden
                          >
                            {on ? <Check className="h-3 w-3 text-white" strokeWidth={3} /> : null}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <p className="mt-3 text-center text-[12px] leading-relaxed text-zinc-400">
                    Anyone with the link can view the selection. Link expires in 7 days (demo).
                  </p>
                  <div className="mt-5 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const keys = ["recording", "transcript", "marks", "summary"] as const
                        if (!keys.some((k) => shareLinkPick[k])) {
                          toast.error("Pick at least one item to share")
                          return
                        }
                        setShareLinkStep("social")
                      }}
                      className="w-full rounded-xl bg-zinc-900 py-3.5 text-[15px] font-semibold text-white shadow-sm hover:bg-zinc-800"
                    >
                      Share
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const shareUrl = `https://mind.app/s/n/${note?.id ?? 0}`
                        try {
                          await navigator.clipboard.writeText(shareUrl)
                          toast.success("Link copied", { description: "Recipients can open it for 7 days (demo)." })
                        } catch {
                          toast.error("Copy failed", { description: "Try again or copy the URL manually." })
                        }
                      }}
                      className="w-full rounded-xl border-2 border-zinc-200 bg-white py-3.5 text-[15px] font-semibold text-zinc-900 hover:bg-zinc-50"
                    >
                      Copy link
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShareLinkStep("options")}
                    className="mb-3 flex items-center gap-1 text-[14px] font-medium text-zinc-600 hover:text-zinc-900"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
                    Back
                  </button>
                  <p className="mb-4 text-[13px] leading-relaxed text-zinc-500">
                    Opens the platform’s share page in a new tab (X, Facebook, WhatsApp, LinkedIn, and more).
                  </p>
                  <SocialShareRow
                    title={note?.title || "Mind note"}
                    body={(() => {
                      const shareUrl = `https://mind.app/s/n/${note?.id ?? 0}`
                      const labels: Record<keyof typeof shareLinkPick, string> = {
                        recording: "Recording",
                        transcript: "Transcript",
                        marks: "Marks",
                        summary: "Summary",
                      }
                      const picked = (Object.keys(shareLinkPick) as (keyof typeof shareLinkPick)[]).filter(
                        (k) => shareLinkPick[k]
                      )
                      const scope = picked.map((k) => labels[k]).join(", ")
                      return `${shareUrl}\nIncludes: ${scope}`
                    })()}
                    onAfterAction={() =>
                      toast.message("Share page opened", { description: "Allow pop-ups if the window was blocked." })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowShareLinkModal(false)
                      setShareLinkStep("options")
                    }}
                    className="mt-5 w-full rounded-xl border border-zinc-200 py-3 text-[14px] font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    Done
                  </button>
                </>
              )}
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

      {showCreateFolderSheet && note != null && onAssignNoteToNewFolder && (
        <CreateFolderSheet
          open={showCreateFolderSheet}
          onClose={() => setShowCreateFolderSheet(false)}
          onCreate={(payload) => {
            const id = `folder-${Date.now()}`
            onAssignNoteToNewFolder(note.id, {
              id,
              name: payload.name,
              color: payload.color,
              iconKey: payload.iconKey,
            })
          }}
        />
      )}
    </div>
  )
}
