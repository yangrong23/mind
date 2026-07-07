"use client"

import { useEffect, useMemo, useState } from "react"
import { MindChatThinking } from "@/components/mind-v2/mind-chat-thinking"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { SocialShareRow } from "./social-share-row"
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
  Sparkles,
  FileText,
  MessageSquare,
  Plus,
  Link2,
  Copy,
  Flag,
  Mic,
  FolderInput,
  Pencil,
  ImageIcon,
  Languages,
  ThumbsUp,
  ThumbsDown,
  Maximize2,
  LayoutGrid,
  Calendar,
  Users,
  BarChart2,
  Quote,
  Scale,
} from "lucide-react"
import { CreateFolderSheet } from "./create-folder-sheet"
import { NoteFolderPickerSheet } from "./note-folder-picker-sheet"
import { NoteShareLibrarySheet, NoteSaveToLibraryBar } from "./note-share-library-sheet"
import { NoteRecordingActionsSheet } from "./note-recording-actions-sheet"
import { NoteGenerationSheet, type NoteGenerationMode } from "./note-generation-sheet"
import {
  NoteFindReplaceBar,
  findMatchIndices,
  replaceMatchAt,
  renderHighlightedText,
  getActiveBlockMatchIndex,
} from "./note-find-replace-bar"
import { MindChatComposer } from "@/components/mind-v2/mind-chat-composer"
import { NoteAiChatOverlay } from "@/components/mind-v2/note-ai-assist"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import {
  NOTE_ASK_PROMPTS,
  type NoteAskPromptId,
} from "@/lib/note-ask-prompts"
import type { Note } from "@/lib/note-types"
import { buildNoteChatLaunchContext } from "@/lib/note-chat-context"
import { isNoteAwaitingGenerate } from "@/lib/note-status"
import { toast } from "sonner"
import type { NoteFolder } from "@/lib/note-folders"
import type { KBCategory } from "@/lib/mock-knowledge-bases"

export type MovedLibraryMeta = {
  name: string
  color: string
  description?: string
  category?: KBCategory
}

interface NoteDetailProps {
  note?: Note | null
  onBack: () => void
  folders?: NoteFolder[]
  /** After a successful move, opens the destination library for a continuous Notes → Library flow */
  onMovedToLibrary?: (kb: MovedLibraryMeta) => void
  /** Assign note to an existing folder */
  onAssignNoteToFolder?: (noteId: number, folderId: string) => void
  /** Create a new folder and assign the current note to it (folder color/name on Notes home) */
  onAssignNoteToNewFolder?: (noteId: number, folder: NoteFolder) => void
  /** Move current note to trash and leave detail */
  onTrashNote?: (noteId: number) => void
  /** After user taps Generate on a synced-but-unprocessed recording */
  onNoteAnalyzed?: (noteId: number, patch: Partial<Note>) => void
  requireAuthThen?: (run: () => void) => void
  onNavigateToKnowledge?: (factoryKind?: FactoryModalKind) => void
}

const GENERATION_MS = 4200

function playerDurationLabels(duration?: string, pct = 0) {
  let totalSec = 54
  if (duration && /min/i.test(duration)) {
    const m = parseInt(duration)
    totalSec = (isNaN(m) ? 23 : m) * 60
  } else if (duration && /^\d+:\d{2}$/.test(duration)) {
    const [m, s] = duration.split(":")
    totalSec = Number(m) * 60 + Number(s)
  }
  const elapsedSec = Math.floor(Math.max(0, Math.min(1, pct)) * totalSec)
  const fmt = (n: number) => String(n).padStart(2, "0")
  const fmtTime = (sec: number) => `00:${fmt(Math.floor(sec / 60))}:${fmt(sec % 60)}`
  return { elapsed: fmtTime(elapsedSec), total: fmtTime(totalSec) }
}

function noteCapturedHeading(note: Note | null | undefined) {
  if (!note) return { dateLine: "2026-05-13", timeLine: "14:49:42" }
  const raw = note.date.replace(/^Today\s+/i, "").trim()
  const parts = raw.split(/\s+/)
  if (parts.length >= 2 && /\d{1,2}:\d{2}/.test(parts[parts.length - 1] ?? "")) {
    return { dateLine: parts.slice(0, -1).join(" ") || note.date, timeLine: parts[parts.length - 1]! }
  }
  return { dateLine: note.date, timeLine: note.duration ?? "" }
}

function NoteGenerationEmpty({
  hint,
  icon: Icon,
}: {
  hint: string
  icon: typeof MessageSquare
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <Icon className="h-16 w-16 text-stone-200" strokeWidth={1.25} aria-hidden />
      <p className="mt-6 text-[17px] font-medium text-zinc-400">Notes can be generated</p>
      <p className="mt-2 max-w-[240px] text-[14px] leading-relaxed text-zinc-400">{hint}</p>
    </div>
  )
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
    title: "Can Mindar sync with your calendar or task apps?",
    desc: "Based on this note, block time for a short review and sync next steps to your usual task list.",
  },
  {
    title: "Follow-ups worth asking in the next recording",
    desc: "Capture one competitor mind-map example and a one-line tradeoff (performance vs maintainability) for review.",
  },
] as const

type SummaryInsightView = NoteAskPromptId

const SUMMARY_OVERVIEW =
  "The team reviewed knowledge-graph visualization—how it helps organize information, surface relationships, and compound learning. The graph should speed up processing and support decisions while helping users build a personal knowledge system."

const SUMMARY_TODOS = [
  { text: "Prototype the knowledge graph UI", who: "@design", due: "Jan 22" },
  { text: "Research competitor graph implementations", who: "@product", due: "Jan 24" },
  { text: "Compare D3.js vs React Flow for performance", who: "@engineering", due: "Jan 26" },
] as const

const SUMMARY_QUOTES = [
  {
    t: "00:01:15",
    speaker: "Product",
    quote: "We’ll support four node types—people, orgs, projects, and themes—each with distinct colors for quick scanning.",
  },
  {
    t: "00:02:00",
    speaker: "Engineering",
    quote: "Automatic link discovery should infer connections from content without manual wiring.",
  },
  {
    t: "00:10:15",
    speaker: "Engineering",
    quote: "Next step is a performance and maintainability review between D3.js and React Flow.",
  },
] as const

const SUMMARY_SPEAKERS = [
  {
    name: "Product",
    role: "PM",
    points: [
      "Defined four core node types and color-by-type scanning.",
      "Prioritized automatic link discovery over manual graph wiring.",
    ],
  },
  {
    name: "Engineering",
    role: "Tech lead",
    points: [
      "Raised D3.js vs React Flow tradeoffs for the graph renderer.",
      "Committed to a shortlist review before UI lock-in.",
    ],
  },
  {
    name: "Design",
    role: "UX",
    points: ["Requested fluid zoom/pan/inspect interactions on the graph canvas."],
  },
] as const

const SUMMARY_DECISIONS = [
  {
    title: "Ship people–org–project–theme taxonomy in v1",
    status: "confirmed" as const,
    detail: "Four node types with distinct colors; theme nodes included in scope.",
  },
  {
    title: "Pursue automatic link discovery",
    status: "confirmed" as const,
    detail: "System infers edges from content; manual linking is secondary.",
  },
  {
    title: "Pick graph library after perf review",
    status: "pending" as const,
    detail: "D3.js vs React Flow—decision after engineering spike (target Jan 26).",
  },
] as const

function NoteSummaryInsightPanel({ view }: { view: SummaryInsightView }) {
  if (view === "todos") {
    return (
      <section className="min-w-0 space-y-2.5 sm:space-y-3">
        <p className="text-[12px] leading-relaxed text-zinc-500 sm:text-[13px]">
          {NOTE_ASK_PROMPTS.find((v) => v.id === "todos")?.hint}
        </p>
        <div className="space-y-2 sm:space-y-2.5">
          {SUMMARY_TODOS.map((row) => (
            <div
              key={row.text}
              className="flex items-start gap-2.5 rounded-xl border border-stone-200/80 bg-stone-50/50 px-3 py-2.5 sm:gap-3 sm:px-3.5 sm:py-3"
            >
              <div className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-2 border-zinc-300 sm:h-4 sm:w-4" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] leading-snug text-zinc-800 sm:text-[15px]">{row.text}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-400 sm:text-[12px]">
                  <span>{row.who}</span>
                  <span aria-hidden>·</span>
                  <span className="tabular-nums">Due {row.due}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (view === "quotes") {
    return (
      <section className="min-w-0 space-y-2.5 sm:space-y-3">
        <p className="text-[12px] leading-relaxed text-zinc-500 sm:text-[13px]">
          {NOTE_ASK_PROMPTS.find((v) => v.id === "quotes")?.hint}
        </p>
        <div className="space-y-2.5 sm:space-y-3">
          {SUMMARY_QUOTES.map((row) => (
            <blockquote
              key={row.t}
              className="relative rounded-xl border border-stone-200/90 bg-white px-3 py-3 shadow-sm shadow-stone-900/[0.03] sm:px-3.5 sm:py-3.5"
            >
              <Quote className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-mind/25 sm:h-4 sm:w-4" strokeWidth={2} aria-hidden />
              <p className="pr-6 text-[14px] font-medium leading-snug text-zinc-900 sm:text-[15px]">&ldquo;{row.quote}&rdquo;</p>
              <footer className="mt-2 flex flex-wrap items-center gap-x-2 text-[11px] text-zinc-500 sm:text-[12px]">
                <span className="font-medium text-zinc-700">{row.speaker}</span>
                <span aria-hidden>·</span>
                <span className="tabular-nums">{row.t}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
    )
  }

  if (view === "speakers") {
    return (
      <section className="min-w-0 space-y-2.5 sm:space-y-3">
        <p className="text-[12px] leading-relaxed text-zinc-500 sm:text-[13px]">
          {NOTE_ASK_PROMPTS.find((v) => v.id === "speakers")?.hint}
        </p>
        <div className="space-y-2.5 sm:space-y-3">
          {SUMMARY_SPEAKERS.map((speaker) => (
            <article
              key={speaker.name}
              className="rounded-xl border border-stone-200/90 bg-gradient-to-b from-white to-stone-50/80 p-3 sm:p-3.5"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mind/10 text-[12px] font-semibold text-mind">
                  {speaker.name.slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[14px] font-semibold text-zinc-900 sm:text-[15px]">{speaker.name}</h3>
                  <p className="text-[11px] text-zinc-500 sm:text-[12px]">{speaker.role}</p>
                </div>
              </div>
              <ul className="mt-2.5 space-y-1.5 sm:mt-3 sm:space-y-2">
                {speaker.points.map((point) => (
                  <li key={point} className="flex min-w-0 gap-2 text-[13px] leading-relaxed text-zinc-700 sm:text-[14px]">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-400" aria-hidden />
                    <span className="min-w-0 flex-1 break-words">{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="min-w-0 space-y-2.5 sm:space-y-3">
      <p className="text-[12px] leading-relaxed text-zinc-500 sm:text-[13px]">
        {NOTE_ASK_PROMPTS.find((v) => v.id === "decisions")?.hint}
      </p>
      <div className="space-y-2 sm:space-y-2.5">
        {SUMMARY_DECISIONS.map((row) => (
          <div
            key={row.title}
            className="rounded-xl border border-stone-200/90 bg-white px-3 py-3 sm:px-3.5 sm:py-3.5"
          >
            <div className="flex items-start gap-2">
              <Scale className="mt-0.5 h-4 w-4 shrink-0 text-mind" strokeWidth={2} aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[14px] font-semibold leading-snug text-zinc-900 sm:text-[15px]">{row.title}</h3>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]",
                      row.status === "confirmed"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80"
                        : "bg-amber-50 text-amber-800 ring-1 ring-amber-200/80"
                    )}
                  >
                    {row.status === "confirmed" ? "Confirmed" : "Pending"}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-600 sm:text-[14px]">{row.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

type TemplateGlyph =
  | "layout-grid"
  | "calendar"
  | "file-text"
  | "quote-99"
  | "sparkles"
  | "share-network"
  | "users"
  | "pencil"

type TemplateIconPalette = "orange" | "green" | "purple" | "blue" | "violet" | "amber" | "mind"

const TEMPLATE_CARD_SHELL =
  "relative flex h-full min-h-[172px] w-full flex-col rounded-xl border bg-white p-4 text-left shadow-sm transition-colors"

/** Same 2-col cell sizing on Mine, For you, and Explore */
const TEMPLATE_GRID_CLASS = "grid grid-cols-2 gap-3 [&>*]:h-[172px] [&>*]:min-w-0"

const TEMPLATE_CARD_SELECTED = "border-zinc-500 ring-1 ring-zinc-200/60"
const TEMPLATE_CARD_DEFAULT = "border-stone-200/90 hover:border-stone-300/90"

/** Muted icon tints — soft wells, no neon glow (matches reference UI) */
const TEMPLATE_ICON_PALETTES: Record<TemplateIconPalette, { well: string; icon: string }> = {
  orange: {
    well: "bg-orange-50/70 ring-1 ring-orange-100/60",
    icon: "text-orange-700/75",
  },
  green: {
    well: "bg-emerald-50/70 ring-1 ring-emerald-100/60",
    icon: "text-emerald-800/70",
  },
  purple: {
    well: "bg-violet-50/70 ring-1 ring-violet-100/60",
    icon: "text-violet-700/75",
  },
  blue: {
    well: "bg-sky-50/70 ring-1 ring-sky-100/60",
    icon: "text-sky-800/75",
  },
  violet: {
    well: "bg-fuchsia-50/60 ring-1 ring-fuchsia-100/50",
    icon: "text-violet-700/70",
  },
  amber: {
    well: "bg-amber-50/70 ring-1 ring-amber-100/60",
    icon: "text-amber-800/70",
  },
  mind: {
    well: "bg-sky-50/80 ring-1 ring-sky-100/70",
    icon: "text-mind/80",
  },
}

function TemplateIconWell({
  palette,
  children,
}: {
  palette: TemplateIconPalette
  children: React.ReactNode
}) {
  const style = TEMPLATE_ICON_PALETTES[palette]
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
        style.well
      )}
    >
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center [&_svg]:block [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0",
          style.icon
        )}
      >
        {children}
      </span>
    </div>
  )
}

function TemplateCardIconRow({ icon }: { icon: React.ReactNode }) {
  return <div className="mb-3 flex h-10 w-full shrink-0 items-center">{icon}</div>
}

function renderTemplateGlyph(glyph: TemplateGlyph) {
  switch (glyph) {
    case "layout-grid":
      return <LayoutGrid strokeWidth={2} />
    case "calendar":
      return <Calendar strokeWidth={2} />
    case "file-text":
      return <FileText strokeWidth={2} />
    case "quote-99":
      return <span className="text-[13px] font-bold leading-none">99</span>
    case "sparkles":
      return <Sparkles strokeWidth={2} />
    case "share-network":
      return <Share2 strokeWidth={2} />
    case "users":
      return <Users strokeWidth={2} />
    case "pencil":
      return <Pencil strokeWidth={2} />
    default:
      return <FileText strokeWidth={2} />
  }
}

type TemplatePickerCardProps = {
  name: string
  desc: string
  glyph: TemplateGlyph
  palette: TemplateIconPalette
  selected: boolean
  onSelect: () => void
  badge?: string
  author?: string
  count?: number
}

function TemplatePickerCard({
  name,
  desc,
  glyph,
  palette,
  selected,
  onSelect,
  badge,
  author,
  count,
}: TemplatePickerCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(TEMPLATE_CARD_SHELL, selected ? TEMPLATE_CARD_SELECTED : TEMPLATE_CARD_DEFAULT)}
    >
      {badge ? (
        <span className="absolute right-2 top-2 z-[1] rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 ring-1 ring-stone-200/80">
          {badge}
        </span>
      ) : null}
      <TemplateCardIconRow
        icon={
          <TemplateIconWell palette={palette}>
            {renderTemplateGlyph(glyph)}
          </TemplateIconWell>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mb-1 line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">{name}</div>
        <p className="line-clamp-3 flex-1 text-xs leading-relaxed text-zinc-500">{desc}</p>
        <div className="mt-auto flex min-h-[18px] min-w-0 shrink-0 items-center gap-1.5 pt-2 text-xs text-zinc-400">
          {count != null ? (
            <>
              <BarChart2 className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={2} />
              <span className="tabular-nums">{count}</span>
            </>
          ) : null}
          {count != null && author ? <span className="opacity-60">·</span> : null}
          {author ? <span className="truncate">{author}</span> : null}
        </div>
      </div>
    </button>
  )
}

function TemplateCreateCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        TEMPLATE_CARD_SHELL,
        "items-center justify-center gap-2 border-2 border-dashed border-stone-300 bg-white shadow-none hover:border-stone-400"
      )}
    >
      <Pencil className="h-8 w-8 text-zinc-400" strokeWidth={1.5} />
      <span className="text-sm text-zinc-500">New template</span>
    </button>
  )
}

export function NoteDetail({
  note,
  onBack,
  folders = [],
  onMovedToLibrary,
  onAssignNoteToFolder,
  onAssignNoteToNewFolder,
  onTrashNote,
  onNoteAnalyzed,
  requireAuthThen,
  onNavigateToKnowledge,
}: NoteDetailProps) {
  /** Source = transcript / raw; Note = summary and marks */
  const [segment, setSegment] = useState<"source" | "note">("note")
  const [noteSub, setNoteSub] = useState<"marks" | "summary">("summary")
  const [summaryFeedback, setSummaryFeedback] = useState<"up" | "down" | null>(null)
  const [summaryInsightView, setSummaryInsightView] = useState<SummaryInsightView | null>(null)
  const [markExpand, setMarkExpand] = useState<Record<number, boolean>>({})
  const [isPlaying, setIsPlaying] = useState(false)
  const [playheadPct, setPlayheadPct] = useState(0.32)
  const [showRecordingActionsSheet, setShowRecordingActionsSheet] = useState(false)
  const [showNoteShareSheet, setShowNoteShareSheet] = useState(false)
  const [noteSharePresentation, setNoteSharePresentation] = useState<"save" | "share">("save")
  const [removeFromMemosOnSave, setRemoveFromMemosOnSave] = useState(true)
  const [savePromptDismissed, setSavePromptDismissed] = useState(false)
  const [showFolderPicker, setShowFolderPicker] = useState(false)
  const [folderPickerMode, setFolderPickerMode] = useState<"generate" | "assign">("assign")
  const [createFolderFromPicker, setCreateFolderFromPicker] = useState(false)
  const [showCreateFolderSheet, setShowCreateFolderSheet] = useState(false)
  /** Share link modal (legacy deep link options) */
  const [showShareLinkModal, setShowShareLinkModal] = useState(false)
  const [shareLinkStep, setShareLinkStep] = useState<"options" | "social">("options")
  const [shareLinkPick, setShareLinkPick] = useState({
    recording: false,
    transcript: false,
    marks: true,
    summary: false,
  })
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [findQuery, setFindQuery] = useState("")
  const [replaceQuery, setReplaceQuery] = useState("")
  const [findMatchIndex, setFindMatchIndex] = useState(0)
  const [transcriptBlocks, setTranscriptBlocks] = useState(() =>
    TRANSCRIPT_BLOCKS.map((b) => ({ t: b.t, text: b.text }))
  )
  const [summaryOverview, setSummaryOverview] = useState(SUMMARY_OVERVIEW)
  const [markBodies, setMarkBodies] = useState(() =>
    RECORDING_MARKS.map((m) => ({ t: m.t, title: m.title, body: m.body }))
  )
  const [showCreateTemplateSheet, setShowCreateTemplateSheet] = useState(false)
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false)
  const [templateDraftName, setTemplateDraftName] = useState("")
  const [templateDraftPrompt, setTemplateDraftPrompt] = useState("")
  const [customTemplates, setCustomTemplates] = useState<{ id: string; name: string; desc: string; prompt: string }[]>(
    []
  )
  const [templateLanguage, setTemplateLanguage] = useState("Auto")
  const [selectedTemplate, setSelectedTemplate] = useState<{id: string, name: string, desc: string} | null>(null)
  const [showTemplatePage, setShowTemplatePage] = useState(false)
  const [templateTab, setTemplateTab] = useState<"mine" | "recommend" | "explore">("mine")
  const [generated, setGenerated] = useState(() => !note || !isNoteAwaitingGenerate(note))
  const [isGenerating, setIsGenerating] = useState(false)
  const [thinkingPhase, setThinkingPhase] = useState(0)
  const [generationMode, setGenerationMode] = useState<NoteGenerationMode>("auto")
  const [autoLabelSpeakers, setAutoLabelSpeakers] = useState(false)
  const [audioLanguage, setAudioLanguage] = useState("Simplified Chinese · Mandarin")
  const [aiModel, setAiModel] = useState("Auto")
  const [showAgentChat, setShowAgentChat] = useState(false)
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>()

  const needsManualGenerate = note != null && isNoteAwaitingGenerate(note) && !generated
  const showGenerationThinking = needsManualGenerate && isGenerating
  const showGenerationEmpty = needsManualGenerate && !isGenerating
  const contentReady = !needsManualGenerate
  const playerTimes = playerDurationLabels(note?.duration, playheadPct)

  const openMoveToLibrary = () => {
    if (!contentReady) {
      toast.message("Not ready yet", {
        description: "Generate your note before saving to a library.",
      })
      return
    }
    setNoteSharePresentation("save")
    setShowNoteShareSheet(true)
  }

  const openShareSheet = () => {
    setNoteSharePresentation("share")
    setShowNoteShareSheet(true)
  }

  const showSaveToLibraryPrompt = contentReady && !savePromptDismissed

  useEffect(() => {
    setSavePromptDismissed(false)
    setRemoveFromMemosOnSave(true)
    setShowFindReplace(false)
    setFindQuery("")
    setReplaceQuery("")
    setFindMatchIndex(0)
    setTranscriptBlocks(TRANSCRIPT_BLOCKS.map((b) => ({ t: b.t, text: b.text })))
    setSummaryOverview(SUMMARY_OVERVIEW)
    setMarkBodies(RECORDING_MARKS.map((m) => ({ t: m.t, title: m.title, body: m.body })))
  }, [note?.id])

  const searchableText = useMemo(() => {
    if (segment === "source") return transcriptBlocks.map((b) => b.text).join("\n")
    if (noteSub === "marks") return markBodies.map((m) => m.body).join("\n")
    return summaryOverview
  }, [segment, noteSub, transcriptBlocks, markBodies, summaryOverview])

  const findMatchStarts = useMemo(
    () => findMatchIndices(searchableText, findQuery),
    [searchableText, findQuery]
  )

  useEffect(() => {
    setFindMatchIndex(0)
  }, [findQuery, segment, noteSub])

  useEffect(() => {
    if (findMatchStarts.length === 0) {
      setFindMatchIndex(0)
      return
    }
    setFindMatchIndex((i) => Math.min(i, findMatchStarts.length - 1))
  }, [findMatchStarts.length])

  const openAssignFolderPicker = (mode: "generate" | "assign") => {
    setShowNoteShareSheet(false)
    setFolderPickerMode(mode)
    setShowFolderPicker(true)
  }

  const openCreateFolderSheet = () => {
    setShowNoteShareSheet(false)
    setCreateFolderFromPicker(false)
    setShowCreateFolderSheet(true)
  }

  const completeFolderSelection = (folderId: string) => {
    if (!note) return
    onAssignNoteToFolder?.(note.id, folderId)
    setShowFolderPicker(false)
    if (folderPickerMode === "generate") {
      setThinkingPhase(0)
      setIsGenerating(true)
      toast.message("Generating…", {
        description: selectedTemplate?.name ? `Template: ${selectedTemplate.name}` : "Processing your recording",
      })
    } else {
      toast.success("Saved to folder")
    }
  }

  const handleMoveNoteToLibrary = (kb: KnowledgeBase, options: { removeFromMemos: boolean }) => {
    setShowNoteShareSheet(false)
    setSavePromptDismissed(true)
    onMovedToLibrary?.({
      name: kb.name,
      color: kb.color,
      description: kb.description,
      category: kb.category,
    })
    if (options.removeFromMemos && note) {
      onTrashNote?.(note.id)
    }
    toast.success(`Saved to ${kb.name}`, {
      description: options.removeFromMemos
        ? "Removed from Memos — find it in Library."
        : "A copy is now in your library.",
    })
  }

  const openNoteChat = (initialPrompt?: string) => {
    if (!note) return
    const run = () => {
      setChatInitialPrompt(initialPrompt?.trim() || undefined)
      setShowAgentChat(true)
    }
    if (requireAuthThen) requireAuthThen(run)
    else run()
  }

  const closeAllOverlays = () => {
    setShowAgentChat(false)
    setChatInitialPrompt(undefined)
    setShowNoteShareSheet(false)
    setShowShareLinkModal(false)
    setShareLinkStep("options")
    setShowFindReplace(false)
    setShowCreateTemplateSheet(false)
    setShowTemplateConfirm(false)
    setShowFolderPicker(false)
    setShowRecordingActionsSheet(false)
  }

  function replaceInJoinedItems<T extends { text?: string; body?: string }>(
    items: T[],
    field: "text" | "body",
    matchStart: number,
    findLen: number,
    replacement: string
  ): T[] {
    let pos = 0
    const next = items.map((item) => ({ ...item }))
    for (let i = 0; i < next.length; i++) {
      const chunk = next[i][field] ?? ""
      const chunkEnd = pos + chunk.length
      if (matchStart < chunkEnd) {
        const localStart = matchStart - pos
        next[i] = {
          ...next[i],
          [field]: replaceMatchAt(chunk, localStart, findLen, replacement),
        }
        return next
      }
      pos = chunkEnd + (i < next.length - 1 ? 1 : 0)
    }
    return next
  }

  const handleReplaceCurrentMatch = () => {
    const q = findQuery.trim()
    if (!q || findMatchStarts.length === 0) return
    const matchStart = findMatchStarts[findMatchIndex] ?? findMatchStarts[0]
    if (segment === "source") {
      setTranscriptBlocks((prev) => replaceInJoinedItems(prev, "text", matchStart, q.length, replaceQuery))
    } else if (noteSub === "marks") {
      setMarkBodies((prev) => replaceInJoinedItems(prev, "body", matchStart, q.length, replaceQuery))
    } else {
      setSummaryOverview((prev) => replaceMatchAt(prev, matchStart, q.length, replaceQuery))
    }
    toast.message("Replaced", { description: "Updated the current match." })
  }

  const handleMoveRecordingToTrash = () => {
    if (!note) return
    onTrashNote?.(note.id)
    toast.success("Moved to trash")
    onBack()
  }

  useEffect(() => {
    setGenerated(note == null || !isNoteAwaitingGenerate(note))
    setIsGenerating(false)
    setThinkingPhase(0)
    if (note != null && isNoteAwaitingGenerate(note)) setSegment("note")
  }, [note?.id, note?.status])

  useEffect(() => {
    if (!isGenerating) return
    const phaseId = window.setInterval(() => {
      setThinkingPhase((p) => Math.min(p + 1, 2))
    }, 1400)
    const doneId = window.setTimeout(() => {
      setIsGenerating(false)
      setGenerated(true)
      if (note) {
        onNoteAnalyzed?.(note.id, {
          status: "analyzed",
          preview: `${TRANSCRIPT_BLOCKS[0].text.slice(0, 72)}…`,
          title: note.title === "New recording" ? "Synced recording" : note.title,
          duration: !note.duration || note.duration === "0:00" ? "1 min" : note.duration,
        })
      }
      toast.success("Generation complete", { description: "Transcript and summary are ready." })
      setSavePromptDismissed(false)
      setSegment("note")
    }, GENERATION_MS)
    return () => {
      window.clearInterval(phaseId)
      window.clearTimeout(doneId)
    }
  }, [isGenerating, note, onNoteAnalyzed])

  const handleStartGeneration = () => {
    if (!needsManualGenerate || isGenerating) return
    if (generationMode === "auto") {
      setSelectedTemplate({
        id: "smart-summary",
        name: "Smart summary",
        desc: "Adaptive summaries across contexts",
      })
      setThinkingPhase(0)
      setIsGenerating(true)
      toast.message("Auto-generating…", {
        description: "Mindar is matching transcript and summary (demo).",
      })
      return
    }
    if (!selectedTemplate) {
      toast.error("Choose a template", {
        description: "Pick a summary template under Custom generate.",
      })
      setShowTemplatePage(true)
      return
    }
    setShowTemplatePage(false)
    openAssignFolderPicker("generate")
  }

  const cycleAudioLanguage = () => {
    const options = ["Auto", "English · US", "Simplified Chinese · Mandarin", "Japanese"]
    setAudioLanguage((current) => {
      const i = options.indexOf(current)
      return options[(i + 1) % options.length] ?? options[0]
    })
  }

  const cycleAiModel = () => {
    const options = ["Auto", "Mindar Fast", "Mindar Pro"]
    setAiModel((current) => {
      const i = options.indexOf(current)
      return options[(i + 1) % options.length] ?? options[0]
    })
  }

  const openCustomTemplatePicker = () => {
    setGenerationMode("custom")
    setShowTemplatePage(true)
  }

  useEffect(() => {
    if (segment === "note") setIsPlaying(false)
  }, [segment])

  useEffect(() => {
    if (!isPlaying || segment !== "source") return
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
  }, [isPlaying, segment])

  const activeTranscriptIdx = Math.min(
    TRANSCRIPT_BLOCKS.length - 1,
    Math.max(0, Math.floor(playheadPct * TRANSCRIPT_BLOCKS.length))
  )

  return (
    <div className="relative flex h-full min-w-0 flex-col overflow-x-hidden bg-white">
      {/* Top bar: Source | Note + actions */}
      <div className="flex items-center gap-1 border-b border-stone-100 px-2 py-2.5 sm:px-3">
        <button type="button" onClick={onBack} className="shrink-0 rounded-full p-2 hover:bg-stone-100" aria-label="Back">
          <ChevronLeft className="h-6 w-6 text-zinc-700" />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-6 sm:gap-10">
          <button
            type="button"
            onClick={() => setSegment("source")}
            className={cn(
              "relative pb-1 tracking-tight transition-colors",
              segment === "source" ? "text-[16px] font-semibold text-zinc-900" : "text-[15px] font-medium text-zinc-400 hover:text-zinc-600"
            )}
          >
            Source
          </button>
          <button
            type="button"
            onClick={() => setSegment("note")}
            className={cn(
              "relative pb-1 tracking-tight transition-colors",
              segment === "note" ? "text-[16px] font-semibold text-zinc-900" : "text-[15px] font-medium text-zinc-400 hover:text-zinc-600"
            )}
          >
            Note
          </button>
        </div>
        <div className="relative flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={openMoveToLibrary}
            className="rounded-full p-2 hover:bg-stone-100"
            aria-label="Move to library"
          >
            <FolderInput className="h-5 w-5 text-zinc-600" strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setShowRecordingActionsSheet(true)}
            className="rounded-full p-2 hover:bg-stone-100"
            aria-label="More options"
          >
            <MoreHorizontal className="h-5 w-5 text-zinc-600" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      {/* Source: recording playback + transcript */}
      {segment === "source" && (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-stone-100 bg-gradient-to-b from-stone-50/80 to-white px-5 py-4">
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
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={playheadPct}
              onChange={(e) => setPlayheadPct(Number(e.target.value))}
              onMouseDown={() => setIsPlaying(false)}
              onTouchStart={() => setIsPlaying(false)}
              className="mb-3 w-full cursor-pointer accent-zinc-500"
              aria-label="Audio progress"
            />
            <div className="mb-4 flex items-center justify-between text-sm tabular-nums">
              <span className="font-medium text-zinc-700">{playerTimes.elapsed}</span>
              <span className="text-zinc-400">{playerTimes.total}</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-stone-100"
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
                className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-stone-100"
              >
                <span className="text-xs font-semibold">+15</span>
              </button>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-stone-100"
              >
                <span className="text-xs font-semibold">1x</span>
              </button>
            </div>
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 px-5 pt-2">
              <p className="text-center text-[15px] font-semibold text-zinc-900">
                <span className="inline-block border-b-2 border-zinc-900 pb-1">Transcript</span>
              </p>
            </div>
            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mx-auto w-full min-w-0 max-w-prose px-5 py-5">
              {showGenerationThinking ? (
                <MindChatThinking phase={thinkingPhase} compact className="py-8" />
              ) : showGenerationEmpty ? (
                <NoteGenerationEmpty hint="Transcript will appear here after generation" icon={MessageSquare} />
              ) : (
              <div className="space-y-6">
                {transcriptBlocks.map((block, i) => (
                  <div key={i} className="space-y-1.5">
                    <span className="text-[12px] tabular-nums text-zinc-400">{block.t}</span>
                    <p
                      className={cn(
                        "break-words text-[15px] leading-[1.65] tracking-[-0.01em] transition-colors duration-200",
                        i === activeTranscriptIdx ? "font-normal text-zinc-900" : "text-zinc-500"
                      )}
                    >
                      {segment === "source" && showFindReplace && findQuery.trim()
                        ? renderHighlightedText(
                            block.text,
                            findQuery,
                            getActiveBlockMatchIndex(
                              transcriptBlocks.map((b) => b.text),
                              i,
                              findMatchIndex,
                              findQuery
                            )
                          )
                        : block.text}
                    </p>
                  </div>
                ))}
              </div>
              )}
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Note: Marks / Summary only — playback lives under Source */}
      {segment === "note" && (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-stretch gap-6 px-4 sm:gap-8 sm:px-5">
            <button
              type="button"
              onClick={() => setNoteSub("marks")}
              className={cn(
                "flex items-center gap-0.5 py-3.5 text-[15px] font-medium tracking-tight transition-colors",
                noteSub === "marks" ? "font-semibold text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              Marks
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setNoteSub("summary")}
                className={cn(
                  "flex items-center gap-0.5 py-3.5 text-[15px] font-medium tracking-tight transition-colors",
                  noteSub === "summary" ? "font-semibold text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                Summary
                <ChevronDown className="h-3.5 w-3.5 opacity-60" strokeWidth={2.5} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => {
                  closeAllOverlays()
                  setShowTemplatePage(true)
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-600 hover:bg-stone-100"
                aria-label="Templates"
                title="Templates"
              >
                <Plus className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {noteSub === "marks" ? (
            <div className="mx-auto flex w-full min-w-0 max-w-prose flex-1 flex-col overflow-y-auto overflow-x-hidden px-5 pb-8 pt-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {!contentReady ? (
                showGenerationThinking ? (
                  <MindChatThinking phase={thinkingPhase} compact className="flex-1 py-8" />
                ) : (
                  <NoteGenerationEmpty hint="Marks will appear here after generation" icon={Flag} />
                )
              ) : (
                <>
              <p className="text-center text-[12px] leading-relaxed text-zinc-400">
                AI-generated content for reference only
              </p>
              <h1 className="mt-5 break-words text-[20px] font-semibold tracking-tight text-zinc-900">Recording marks</h1>
              <div className="mt-6 space-y-5">
                {markBodies.map((m, idx) => (
                  <article
                    key={idx}
                    className="rounded-2xl border border-stone-200/90 bg-gradient-to-b from-white to-stone-50/80 p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Flag className="h-4 w-4 shrink-0 text-zinc-400" strokeWidth={2} aria-hidden />
                      <span className="text-[12px] tabular-nums">{m.t}</span>
                    </div>
                    <h2 className="mt-2 break-words text-[15px] font-semibold leading-snug text-zinc-900">{m.title}</h2>
                    <p
                      className={cn(
                        "mt-2 break-words text-[15px] leading-[1.65] text-zinc-600",
                        markExpand[idx] ? "" : "line-clamp-3"
                      )}
                    >
                      {segment === "note" && noteSub === "marks" && showFindReplace && findQuery.trim()
                        ? renderHighlightedText(
                            m.body,
                            findQuery,
                            getActiveBlockMatchIndex(
                              markBodies.map((item) => item.body),
                              idx,
                              findMatchIndex,
                              findQuery
                            )
                          )
                        : m.body}
                    </p>
                    <button
                      type="button"
                      className="mt-2.5 text-[14px] font-medium text-mind hover:text-mind"
                      onClick={() => setMarkExpand((p) => ({ ...p, [idx]: !p[idx] }))}
                    >
                      {markExpand[idx] ? "Show less" : "Show more"}
                    </button>
                  </article>
                ))}
              </div>
                </>
              )}
            </div>
          ) : (
            <div className="mx-auto flex w-full min-w-0 max-w-prose flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 pb-8 pt-4 sm:px-5 sm:pb-10 sm:pt-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {!contentReady ? (
                showGenerationThinking ? (
                  <MindChatThinking phase={thinkingPhase} compact className="flex-1 py-8" />
                ) : (
                  <>
                    {(() => {
                      const { dateLine, timeLine } = noteCapturedHeading(note)
                      return (
                        <header className="shrink-0 pb-2 pt-2 text-center">
                          <p className="text-[28px] font-bold leading-tight tracking-tight text-zinc-900">{dateLine}</p>
                          {timeLine ? (
                            <p className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-zinc-900">{timeLine}</p>
                          ) : null}
                        </header>
                      )
                    })()}
                    <NoteGenerationEmpty hint="Summary will appear here after generation" icon={FileText} />
                  </>
                )
              ) : (
                <div className="space-y-5 sm:space-y-6">
              <p className="text-center text-[12px] leading-relaxed text-zinc-400">
                AI-generated content for reference only
              </p>

              <header className="min-w-0 space-y-2 sm:space-y-2.5">
                <h1 className="break-words text-[20px] font-semibold leading-snug tracking-tight text-zinc-900">
                  Product requirements discussion
                </h1>
                <p className="text-[15px] text-zinc-500">Jan 15, 2024 · 2:32 PM · 23 min</p>
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
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Overview</h2>
                <p className="min-w-0 break-words text-[15px] leading-[1.65] text-zinc-800">
                  {segment === "note" && noteSub === "summary" && showFindReplace && findQuery.trim()
                    ? renderHighlightedText(summaryOverview, findQuery, findMatchIndex)
                    : summaryOverview}
                </p>
              </section>

              <section className="min-w-0 space-y-2 rounded-2xl border border-stone-200/90 bg-white p-3 shadow-sm shadow-stone-900/[0.04] sm:space-y-2.5 sm:p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[15px] font-semibold text-zinc-900">Mind map</h3>
                  <button type="button" className="rounded-lg p-1.5 text-zinc-400 hover:bg-stone-100" aria-label="Expand">
                    <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
                  </button>
                </div>
                <p className="min-w-0 break-words text-[15px] leading-[1.65] text-zinc-500">Thanks for using Mindar—enjoy exploring.</p>
                <div className="-mx-1 overflow-x-auto pb-0.5 pt-0.5">
                  <div className="flex min-w-max items-stretch gap-1.5 px-1 sm:gap-2">
                    <span className="shrink-0 self-center rounded-xl bg-stone-100 px-2.5 py-2 text-[11px] font-semibold leading-snug text-mind sm:px-3 sm:py-2.5 sm:text-[12px]">
                      How to use Mindar?
                    </span>
                    {[
                      { label: "Recording", bg: "bg-stone-100 text-mind" },
                      { label: "Multimodal input", bg: "bg-stone-100 text-mind" },
                      { label: "Files UI", bg: "bg-stone-100 text-mind" },
                      { label: "Ask Mindar", bg: "bg-stone-100 text-mind" },
                      { label: "Export & share", bg: "bg-stone-100 text-mind" },
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

              {showSaveToLibraryPrompt ? (
                <NoteSaveToLibraryBar
                  removeFromMemos={removeFromMemosOnSave}
                  onRemoveFromMemosChange={setRemoveFromMemosOnSave}
                  onChooseLibrary={openMoveToLibrary}
                  onDismiss={() => setSavePromptDismissed(true)}
                />
              ) : null}

              <div className="flex min-w-0 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setSummaryFeedback((v) => (v === "up" ? null : "up"))}
                  className={cn(
                    "flex min-w-0 flex-1 basis-0 items-center justify-center gap-1.5 rounded-xl border-2 border-stone-200 bg-white px-2 py-2.5 text-[13px] font-medium text-zinc-700 transition-colors sm:gap-2 sm:py-3 sm:text-[14px]",
                    summaryFeedback === "up" && "border-zinc-400 bg-stone-50 text-mind"
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
                    summaryFeedback === "down" && "border-stone-400 bg-stone-100 text-zinc-800"
                  )}
                >
                  <ThumbsDown className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={1.85} aria-hidden />
                  <span className="whitespace-nowrap">Not helpful</span>
                </button>
              </div>

              <section className="min-w-0 space-y-2 sm:space-y-2.5">
                <h3 className="flex items-center gap-1.5 text-[15px] font-semibold text-zinc-900 sm:gap-2">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-mind sm:h-4 sm:w-4" strokeWidth={2} aria-hidden />
                  Mindar insights
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
                      <span className="break-words text-[15px] font-medium leading-snug text-zinc-900">{card.title}</span>
                      <span className="mt-1 line-clamp-2 break-words text-[15px] leading-[1.65] text-zinc-600 sm:mt-1.5">{card.desc}</span>
                    </button>
                  ))}
                </div>
              </section>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom bar */}
      {needsManualGenerate ? (
        showGenerationEmpty ? (
          <>
            <div className="pointer-events-none absolute inset-0 z-[44] bg-black/25" aria-hidden />
            <NoteGenerationSheet
              mode={generationMode}
              onModeChange={setGenerationMode}
              templateLabel={selectedTemplate?.name}
              onPickTemplate={openCustomTemplatePicker}
              autoLabelSpeakers={autoLabelSpeakers}
              onAutoLabelSpeakersChange={setAutoLabelSpeakers}
              audioLanguage={audioLanguage}
              onPickAudioLanguage={cycleAudioLanguage}
              aiModel={aiModel}
              onPickAiModel={cycleAiModel}
              onGenerate={handleStartGeneration}
              generateDisabled={generationMode === "custom" && !selectedTemplate}
            />
          </>
        ) : (
          <div className="h-2 shrink-0 bg-white" aria-hidden />
        )
      ) : showFindReplace ? (
        <NoteFindReplaceBar
          findQuery={findQuery}
          onFindQueryChange={setFindQuery}
          replaceQuery={replaceQuery}
          onReplaceQueryChange={setReplaceQuery}
          matchIndex={findMatchIndex}
          matchCount={findMatchStarts.length}
          onPrevMatch={() =>
            setFindMatchIndex((i) =>
              findMatchStarts.length === 0 ? 0 : (i - 1 + findMatchStarts.length) % findMatchStarts.length
            )
          }
          onNextMatch={() =>
            setFindMatchIndex((i) =>
              findMatchStarts.length === 0 ? 0 : (i + 1) % findMatchStarts.length
            )
          }
          onReplace={handleReplaceCurrentMatch}
          onClose={() => setShowFindReplace(false)}
        />
      ) : (
      <div className="shrink-0 border-t border-stone-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="relative p-3 pt-1">
          <span className="absolute left-6 top-1 z-10 -translate-y-1/2 rounded border border-stone-200/90 bg-stone-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800">
            Beta
          </span>
          <div className="rounded-[22px] bg-gradient-to-r from-violet-400/90 via-fuchsia-300/80 to-teal-400/90 p-[1.5px]">
            <div className="overflow-hidden rounded-[20.5px] bg-white dark:bg-zinc-950">
              <MindChatComposer
                variant="thread"
                className="max-w-none !rounded-none !border-0"
                value=""
                onChange={() => {}}
                onSubmit={() => openNoteChat()}
                readOnly
                onActivate={() => openNoteChat()}
                placeholder="Ask about this recording"
                onVoiceToggle={() => openNoteChat()}
                onUploadClick={() => openNoteChat()}
                ariaLabel="Ask Mindar about this recording"
              />
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Template picker (fullscreen) */}
      {showTemplatePage && (
        <div className="absolute inset-0 z-50 flex flex-col bg-white dark:bg-zinc-950 animate-in slide-in-from-right duration-200 dark:bg-zinc-950">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-stone-100 bg-white px-4 py-3">
            <button
              type="button"
              onClick={() => {
                setShowCreateTemplateSheet(false)
                setShowTemplateConfirm(false)
                setShowTemplatePage(false)
              }}
              className="-ml-2 rounded-full p-2 hover:bg-stone-100"
            >
              <ChevronLeft className="h-6 w-6 text-zinc-700" />
            </button>
            <h1 className="text-lg font-semibold text-zinc-900">Choose template</h1>
            <div className="w-10" />
          </div>

          {/* Tabs */}
          <div className="border-b border-stone-100 bg-white px-5 py-3">
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
                    "py-1 text-[15px] font-medium transition-colors",
                    templateTab === tab.id
                      ? "font-semibold text-zinc-900"
                      : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body — hide scrollbar so card grid width matches across tabs */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
            {/* Mine */}
            {templateTab === "mine" && (
              <div className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-900">Recently used</h2>
                  <ChevronRight className="h-5 w-5 text-zinc-400" />
                </div>
                <div className={cn("mb-8", TEMPLATE_GRID_CLASS)}>
                  {[
                    {
                      id: "smart-summary",
                      name: "Smart summary",
                      desc: "Adaptive summaries across contexts",
                      glyph: "sparkles" as const,
                      palette: "violet" as const,
                      badge: "Last used",
                      author: "Plaud",
                    },
                    {
                      id: "meeting-expert-recent",
                      name: "Meeting recap pro",
                      desc: "Structured minutes with decisions and todos",
                      glyph: "layout-grid" as const,
                      palette: "orange" as const,
                      author: "massif",
                      count: 0,
                    },
                  ].map((t) => (
                    <TemplatePickerCard
                      key={t.id}
                      name={t.name}
                      desc={t.desc}
                      glyph={t.glyph}
                      palette={t.palette}
                      badge={t.badge}
                      author={t.author}
                      count={t.count}
                      selected={selectedTemplate?.id === t.id}
                      onSelect={() =>
                        setSelectedTemplate({ id: t.id, name: t.name, desc: t.desc })
                      }
                    />
                  ))}
                </div>

                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-900">My templates</h2>
                  <ChevronRight className="h-5 w-5 text-zinc-400" />
                </div>
                <div className={cn("mb-6", TEMPLATE_GRID_CLASS)}>
                  {customTemplates.map((t) => (
                    <TemplatePickerCard
                      key={t.id}
                      name={t.name}
                      desc={t.desc}
                      glyph="pencil"
                      palette="mind"
                      author="Plaud"
                      selected={selectedTemplate?.id === t.id}
                      onSelect={() => setSelectedTemplate({ id: t.id, name: t.name, desc: t.desc })}
                    />
                  ))}
                  <TemplateCreateCard onClick={() => setShowCreateTemplateSheet(true)} />
                </div>

                <div className="mb-6 overflow-hidden rounded-xl border border-stone-200 bg-white">
                  <button
                    type="button"
                    onClick={() =>
                      setTemplateLanguage((v) => (v === "Auto" ? "English" : v === "English" ? "Spanish" : "Auto"))
                    }
                    className="flex w-full items-center justify-between border-b border-stone-100 px-4 py-3.5 text-left"
                  >
                    <span className="flex items-center gap-2 text-[15px] text-zinc-900">
                      <Languages className="h-5 w-5 text-zinc-400" />
                      Language
                    </span>
                    <span className="flex items-center gap-1 text-[15px] text-zinc-500">
                      {templateLanguage}
                      <ChevronRight className="h-4 w-4 text-zinc-300" />
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Recommend */}
            {templateTab === "recommend" && (
              <div className="p-5">
                {/* Popular */}
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-900">Popular</h2>
                  <ChevronRight className="h-5 w-5 text-zinc-400" />
                </div>
                <div className={cn("mb-8", TEMPLATE_GRID_CLASS)}>
                  {[
                    {
                      id: "meeting-expert",
                      name: "Meeting recap pro",
                      desc: "Structured minutes with decisions and todos",
                      glyph: "layout-grid" as const,
                      palette: "orange" as const,
                      author: "massif",
                      count: 0,
                    },
                    {
                      id: "verbatim",
                      name: "Verbatim",
                      desc: "Full verbatim transcript",
                      glyph: "calendar" as const,
                      palette: "green" as const,
                      author: "Chao Ma",
                      count: 0,
                    },
                  ].map((t) => (
                    <TemplatePickerCard
                      key={t.id}
                      name={t.name}
                      desc={t.desc}
                      glyph={t.glyph}
                      palette={t.palette}
                      author={t.author}
                      count={t.count}
                      selected={selectedTemplate?.id === t.id}
                      onSelect={() => setSelectedTemplate({ id: t.id, name: t.name, desc: t.desc })}
                    />
                  ))}
                </div>

                {/* Inspiration */}
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-900">Inspiration</h2>
                  <ChevronRight className="h-5 w-5 text-zinc-400" />
                </div>
                <div className={TEMPLATE_GRID_CLASS}>
                  {[
                    {
                      id: "meeting-points",
                      name: "Meeting highlights",
                      desc: "Key takeaways for review and decisions",
                      glyph: "file-text" as const,
                      palette: "purple" as const,
                      author: "Plaud",
                    },
                    {
                      id: "meeting-minutes",
                      name: "Meeting minutes",
                      desc: "Full notes with actions and decisions",
                      glyph: "quote-99" as const,
                      palette: "blue" as const,
                      author: "Plaud",
                    },
                  ].map((t) => (
                    <TemplatePickerCard
                      key={t.id}
                      name={t.name}
                      desc={t.desc}
                      glyph={t.glyph}
                      palette={t.palette}
                      author={t.author}
                      selected={selectedTemplate?.id === t.id}
                      onSelect={() => setSelectedTemplate({ id: t.id, name: t.name, desc: t.desc })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Explore */}
            {templateTab === "explore" && (
              <div className="p-5">
                {/* General */}
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-900">General</h2>
                  <ChevronRight className="h-5 w-5 text-zinc-400" />
                </div>
                <div className={cn("mb-8", TEMPLATE_GRID_CLASS)}>
                  {[
                    {
                      id: "smart-summary-2",
                      name: "Smart summary",
                      desc: "Adaptive summaries across contexts",
                      glyph: "sparkles" as const,
                      palette: "violet" as const,
                      author: "Plaud",
                    },
                    {
                      id: "reasoning",
                      name: "Reasoning recap",
                      desc: "Structured recap of the essentials",
                      glyph: "share-network" as const,
                      palette: "violet" as const,
                      author: "Plaud",
                    },
                  ].map((t) => (
                    <TemplatePickerCard
                      key={t.id}
                      name={t.name}
                      desc={t.desc}
                      glyph={t.glyph}
                      palette={t.palette}
                      author={t.author}
                      selected={selectedTemplate?.id === t.id}
                      onSelect={() => setSelectedTemplate({ id: t.id, name: t.name, desc: t.desc })}
                    />
                  ))}
                </div>

                {/* Meetings */}
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-900">Meetings</h2>
                  <ChevronRight className="w-5 h-5 text-zinc-400" />
                </div>
                <div className={TEMPLATE_GRID_CLASS}>
                  {[
                    {
                      id: "consultation",
                      name: "Consultation Q&A",
                      desc: "Capture Q&A and actions from consult calls",
                      glyph: "file-text" as const,
                      palette: "amber" as const,
                      author: "Plaud",
                    },
                    {
                      id: "discussion",
                      name: "Discussion digest",
                      desc: "Discussion summary with clear next steps",
                      glyph: "users" as const,
                      palette: "amber" as const,
                      author: "Plaud",
                    },
                  ].map((t) => (
                    <TemplatePickerCard
                      key={t.id}
                      name={t.name}
                      desc={t.desc}
                      glyph={t.glyph}
                      palette={t.palette}
                      author={t.author}
                      selected={selectedTemplate?.id === t.id}
                      onSelect={() => setSelectedTemplate({ id: t.id, name: t.name, desc: t.desc })}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-stone-100 bg-white p-5">
            {templateTab === "mine" && (
              <p className="mb-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-zinc-500">
                <Languages className="h-3.5 w-3.5 shrink-0 opacity-70" />
                Translated. View original
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                if (!selectedTemplate) {
                  toast.error("Choose a template")
                  return
                }
                setGenerationMode("custom")
                setShowCreateTemplateSheet(false)
                setShowTemplateConfirm(false)
                setShowTemplatePage(false)
                openAssignFolderPicker("generate")
              }}
              disabled={!selectedTemplate}
              className={cn(
                "w-full rounded-xl py-4 text-base font-medium transition-colors",
                selectedTemplate
                  ? cn("text-white", mx.brandCta)
                  : "bg-stone-200 text-zinc-400"
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
                <div className="mb-3 flex items-center justify-between border-b border-stone-100 pb-3">
                  <span className="text-base font-semibold text-zinc-900">Create template</span>
                  <button
                    type="button"
                    onClick={() => setShowCreateTemplateSheet(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-100"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5 text-zinc-500" />
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
                  className="flex w-full items-center gap-3 border-b border-stone-100 py-4 text-left"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-600 to-zinc-700 text-white shadow-sm">
                    <ImageIcon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="bg-gradient-to-r from-mind to-mind bg-clip-text text-[16px] font-semibold text-transparent">
                      Photo to template
                    </div>
                    <p className="mt-0.5 text-[13px] leading-snug text-zinc-500">
                      Take or upload a photo; AI builds a template for you
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300" />
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
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white">
                    <Pencil className="h-5 w-5 text-zinc-700" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[16px] font-semibold text-zinc-900">Write template prompt</div>
                    <p className="mt-0.5 text-[13px] leading-snug text-zinc-500">Define your own template in your words</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300" />
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
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-100"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5 text-zinc-500" />
                  </button>
                </div>
                <label className="mb-1.5 block text-[15px] font-semibold text-zinc-900">Template name</label>
                <input
                  value={templateDraftName}
                  onChange={(e) => setTemplateDraftName(e.target.value)}
                  placeholder="Enter a template name"
                  className="mb-4 w-full rounded-xl border border-stone-200 px-3 py-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-100"
                />
                <label className="mb-1.5 block text-[15px] font-semibold text-zinc-900">Prompt</label>
                <div className="relative mb-5">
                  <textarea
                    value={templateDraftPrompt}
                    onChange={(e) => setTemplateDraftPrompt(e.target.value)}
                    placeholder="How should recordings be summarized?"
                    rows={5}
                    className="w-full resize-y rounded-xl border border-stone-200 px-3 py-3 pr-8 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-100"
                  />
                  <span
                    className="pointer-events-none absolute bottom-2 right-2 text-zinc-300"
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
                    title={note?.title || "Mindar note"}
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

      <NoteShareLibrarySheet
        open={showNoteShareSheet}
        onClose={() => setShowNoteShareSheet(false)}
        noteTitle={note?.title ?? "Untitled note"}
        notePreview={summaryOverview}
        noteId={note?.id}
        presentation={noteSharePresentation}
        removeFromMemos={removeFromMemosOnSave}
        onRemoveFromMemosChange={setRemoveFromMemosOnSave}
        onSaveToLibrary={handleMoveNoteToLibrary}
      />

      <NoteRecordingActionsSheet
        open={showRecordingActionsSheet}
        onClose={() => setShowRecordingActionsSheet(false)}
        onMoveToFolder={() => openAssignFolderPicker("assign")}
        onShareLink={() => {
          setShareLinkStep("options")
          setShowShareLinkModal(true)
        }}
        onCopyLink={() => {
          const shareUrl = `https://mind.app/s/n/${note?.id ?? 0}`
          void navigator.clipboard?.writeText(shareUrl).then(
            () => toast.success("Link copied"),
            () => toast.message("Copy link", { description: shareUrl })
          )
        }}
        onExportLongImage={() =>
          toast.message("Long image", { description: "Generating shareable image (demo)." })
        }
        onExportPdf={() => toast.message("Export PDF", { description: "Preparing PDF export (demo)." })}
        onFindReplace={() => {
          setSegment("source")
          setShowFindReplace(true)
        }}
        onRetranscribe={() => {
          toast.message("Retranscribing", {
            description: "Queued a fresh pass over the audio (demo).",
          })
        }}
        onNameSpeaker={() => {
          setAutoLabelSpeakers(true)
          toast.message("Name speakers", {
            description: "Turn on speaker labels in the next generate pass (demo).",
          })
        }}
        onMoveToTrash={handleMoveRecordingToTrash}
      />

      <NoteAiChatOverlay
        open={showAgentChat}
        variant="recording"
        onClose={() => {
          setShowAgentChat(false)
          setChatInitialPrompt(undefined)
        }}
        context={
          showAgentChat && note
            ? buildNoteChatLaunchContext(note, chatInitialPrompt)
            : null
        }
        requireAuthThen={requireAuthThen}
        onNavigateToKnowledge={onNavigateToKnowledge}
      />

      <NoteFolderPickerSheet
        open={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        folders={folders}
        onSelectFolder={completeFolderSelection}
        onCreateFolder={() => {
          setCreateFolderFromPicker(true)
          setShowCreateFolderSheet(true)
        }}
        title={folderPickerMode === "generate" ? "Choose a folder" : "Save to folder"}
        subtitle={
          folderPickerMode === "generate" && selectedTemplate
            ? `Then generate with “${selectedTemplate.name}”`
            : undefined
        }
      />


      {showCreateFolderSheet && note != null && onAssignNoteToNewFolder && (
        <CreateFolderSheet
          open={showCreateFolderSheet}
          onClose={() => {
            setShowCreateFolderSheet(false)
            setCreateFolderFromPicker(false)
          }}
          onCreate={(payload) => {
            const id = `folder-${Date.now()}`
            onAssignNoteToNewFolder(note.id, {
              id,
              name: payload.name,
              color: payload.color,
              iconKey: payload.iconKey,
            })
            setShowCreateFolderSheet(false)
            if (createFolderFromPicker) {
              completeFolderSelection(id)
              setCreateFolderFromPicker(false)
            } else {
              toast.success("Folder created")
            }
          }}
        />
      )}

    </div>
  )
}
