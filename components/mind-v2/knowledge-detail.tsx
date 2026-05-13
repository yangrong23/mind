"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { SocialShareRow } from "@/components/mind-v2/social-share-row"
import { ContentFactoryModals, type FactoryGenerationSettings, type FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import {
  StudioFactoryJobsInline,
  factoryKindShortLabel,
  factorySettingsLeadMeta,
  mockTitleForFactoryKind,
  type FactoryJob,
} from "@/components/mind-v2/content-factory-progress-panel"
import { TextNoteEditor } from "@/components/mind-v2/text-note-editor"
import { knowledgeBaseIconForTitle } from "@/components/mind-v2/knowledge-base-icon"
import {
  ChevronLeft,
  MoreHorizontal,
  Plus,
  Camera,
  Image,
  Mic,
  FolderOpen,
  Link2,
  FileText,
  FolderPlus,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Youtube,
  Library,
  Trash2,
  ArrowUp,
  GitBranch,
  MessageCircle,
} from "lucide-react"
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"

type ShareTarget =
  | { scope: "library" }
  | { scope: "item"; title: string }

interface KnowledgeDetailProps {
  onBack: () => void
  onAgentChat?: (context: { kbName: string; contentTitle?: string }) => void
  knowledgeBase?: {
    name: string
    color: string
    description?: string
    coverImage?: string
  }
  initialView?: "content" | "graph" | "factory"
  /** When set (e.g. from Agent → Studio), open this factory modal once on mount */
  initialFactoryModal?: FactoryModalKind | null
}

const mockContents = [
  {
    id: 1,
    title: "Vector store architecture",
    excerpt:
      "Design notes on chunking, embeddings, and hybrid retrieval—when to use dense vs sparse, and how to keep citations stable across re-indexing.",
    source: "Note",
    author: "Tech weekly",
    date: "5/1",
    image: "https://picsum.photos/seed/1/80/80",
  },
  {
    id: 2,
    title: "How NotebookLM shifts AI workflows",
    excerpt:
      "Comparison of library-first Q&A vs ad-hoc chat: grounding, source cards, and why upload friction changes who adopts the tool.",
    source: "Web",
    author: "AI PM",
    date: "4/28",
    image: "https://picsum.photos/seed/2/80/80",
  },
  {
    id: 3,
    title: "OpenWiki: open knowledge tooling",
    excerpt:
      "Recording summary: community workflows for curating wikis, moderation, and linking out to primary literature without breaking context.",
    source: "Recording",
    author: "OSS",
    date: "4/25",
    image: "https://picsum.photos/seed/3/80/80",
  },
  {
    id: 4,
    title: "PaperOrchestra: multi-agent papers",
    excerpt:
      "PDF ingest pipeline: section detection, figure extraction, and agent roles for summarization vs critique in long documents.",
    source: "File",
    author: "X. B.",
    date: "5/1",
    image: "https://picsum.photos/seed/4/80/80",
  },
  {
    id: 5,
    title: "gpt-image-2 and slide decks",
    excerpt:
      "Market note on image models for slides—latency, rights, and when generated visuals help or hurt narrative clarity in decks.",
    source: "Web",
    author: "36Kr",
    date: "4/30",
    image: "https://picsum.photos/seed/5/80/80",
  },
]

type LibraryDoc = (typeof mockContents)[number]

const DELETE_STRIP_PX = 88
const DELETE_REVEAL_THRESHOLD = 40

function SwipeableLibraryDocRow({
  content,
  onOpen,
  onDelete,
}: {
  content: LibraryDoc
  onOpen: () => void
  onDelete: () => void
}) {
  const startX = useRef(0)
  const startDx = useRef(0)
  const [dx, setDx] = useState(0)
  const dragging = useRef(false)

  const snapOpen = () => setDx(-DELETE_STRIP_PX)
  const snapClosed = () => setDx(0)

  const onStart = (clientX: number) => {
    startX.current = clientX
    startDx.current = dx
    dragging.current = true
  }
  const onMove = (clientX: number) => {
    if (!dragging.current) return
    const d = clientX - startX.current
    const next = startDx.current + d
    setDx(Math.max(-DELETE_STRIP_PX, Math.min(120, next)))
  }
  const onEnd = () => {
    dragging.current = false
    if (dx > 48) {
      snapClosed()
      return
    }
    if (dx < -DELETE_REVEAL_THRESHOLD) {
      snapOpen()
      return
    }
    snapClosed()
  }

  const deleteRow = () => {
    onDelete()
    snapClosed()
  }

  const revealed = dx <= -DELETE_REVEAL_THRESHOLD / 2

  return (
    <div className="relative overflow-hidden border-b border-stone-100 last:border-b-0">
      <div
        className="absolute inset-y-0 left-0 flex w-24 items-center justify-center bg-zinc-600 text-white"
        style={{ opacity: dx > 0 ? Math.min(1, dx / 72) : 0 }}
      >
        <Library className="h-6 w-6" strokeWidth={1.75} aria-hidden />
      </div>

      <button
        type="button"
        style={{ width: DELETE_STRIP_PX }}
        className={cn(
          "absolute inset-y-0 right-0 z-20 flex flex-col items-center justify-center gap-1 bg-red-600 text-white transition-opacity",
          revealed ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-label={`Delete ${content.title}`}
        onClick={(e) => {
          e.stopPropagation()
          deleteRow()
        }}
      >
        <Trash2 className="h-6 w-6 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="text-[11px] font-semibold">Delete</span>
      </button>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (revealed) snapClosed()
            else onOpen()
          }
        }}
        onClick={() => {
          if (revealed) {
            snapClosed()
            return
          }
          if (Math.abs(dx) < 8) onOpen()
        }}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => dragging.current && onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={() => dragging.current && onEnd()}
        className="relative z-10 flex w-full cursor-pointer select-none items-start gap-3 bg-white p-4 text-left hover:bg-stone-50/80"
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging.current ? "none" : "transform 0.2s ease-out",
        }}
      >
        <img
          src={content.image}
          alt=""
          className="h-16 w-16 shrink-0 rounded-lg bg-stone-100 object-cover"
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="text-[15px] font-medium leading-snug text-zinc-900">{content.title}</h3>
          <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-zinc-600">{content.excerpt}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 text-[11px] text-zinc-400">
            <span className="text-zinc-600">{content.source}</span>
            <span>|</span>
            <span>{content.author}</span>
            <span>|</span>
            <span>{content.date}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function bodyForContent(id: number, title: string, excerpt: string): string[] {
  const common = [
    excerpt,
    "This entry is part of your notebook corpus. In production, the full text, attachments, and revision history would load here.",
    `Sections below expand on “${title}” with structured headings, pull quotes, and links back to the original capture or import.`,
  ]
  if (id === 1) {
    return [
      ...common,
      "Operational guidance: start with a single collection per project, version your embedding model explicitly, and log chunk boundaries so you can diff retrieval quality after changes.",
    ]
  }
  if (id === 3) {
    return [
      ...common,
      "From the recording: emphasize lightweight contribution flows—if publishing a note takes more than one step, most updates never leave private drafts.",
    ]
  }
  return common
}

/** Rolling summary from sources (mock copy, reads like editorial notes). */
function notebookSummaryForLibrary(name: string, sourceCount: number): string {
  const unit = sourceCount === 1 ? "file" : "files"
  return `Across the ${sourceCount} ${unit} in “${name}”, we pull a single thread you can read in one pass: what each source contributes, where they reinforce each other, and where they diverge. Skim this first, then jump into chat when you want detail—replies stay tied to the passages they came from.`
}

export function KnowledgeDetail({
  onBack,
  onAgentChat,
  knowledgeBase,
  initialView = "content",
  initialFactoryModal,
}: KnowledgeDetailProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [hubRichNoteOpen, setHubRichNoteOpen] = useState(false)
  const [showNotebookAsk, setShowNotebookAsk] = useState(false)
  const [notebookAskDraft, setNotebookAskDraft] = useState("")
  const [activeView, setActiveView] = useState<"content" | "graph" | "factory">(initialView)
  const [showContentDetail, setShowContentDetail] = useState<LibraryDoc | null>(null)
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null)
  const [factoryModal, setFactoryModal] = useState<FactoryModalKind | null>(null)

  useEffect(() => {
    if (initialFactoryModal) {
      setFactoryModal(initialFactoryModal)
    }
  }, [initialFactoryModal])

  useEffect(() => {
    if (!showNotebookAsk) setNotebookAskDraft("")
  }, [showNotebookAsk])
  const [factoryUserJobs, setFactoryUserJobs] = useState<FactoryJob[]>([])
  const [factoryQuotaBanner, setFactoryQuotaBanner] = useState(false)
  const [factoryToastFailedJobId, setFactoryToastFailedJobId] = useState<string | null>(null)
  const [archivedFactoryJobIds, setArchivedFactoryJobIds] = useState<string[]>([])
  const [contents, setContents] = useState<LibraryDoc[]>(() => mockContents.map((c) => ({ ...c })))
  const sourceCount = contents.length
  const kbDisplayName = knowledgeBase?.name || "Notebook"
  const notebookSummaryBody = notebookSummaryForLibrary(kbDisplayName, sourceCount)

  const kbOverviewNarrative = useMemo(() => {
    const srcWord = sourceCount === 1 ? "source" : "sources"
    const desc = knowledgeBase?.description?.trim()
    if (desc) {
      return `${desc} “${kbDisplayName}” is built from ${sourceCount} ${srcWord} right now. Hub is for reading and search, Graph for seeing how ideas connect, and Studio when you want something you can hand off—a recap, slides, or audio—without starting from a blank page.`
    }
    return `“${kbDisplayName}” gathers ${sourceCount} ${srcWord} you can trust as one place to think from. Browse in Hub, follow threads in Graph, then use Studio when it’s time to turn that depth into something finished.`
  }, [knowledgeBase?.description, kbDisplayName, sourceCount])

  function scheduleFactoryJobFinish(
    jobId: string,
    kind: FactoryModalKind,
    settings?: FactoryGenerationSettings
  ) {
    window.setTimeout(() => {
      const fail = Math.random() < 0.14
      const lead = factorySettingsLeadMeta(kind, settings)
      const sources = `${2 + Math.floor(Math.random() * 4)} sources`
      const metaTail = [lead, sources, "just now"].filter(Boolean).join(" · ")
      setFactoryUserJobs((prev) =>
        prev.map((j) => {
          if (j.id !== jobId || j.status !== "generating") return j
          if (fail) return { ...j, status: "failed" as const }
          return {
            ...j,
            status: "complete" as const,
            title: mockTitleForFactoryKind(kind),
            meta: metaTail,
            settings,
          }
        })
      )
      if (fail) {
        setFactoryToastFailedJobId(jobId)
      }
    }, 2800)
  }

  function handleFactoryGenerateSubmit(kind: FactoryModalKind, settings?: FactoryGenerationSettings) {
    setFactoryToastFailedJobId(null)
    const id = `u-${Date.now()}`
    setFactoryUserJobs((prev) => [...prev, { id, kind, status: "generating", settings }])
    setActiveView("factory")
    if (kind === "slides" && Math.random() < 0.38) {
      setFactoryQuotaBanner(true)
    }
    scheduleFactoryJobFinish(id, kind, settings)
  }

  function handleFactoryRetry(jobId: string) {
    setFactoryToastFailedJobId(null)
    setArchivedFactoryJobIds((prev) => prev.filter((id) => id !== jobId))
    let kind: FactoryModalKind = "report"
    let settings: FactoryGenerationSettings | undefined
    setFactoryUserJobs((prev) => {
      const row = prev.find((x) => x.id === jobId)
      if (row) {
        kind = row.kind
        settings = row.settings
      }
      return prev.map((x) =>
        x.id === jobId ? { ...x, status: "generating", title: undefined, meta: undefined } : x
      )
    })
    window.setTimeout(() => scheduleFactoryJobFinish(jobId, kind, settings), 0)
  }

  function handleArchiveFactoryJobToHub(job: FactoryJob) {
    if (archivedFactoryJobIds.includes(job.id)) return
    const title = (job.title && job.title.trim()) || mockTitleForFactoryKind(job.kind)
    const kindLabel = factoryKindShortLabel(job.kind)
    const nextId = contents.reduce((max, c) => Math.max(max, c.id), 0) + 1
    const now = new Date()
    const dateStr = `${now.getMonth() + 1}/${now.getDate()}`
    const doc: LibraryDoc = {
      id: nextId,
      title,
      excerpt: `Studio ${kindLabel} output archived from your run—open it anytime from Hub.`,
      source: "Studio",
      author: kbDisplayName,
      date: dateStr,
      image: `https://picsum.photos/seed/factory-${encodeURIComponent(job.id)}/80/80`,
    }
    setContents((prev) => [doc, ...prev])
    setArchivedFactoryJobIds((prev) => [...prev, job.id])
    setActiveView("content")
    toast.success("Archived to Hub", {
      description: `“${title}” is now in “${kbDisplayName}”.`,
    })
  }

  function submitNotebookAsk() {
    const q = notebookAskDraft.trim()
    if (!q) {
      toast.error("Add a question first")
      return
    }
    toast.success("Question sent", { description: q.length > 140 ? `${q.slice(0, 140)}…` : q })
    setNotebookAskDraft("")
  }

  const KbHeaderIcon = knowledgeBaseIconForTitle(
    knowledgeBase?.name ?? "",
    knowledgeBase?.description
  )

  const addMenuItems = [
    { icon: Camera, label: "Camera" },
    { icon: Image, label: "Image" },
    { icon: Mic, label: "Audio" },
    { icon: FolderOpen, label: "Local file" },
    { icon: Link2, label: "Link" },
    { icon: FileText, label: "Note", openRichNote: true as const },
    { icon: Youtube, label: "YouTube" },
    { icon: FolderPlus, label: "New folder" },
  ] as const

  const shareSheet = shareTarget && (
    <div className="absolute inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={() => setShareTarget(null)} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-200">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="px-5 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {shareTarget.scope === "library" ? "Share library" : "Share item"}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {shareTarget.scope === "library"
              ? knowledgeBase?.name || "Library"
              : shareTarget.title}
          </p>
        </div>
        <div className="px-5 pb-4">
          <SocialShareRow
            title={
              shareTarget.scope === "library"
                ? knowledgeBase?.name || "Library"
                : shareTarget.title
            }
            body={
              shareTarget.scope === "library"
                ? `Knowledge library: ${knowledgeBase?.name || "Library"}`
                : `From ${knowledgeBase?.name || "library"}: ${shareTarget.title}`
            }
            onAfterAction={() => setShareTarget(null)}
          />
        </div>
        <div className="px-5 pb-6">
          <button
            type="button"
            onClick={() => setShareTarget(null)}
            className="w-full py-3 bg-gray-100 rounded-xl text-gray-700 font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

  if (showNotebookAsk) {
    return (
      <div className="relative flex h-full flex-col bg-gradient-to-b from-sky-50/40 via-[#fafbfc] to-white">
        <div className="flex shrink-0 items-center justify-between border-b border-sky-100/50 bg-white/80 px-3 py-2.5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <button
            type="button"
            onClick={() => setShowNotebookAsk(false)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-stone-200/60"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6 text-zinc-800" />
          </button>
          <h1 className="min-w-0 flex-1 px-2 text-center text-[15px] font-semibold tracking-tight text-zinc-900 truncate">
            {kbDisplayName}
          </h1>
          <button
            type="button"
            onClick={() => toast.message("More", { description: "Library actions (demo)." })}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-stone-200/60"
            aria-label="More"
          >
            <MoreHorizontal className="h-5 w-5 text-zinc-600" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-sky-700/90">Rolling summary</p>
          <h2 className="mt-1.5 text-[19px] font-semibold leading-snug tracking-tight text-zinc-900">{kbDisplayName}</h2>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-stone-100/90 px-2.5 py-1 text-[12px] font-medium text-zinc-600">
            <span className="tabular-nums">{sourceCount}</span>
            <span className="text-zinc-400">·</span>
            <span>from your sources</span>
          </p>

          <p className="mt-6 text-[15px] leading-[1.72] text-zinc-800">{notebookSummaryBody}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => toast.success("Copied")}
                className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-stone-200/70 hover:text-zinc-800"
                aria-label="Copy summary"
              >
                <Copy className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => toast.success("Thanks", { description: "Marked as helpful." })}
                className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-stone-200/70 hover:text-zinc-800"
                aria-label="Good summary"
              >
                <ThumbsUp className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => toast.message("Noted", { description: "We will improve summaries (demo)." })}
                className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-stone-200/70 hover:text-zinc-800"
                aria-label="Bad summary"
              >
                <ThumbsDown className="h-5 w-5" />
              </button>
              <button
                type="button"
                title="Library chat—retrieve, compare, and cite across your sources"
                aria-label="Open Chat (library-grounded)"
                onClick={() => {
                  setShowNotebookAsk(false)
                  onAgentChat?.({ kbName: kbDisplayName })
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-sky-600 transition-colors hover:bg-sky-100/90 hover:text-sky-800 dark:text-sky-400 dark:hover:bg-sky-950/50 dark:hover:text-sky-200"
              >
                <MessageCircle className="h-5 w-5" strokeWidth={1.85} />
              </button>
            </div>
            <p className="max-w-[14rem] text-[11px] leading-snug text-sky-800/80 dark:text-sky-200/70 sm:max-w-none">
              Open Chat for library-grounded Q&amp;A—it gets stronger as your library grows.
            </p>
          </div>

          <button
            type="button"
            onClick={() => toast.promise(new Promise((r) => setTimeout(r, 800)), {
              loading: "Generating audio overview…",
              success: "Added to queue (demo)",
              error: "Could not generate",
            })}
            className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-full border border-stone-200/90 bg-white py-3 text-[15px] font-medium text-zinc-800 shadow-sm shadow-stone-900/5 transition-colors hover:bg-stone-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-sky-600">
                <path
                  d="M4 12h2l1.5-4 2 8 1.5-6H12l1 3 1-3h2l1.5 5 1.5-5H22"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Audio overview
          </button>
        </div>

        <div className="shrink-0 border-t border-sky-100/60 bg-white/85 px-3 pb-3 pt-2 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/85">
          <div className="flex items-end gap-2">
            <label className="sr-only" htmlFor="notebook-ask-sources">
              Ask sources
            </label>
            <input
              id="notebook-ask-sources"
              type="text"
              value={notebookAskDraft}
              onChange={(e) => setNotebookAskDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  submitNotebookAsk()
                }
              }}
              placeholder={`Ask ${sourceCount} sources…`}
              className="min-h-[44px] min-w-0 flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200/60"
            />
            <button
              type="button"
              onClick={() => toast.message("Sources", { description: `Covers ${sourceCount} items (demo).` })}
              className="flex shrink-0 items-center gap-1 rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-[13px] font-medium text-zinc-700 shadow-sm"
              aria-label="Sources"
            >
              <FileText className="h-4 w-4 text-zinc-500" />
              <span>{sourceCount}</span>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </button>
            <button
              type="button"
              onClick={submitNotebookAsk}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white shadow-md shadow-sky-600/25 transition-colors hover:bg-sky-700"
              aria-label="Send question"
            >
              <ArrowUp className="h-5 w-5" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (hubRichNoteOpen) {
    return (
      <TextNoteEditor variant="hubRich" onBack={() => setHubRichNoteOpen(false)} />
    )
  }

  if (showContentDetail) {
    return (
      <div className="relative flex flex-col h-full bg-white">
        <div className="flex items-center justify-between border-b border-sky-100/80 bg-white px-4 py-3 dark:border-sky-900/40 dark:bg-zinc-950">
          <button
            type="button"
            onClick={() => setShowContentDetail(null)}
            className="-ml-2 rounded-full p-2 hover:bg-sky-50 dark:hover:bg-sky-950/40"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6 text-zinc-700 dark:text-zinc-200" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Chat—answers grounded in this item and your library"
              aria-label="Open Chat for this item"
              onClick={() =>
                onAgentChat?.({
                  kbName: knowledgeBase?.name || "Medrix Mind",
                  contentTitle: showContentDetail.title,
                })
              }
              className={cn(
                "flex items-center gap-1.5 rounded-full border border-sky-200/90 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-900 shadow-sm shadow-sky-900/5 transition-colors",
                "hover:bg-sky-100/90 dark:border-sky-800/60 dark:bg-sky-950/45 dark:text-sky-50 dark:hover:bg-sky-900/55"
              )}
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              Chat
            </button>
            <button
              type="button"
              onClick={() => setShareTarget({ scope: "item", title: showContentDetail.title })}
              className="rounded-full p-2 hover:bg-sky-50 dark:hover:bg-sky-950/40"
              aria-label="Share"
            >
              <MoreHorizontal className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <img 
            src={showContentDetail.image} 
            alt="" 
            className="w-full h-48 rounded-xl object-cover bg-gray-100 mb-4"
          />
          <h1 className="text-xl font-bold text-gray-900 mb-3">{showContentDetail.title}</h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 mb-4">
            <span>{showContentDetail.source}</span>
            <span>·</span>
            <span>{showContentDetail.author}</span>
            <span>·</span>
            <span>{showContentDetail.date}</span>
          </div>
          <div className="space-y-4 text-[15px] leading-[1.7] text-gray-800">
            {bodyForContent(
              showContentDetail.id,
              showContentDetail.title,
              showContentDetail.excerpt
            ).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
        {shareSheet}
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <SmartSearchIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
            
            {showAddMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
                <div className="absolute right-0 top-full z-50 mt-1.5 w-[15rem] overflow-hidden rounded-2xl border border-stone-200/90 bg-white py-1.5 shadow-[0_12px_40px_-4px_rgba(0,0,0,0.12)] animate-in fade-in slide-in-from-top-2 duration-200">
                  {addMenuItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setShowAddMenu(false)
                        if ("openRichNote" in item && item.openRichNote) {
                          setHubRichNoteOpen(true)
                        }
                      }}
                      className="mx-1.5 flex w-[calc(100%-12px)] items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-stone-50 active:bg-stone-100/80"
                    >
                      <span className="text-[15px] text-zinc-800">{item.label}</span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {"openRichNote" in item && item.openRichNote ? (
                          <ChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />
                        ) : null}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100/90 text-stone-500">
                          <item.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShareTarget({ scope: "library" })}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Share library"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-3 min-w-0">
        {knowledgeBase?.coverImage ? (
          <img
            src={knowledgeBase.coverImage}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-black/[0.06] dark:ring-white/10"
          />
        ) : (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
              knowledgeBase?.color || "from-zinc-400 to-stone-600"
            )}
          >
            <KbHeaderIcon className="h-6 w-6 text-white" strokeWidth={1.65} aria-hidden />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-[16px] font-semibold tracking-tight text-zinc-900 truncate">
            {knowledgeBase?.name || "Notebook"}
          </h1>
          <p className="text-[12px] leading-snug text-zinc-500 line-clamp-2 sm:line-clamp-1">
            {knowledgeBase?.description || "Depth you can browse, connect, and turn into finished work"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNotebookAsk(true)}
          className={cn(
            "shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
            mx.knowledgeAskPill
          )}
        >
          <Sparkles className={cn("h-3.5 w-3.5", mx.knowledgeAskSparkle)} strokeWidth={2} />
          Ask
        </button>
      </div>

      <div className="px-4 py-2 bg-white border-b border-stone-100">
        <div className="flex gap-1 p-0.5 bg-stone-100 rounded-lg">
          {[
            { id: "content" as const, label: "Hub" },
            { id: "graph" as const, label: "Graph" },
            { id: "factory" as const, label: "Studio" },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setActiveView(mode.id)}
              className={cn(
                "flex-1 py-1.5 rounded-md text-[12px] font-medium transition-all",
                activeView === mode.id
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500"
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("flex-1 flex flex-col min-h-0", activeView === "content" ? "overflow-hidden" : "overflow-y-auto")}>
        {activeView === "content" && (
          <div className="flex min-h-0 flex-1 flex-col bg-stone-50/80">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="px-4 pb-2 pt-3">
              <div className="mb-4 overflow-hidden rounded-2xl border border-sky-100/60 bg-gradient-to-br from-white via-white to-sky-50/50 p-4 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_8px_24px_-12px_rgba(14,165,233,0.1)] ring-1 ring-sky-100/40 dark:border-zinc-700 dark:from-zinc-900 dark:via-zinc-900 dark:to-sky-950/20 dark:ring-zinc-700/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700/90 dark:text-sky-300/90">Overview</p>
                    <h2 className="mt-1 text-[15px] font-semibold tracking-tight text-zinc-900">How this library fits together</h2>
                  </div>
                  <div className="shrink-0 rounded-full border border-stone-200/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-zinc-600 shadow-sm">
                    {sourceCount} {sourceCount === 1 ? "source" : "sources"}
                  </div>
                </div>
                <p className="mt-3.5 text-[14px] leading-[1.65] text-zinc-700">{kbOverviewNarrative}</p>
              </div>
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                Documents
              </h2>
              <div className="overflow-hidden rounded-xl border border-stone-200/90 bg-white">
                {contents.length === 0 ? (
                  <div className="px-4 py-10 text-center text-[13px] text-zinc-500">No documents yet</div>
                ) : (
                  contents.map((content) => (
                    <SwipeableLibraryDocRow
                      key={content.id}
                      content={content}
                      onOpen={() => setShowContentDetail(content)}
                      onDelete={() => {
                        setContents((prev) => prev.filter((c) => c.id !== content.id))
                        setShowContentDetail((open) => (open?.id === content.id ? null : open))
                      }}
                    />
                  ))
                )}
              </div>
            </div>
            </div>
          </div>
        )}

        {activeView === "graph" && (
          <div className="h-full flex flex-col items-center justify-center px-5 py-8">
            <div className="relative w-64 h-64 mb-6">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-zinc-500 flex items-center justify-center text-white font-medium text-sm shadow-lg">
                Core
              </div>
              {[
                { x: 0, y: -80, label: "Concept A", color: "bg-zinc-400" },
                { x: 70, y: -40, label: "Project B", color: "bg-zinc-600" },
                { x: 70, y: 40, label: "Person C", color: "bg-stone-500" },
                { x: 0, y: 80, label: "Doc D", color: "bg-stone-600" },
                { x: -70, y: 40, label: "Idea E", color: "bg-zinc-500" },
                { x: -70, y: -40, label: "Asset F", color: "bg-stone-400" },
              ].map((node, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute w-14 h-14 rounded-full flex items-center justify-center text-white text-xs shadow-md",
                    node.color
                  )}
                  style={{
                    left: `calc(50% + ${node.x}px - 28px)`,
                    top: `calc(50% + ${node.y}px - 28px)`,
                  }}
                >
                  {node.label}
                </div>
              ))}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                {[
                  { x1: 128, y1: 128, x2: 128, y2: 48 },
                  { x1: 128, y1: 128, x2: 198, y2: 88 },
                  { x1: 128, y1: 128, x2: 198, y2: 168 },
                  { x1: 128, y1: 128, x2: 128, y2: 208 },
                  { x1: 128, y1: 128, x2: 58, y2: 168 },
                  { x1: 128, y1: 128, x2: 58, y2: 88 },
                ].map((line, i) => (
                  <line
                    key={i}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="#E5E7EB"
                    strokeWidth="2"
                  />
                ))}
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Knowledge graph</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Visualize how ideas connect across your library.
            </p>
            <button className="px-6 py-2.5 bg-zinc-500 text-white rounded-xl text-sm font-medium hover:bg-zinc-600">
              Open full graph
            </button>
          </div>
        )}

        {activeView === "factory" && (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-stone-50/80 px-4 pb-10 pt-4">
            <h3 className="mb-3 text-[15px] font-semibold tracking-tight text-zinc-800">Create new content</h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setFactoryModal("report")}
                className="flex w-full items-center justify-between rounded-full py-2 pl-2 pr-3 transition-colors hover:bg-white/70"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      mx.factoryTone.report.well,
                      mx.factoryTone.report.icon
                    )}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                      <path d="M12 18v-6M9 15h6" />
                    </svg>
                  </div>
                  <span className="truncate text-[15px] font-medium text-zinc-800">Report</span>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => setFactoryModal("audio")}
                className="flex w-full items-center justify-between rounded-full py-2 pl-2 pr-3 transition-colors hover:bg-white/70"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      mx.factoryTone.audio.well,
                      mx.factoryTone.audio.icon
                    )}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 10v3a1 1 0 001 1h3l4 4V3L6 7H3a1 1 0 00-1 1z" />
                      <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" />
                    </svg>
                    <Sparkles
                      className={cn("absolute -right-0.5 -top-0.5 h-3 w-3", mx.factoryTone.audio.sparkle)}
                      strokeWidth={2}
                    />
                  </div>
                  <span className="truncate text-[15px] font-medium text-zinc-800">Audio overview</span>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => setFactoryModal("mindmap")}
                className="flex w-full items-center justify-between rounded-full py-2 pl-2 pr-3 transition-colors hover:bg-white/70"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      mx.factoryTone.mindmap.well,
                      mx.factoryTone.mindmap.icon
                    )}
                  >
                    <GitBranch className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <span className="truncate text-[15px] font-medium text-zinc-800">Mind map</span>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => setFactoryModal("flashcards")}
                className="flex w-full items-center justify-between rounded-full py-2 pl-2 pr-3 transition-colors hover:bg-white/70"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      mx.factoryTone.flashcards.well,
                      mx.factoryTone.flashcards.icon
                    )}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="6" width="16" height="12" rx="2" />
                      <path d="M22 10v8a2 2 0 01-2 2H8" />
                      <path d="M8 10l3 3-3 3" />
                    </svg>
                    <Sparkles
                      className={cn("absolute -right-0.5 -top-0.5 h-3 w-3", mx.factoryTone.flashcards.sparkle)}
                      strokeWidth={2}
                    />
                  </div>
                  <span className="truncate text-[15px] font-medium text-zinc-800">Flashcards</span>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => setFactoryModal("quiz")}
                className="flex w-full items-center justify-between rounded-full py-2 pl-2 pr-3 transition-colors hover:bg-white/70"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      mx.factoryTone.quiz.well,
                      mx.factoryTone.quiz.icon
                    )}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="5" width="14" height="14" rx="2" />
                      <path d="M12 16v.01M10 10a2 2 0 1 1 4 0c0 1.5-2 1.5-2 3" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="truncate text-[15px] font-medium text-zinc-800">Quiz</span>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => setFactoryModal("infographic")}
                className="flex w-full items-center justify-between rounded-full py-2 pl-2 pr-3 transition-colors hover:bg-white/70"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      mx.factoryTone.infographic.well,
                      mx.factoryTone.infographic.icon
                    )}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  </div>
                  <span className="truncate text-[15px] font-medium text-zinc-800">Infographic</span>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => setFactoryModal("slides")}
                className="flex w-full items-center justify-between rounded-full py-2 pl-2 pr-3 transition-colors hover:bg-white/70"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      mx.factoryTone.slides.well,
                      mx.factoryTone.slides.icon
                    )}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <span className="truncate text-[15px] font-medium text-zinc-800">Presentation</span>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" />
              </button>
            </div>

            <StudioFactoryJobsInline
              userJobs={factoryUserJobs}
              showQuotaBanner={factoryQuotaBanner}
              onDismissQuotaBanner={() => setFactoryQuotaBanner(false)}
              toastFailedJobId={factoryToastFailedJobId}
              onRetryJob={handleFactoryRetry}
              onArchiveToLibrary={handleArchiveFactoryJobToHub}
              archiveTargetLabel={kbDisplayName}
              archivedJobIds={archivedFactoryJobIds}
            />

            {factoryUserJobs.length === 0 ? (
              <div className="mt-10 flex flex-col items-center text-center">
                <Sparkles className="mb-2 h-7 w-7 text-sky-700/30" strokeWidth={1.5} />
                <p className="max-w-[260px] text-[13px] leading-relaxed text-zinc-500">
                  Choose a format above to generate. Runs and results stack here so you can start another anytime—no
                  extra screen.
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {shareSheet}

      <ContentFactoryModals
        open={factoryModal}
        onClose={() => setFactoryModal(null)}
        libraryName={kbDisplayName}
        onGenerateSubmit={handleFactoryGenerateSubmit}
      />
    </div>
  )
}
