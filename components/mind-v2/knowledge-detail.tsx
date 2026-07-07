"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { SocialShareRow } from "@/components/mind-v2/social-share-row"
import { ContentFactoryModals, type FactoryGenerationSettings, type FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import {
  factoryKindShortLabel,
  factorySettingsLeadMeta,
  mockTitleForFactoryKind,
  type FactoryJob,
} from "@/components/mind-v2/content-factory-progress-panel"
import { TextNoteEditor } from "@/components/mind-v2/text-note-editor"
import { MindChatComposer } from "@/components/mind-v2/mind-chat-composer"
import { LibraryDetailViewNav } from "@/components/mind-v2/library-nav"
import { KbMaterialView } from "@/components/mind-v2/kb-material-view"
import { KbAiView } from "@/components/mind-v2/kb-ai-view"
import { KbStudioTabView } from "@/components/mind-v2/kb-studio-tab-view"
import { PersonalKbUploadBanner } from "@/components/mind-v2/personal-kb-upload-banner"
import type { PublicKbSettings } from "@/lib/public-kb-settings"
import { KbLibraryChatOverlay } from "@/components/mind-v2/kb-library-chat-overlay"
import type { LibraryChatLaunchContext } from "@/lib/library-chat-context"
import { knowledgeBaseIconForTitle } from "@/components/mind-v2/knowledge-base-icon"
import { KNOWLEDGE_UPLOAD_ACCEPT } from "@/components/mind-v2/knowledge-upload-guide"
import {
  KnowledgeAddSourceMenu,
  type KnowledgeAddSourceAction,
} from "@/components/mind-v2/knowledge-add-source-menu"
import { KnowledgeAddSourcesModal } from "@/components/mind-v2/knowledge-add-sources-modal"
import { LibraryCover } from "@/components/mind-v2/library-cover"
import { HubItemThumb } from "@/components/mind-v2/mind-media-art"
import { resolvePublicKbAgentDisplay } from "@/lib/public-kb-agent-display"
import { publicFactoryOutputsForKb, type PublicFactoryOutput } from "@/lib/public-factory-outputs"
import {
  PublicFactoryOutputDetailScreen,
  PublicPublishedFactoryFeed,
} from "@/components/mind-v2/public-factory-output-ui"
import { MOCK_KNOWLEDGE_BASES } from "@/lib/mock-knowledge-bases"
import { hubItemKindFromLabel } from "@/lib/product-media"
import {
  detectLibraryLinkKind,
  promptForLibraryLink,
  sourceLabelForLinkKind,
  titleFromLinkUrl,
  type LibraryLinkKind,
} from "@/lib/knowledge-link-sources"
import type { LibraryCoverVariant } from "@/lib/product-media"
import { libraryCoverVariantForId } from "@/lib/product-media"
import {
  PersonalKbInfoOverlay,
  SubscribedKbInfoOverlay,
  TeamKbInfoOverlay,
} from "@/components/mind-v2/knowledge-base-info-overlays"
import {
  DEFAULT_TEAM_LIBRARY_SETTINGS,
  type KBCategory,
  type TeamLibrarySettings,
} from "@/lib/mock-knowledge-bases"
import {
  ChevronLeft,
  MoreHorizontal,
  FilePlus2,
  Camera,
  Image,
  Mic,
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
  MessageCircle,
  Heart,
  X,
  Send,
  Search,
  User,
  Share2,
  Settings,
  UserMinus,
} from "lucide-react"
import { MindAddButton } from "@/components/mind-v2/mind-add-button"
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"

type ShareTarget =
  | { scope: "library" }
  | { scope: "item"; title: string }

export type { LibraryChatLaunchContext } from "@/lib/library-chat-context"

interface KnowledgeDetailProps {
  onBack: () => void
  onNavigateToKnowledge?: (factoryKind?: FactoryModalKind) => void
  knowledgeBase?: {
    id?: number
    name: string
    color: string
    description?: string
    coverVariant?: LibraryCoverVariant
    /** Public / subscribed library: metrics, like & comment, bottom quick ask */
    isPublicKb?: boolean
    isPublicPublished?: boolean
    publicSettings?: PublicKbSettings
    contentCount?: number
    subscriberCount?: number
    viewCount?: number
    publicTagline?: string
    initialLikeCount?: number
    initialCommentCount?: number
    category?: KBCategory
    /** Curator line under title on subscribed / public library detail */
    publisherName?: string
    teamSettings?: TeamLibrarySettings
  }
  initialView?: "content" | "graph" | "factory"
  /** Open team Library information on mount (e.g. after creating a team library). */
  initialOpenTeamInfo?: boolean
  /** Restore a library article after returning from library Chat. */
  initialOpenContentId?: number
  /** When set (e.g. from Agent → Studio), open this factory modal once on mount */
  initialFactoryModal?: FactoryModalKind | null
  /** Gate add-to-library / ask flows for guests who can still browse the library. */
  requireAuthThen?: (run: () => void) => void
  /** Web master–detail: hide mobile back affordance */
  embedded?: boolean
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
    image: "",
  },
  {
    id: 2,
    title: "How NotebookLM shifts AI workflows",
    excerpt:
      "Comparison of library-first Q&A vs ad-hoc chat: grounding, source cards, and why upload friction changes who adopts the tool.",
    source: "Web",
    author: "AI PM",
    date: "4/28",
    image: "",
  },
  {
    id: 3,
    title: "OpenWiki: open knowledge tooling",
    excerpt:
      "Recording summary: community workflows for curating wikis, moderation, and linking out to primary literature without breaking context.",
    source: "Recording",
    author: "OSS",
    date: "4/25",
    image: "",
  },
  {
    id: 4,
    title: "PaperOrchestra: multi-agent papers",
    excerpt:
      "PDF ingest pipeline: section detection, figure extraction, and agent roles for summarization vs critique in long documents.",
    source: "File",
    author: "X. B.",
    date: "5/1",
    image: "",
  },
  {
    id: 5,
    title: "gpt-image-2 and slide decks",
    excerpt:
      "Market note on image models for slides—latency, rights, and when generated visuals help or hurt narrative clarity in decks.",
    source: "Web",
    author: "36Kr",
    date: "4/30",
    image: "",
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
    <div className="relative overflow-hidden">
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
        className="relative z-10 flex w-full cursor-pointer select-none items-start gap-3 bg-white p-4 text-left hover:bg-white dark:bg-zinc-950"
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging.current ? "none" : "transform 0.2s ease-out",
        }}
      >
        <HubItemThumb
          kind={hubItemKindFromLabel(content.source, content.title)}
          size="lg"
          className="shrink-0"
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="text-[15px] font-medium leading-snug text-zinc-700">{content.title}</h3>
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

function formatCompactCount(n: number): string {
  if (n < 10_000) return n.toLocaleString("en-US")
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)
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

type PublicComment = {
  id: string
  user: string
  isAuthor?: boolean
  meta: string
  body: string
}

const DEMO_PUBLIC_COMMENTS: PublicComment[] = [
  {
    id: "pc-1",
    user: "Patent desk",
    isAuthor: true,
    meta: "Seattle · Dec 10, 2025",
    body:
      "Step 1: Map claims to the specification so formal objections are easy to preempt.\nStep 2: Build a feature table against the closest prior art before drafting the response.\nStep 3: If divisionals or priority are in play, align filing dates with the published text and cite them in the reply.\nStep 4: When creativity is challenged, add experiments or technical effects with paragraph anchors so the narrative stays closed-loop.",
  },
]

export function KnowledgeDetail({
  onBack,
  onNavigateToKnowledge,
  knowledgeBase,
  initialView = "content",
  initialFactoryModal,
  initialOpenTeamInfo,
  initialOpenContentId,
  requireAuthThen,
  embedded = false,
}: KnowledgeDetailProps) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [addSourcesModalOpen, setAddSourcesModalOpen] = useState(false)
  const kbFileInputRef = useRef<HTMLInputElement>(null)
  const kbFolderInputRef = useRef<HTMLInputElement>(null)
  const [hubRichNoteOpen, setHubRichNoteOpen] = useState(false)
  const [libraryChatContext, setLibraryChatContext] = useState<LibraryChatLaunchContext | null>(null)
  const [activeView, setActiveView] = useState<"content" | "graph" | "factory">(() => {
    if (initialView) return initialView
    if (knowledgeBase?.contentCount === 0) return "content"
    const kbId =
      knowledgeBase?.id ?? MOCK_KNOWLEDGE_BASES.find((k) => k.name === knowledgeBase?.name)?.id
    const shareFactory =
      Boolean(knowledgeBase?.isPublicKb) ||
      Boolean(
        knowledgeBase?.publicSettings?.isPublic &&
          knowledgeBase.publicSettings.shareFactoryOutputsWithEveryone !== false
      )
    const published =
      kbId != null
        ? publicFactoryOutputsForKb(kbId, knowledgeBase?.name ?? "Library", shareFactory)
        : []
    const isSubscribedLike =
      knowledgeBase?.category === "subscribed" || Boolean(knowledgeBase?.isPublicKb)
    if (isSubscribedLike && published.length > 0) return "factory"
    return "content"
  })
  const [showContentDetail, setShowContentDetail] = useState<LibraryDoc | null>(null)
  const [showFactoryOutput, setShowFactoryOutput] = useState<PublicFactoryOutput | null>(null)
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null)
  const [libraryOverflowOpen, setLibraryOverflowOpen] = useState(false)
  const [kbInfoVariant, setKbInfoVariant] = useState<null | "personal" | "team" | "subscribed">(null)
  const [kbName, setKbName] = useState(knowledgeBase?.name ?? "Notebook")
  const [kbDescription, setKbDescription] = useState(knowledgeBase?.description ?? "")
  const [teamSettings, setTeamSettings] = useState<TeamLibrarySettings>(
    knowledgeBase?.teamSettings ?? DEFAULT_TEAM_LIBRARY_SETTINGS
  )
  const [factoryModal, setFactoryModal] = useState<FactoryModalKind | null>(null)
  const [showCommentSheet, setShowCommentSheet] = useState(false)
  const [publicComments, setPublicComments] = useState<PublicComment[]>(() => DEMO_PUBLIC_COMMENTS.map((c) => ({ ...c })))
  const [commentExpandedIds, setCommentExpandedIds] = useState<Set<string>>(new Set())
  const [commentComposerDraft, setCommentComposerDraft] = useState("")
  const [publicLiked, setPublicLiked] = useState(false)
  const [publicLikeCount, setPublicLikeCount] = useState(0)

  const isPublicKb = knowledgeBase?.isPublicKb ?? false
  const kbCategory = knowledgeBase?.category
  const isPersonalMineKb = kbCategory === "mine" && !isPublicKb
  const isTeamKb = kbCategory === "team" && !isPublicKb
  const isSubscribedKb = kbCategory === "subscribed" || isPublicKb

  useEffect(() => {
    if (!knowledgeBase?.isPublicKb) return
    setPublicLikeCount(knowledgeBase.initialLikeCount ?? 56)
  }, [knowledgeBase?.isPublicKb, knowledgeBase?.initialLikeCount, knowledgeBase?.name])

  useEffect(() => {
    if (!showCommentSheet) {
      setCommentComposerDraft("")
    }
  }, [showCommentSheet])

  useEffect(() => {
    if (initialFactoryModal) {
      setFactoryModal(initialFactoryModal)
    }
  }, [initialFactoryModal])

  const [factoryUserJobs, setFactoryUserJobs] = useState<FactoryJob[]>([])
  const [factoryQuotaBanner, setFactoryQuotaBanner] = useState(false)
  const [factoryToastFailedJobId, setFactoryToastFailedJobId] = useState<string | null>(null)
  const [archivedFactoryJobIds, setArchivedFactoryJobIds] = useState<string[]>([])
  const [contents, setContents] = useState<LibraryDoc[]>(() => {
    if (knowledgeBase?.contentCount === 0) return []
    return mockContents.map((c) => ({ ...c }))
  })
  const sourceCount = contents.length
  const isPersonalEmpty = isPersonalMineKb && sourceCount === 0
  const publicContentMetric = knowledgeBase?.contentCount ?? sourceCount
  const publicSubscribeMetric = knowledgeBase?.subscriberCount ?? 0
  const publicViewMetric = knowledgeBase?.viewCount ?? 0
  useEffect(() => {
    setKbName(knowledgeBase?.name ?? "Notebook")
    setKbDescription(knowledgeBase?.description ?? "")
    if (knowledgeBase?.teamSettings) setTeamSettings(knowledgeBase.teamSettings)
  }, [knowledgeBase?.name, knowledgeBase?.description, knowledgeBase?.teamSettings])

  useEffect(() => {
    if (initialOpenTeamInfo && kbCategory === "team" && !isPublicKb) {
      setKbInfoVariant("team")
    }
  }, [initialOpenTeamInfo, kbCategory, isPublicKb])

  useEffect(() => {
    if (initialOpenContentId == null) return
    const doc = contents.find((c) => c.id === initialOpenContentId)
    if (doc) {
      setShowContentDetail(doc)
    }
  }, [initialOpenContentId, contents])

  useEffect(() => {
    if (sourceCount === 0) setActiveView("content")
  }, [sourceCount, knowledgeBase?.name])

  function openLibraryDoc(doc: LibraryDoc) {
    setShowContentDetail(doc)
  }

  function closeLibraryDoc() {
    setShowContentDetail(null)
  }

  const kbDisplayName = kbName

  const libraryChatStarters = useMemo(() => {
    const fromSettings = knowledgeBase?.publicSettings?.recommendedQuestions
    if (fromSettings?.length) return fromSettings
    return resolvePublicKbAgentDisplay(knowledgeBase?.publicSettings, publicContentMetric)?.recommendedQuestions ?? []
  }, [knowledgeBase?.publicSettings, publicContentMetric])

  function openLibraryAgentEntry() {
    if (isPersonalEmpty) {
      toast.message("Add sources first", {
        description: "Upload at least one file or link so Mindar can answer from your material.",
      })
      goToAddMaterial()
      return
    }
    runWithAuth(() => launchLibraryChat({}))
  }

  function closeLibraryChat() {
    setLibraryChatContext(null)
  }

  function handleChatNavigateToKnowledge(kind?: FactoryModalKind) {
    closeLibraryChat()
    if (kind) setFactoryModal(kind)
    setActiveView("factory")
    onNavigateToKnowledge?.(kind)
  }

  function launchLibraryChat(payload: {
    initialPrompt?: string
    contentTitle?: string
    contentDocId?: number
    requirePrompt?: boolean
  }) {
    const q = payload.initialPrompt?.trim()
    if (payload.requirePrompt && !q) {
      toast.error("Add a question first")
      return false
    }
    setLibraryChatContext({
      kbName: kbDisplayName,
      contentTitle: payload.contentTitle,
      contentDocId: payload.contentDocId,
      initialPrompt: q,
      publicAgent:
        libraryChatStarters.length > 0 ? { recommendedQuestions: libraryChatStarters } : undefined,
    })
    return true
  }

  function handleSubscribedUnsubscribe() {
    setLibraryOverflowOpen(false)
    setKbInfoVariant(null)
    toast.success("Unsubscribed", {
      description: `${kbDisplayName} was removed from your list (demo).`,
    })
    onBack()
  }

  const kbOverviewNarrative = useMemo(() => {
    const srcWord = sourceCount === 1 ? "source" : "sources"
    const desc = knowledgeBase?.description?.trim()
    if (isPublicKb) {
      if (desc) return desc
      return `${sourceCount} ${srcWord} in this library.`
    }
    if (desc) {
      return `${desc} “${kbDisplayName}” is built from ${sourceCount} ${srcWord} right now. Overview shows how ideas connect; Studio turns the same sources into audio, slides, and reports without starting from a blank page.`
    }
    return `“${kbDisplayName}” gathers ${sourceCount} ${srcWord} you can trust as one place to think from. Add and search material here, use AI view for summaries and the knowledge graph, then Studio when it’s time to ship something finished.`
  }, [knowledgeBase?.description, kbDisplayName, sourceCount, isPublicKb])

  const materialEmptyUploadHandlers = !isPublicKb
    ? {
        onFiles: (files: FileList) => runWithAuth(() => ingestLibraryFiles(files)),
        onWebsite: () => runWithAuth(() => addLibraryLinkSource()),
        onYouTube: () => runWithAuth(() => addLibraryLinkFromKind("youtube")),
        onPodcast: () => runWithAuth(() => addLibraryLinkFromKind("podcast")),
        onCloudDrive: () =>
          runWithAuth(() =>
            toast.message("Cloud drive", {
              description: "Connect Google Drive or OneDrive (demo).",
            })
          ),
        onPasteText: () => runWithAuth(() => addKbPastedText()),
      }
    : undefined

  const sharePublicFactory =
    isPublicKb ||
    Boolean(
      knowledgeBase?.publicSettings?.isPublic &&
        knowledgeBase.publicSettings.shareFactoryOutputsWithEveryone !== false
    )

  const resolvedKbId = useMemo(() => {
    if (knowledgeBase?.id != null) return knowledgeBase.id
    return MOCK_KNOWLEDGE_BASES.find((k) => k.name === knowledgeBase?.name)?.id
  }, [knowledgeBase?.id, knowledgeBase?.name])

  const publicStudioOutputs = useMemo(() => {
    if (resolvedKbId == null) return []
    return publicFactoryOutputsForKb(resolvedKbId, kbDisplayName, sharePublicFactory)
  }, [resolvedKbId, kbDisplayName, sharePublicFactory])

  function openPublicFactoryOutput(output: PublicFactoryOutput) {
    setShowFactoryOutput(output)
  }

  function closePublicFactoryOutput() {
    setShowFactoryOutput(null)
  }

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
    if (isSubscribedKb && sharePublicFactory) {
      toast.message("Browse publisher Studio", {
        description: "Open items under Studio to view shared outputs. Personal generation is disabled on subscribed libraries (demo).",
      })
      setFactoryModal(null)
      setActiveView("factory")
      return
    }
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
      image: "",
    }
    setContents((prev) => [doc, ...prev])
    setArchivedFactoryJobIds((prev) => [...prev, job.id])
    setActiveView("content")
    toast.success("Archived to Hub", {
      description: `“${title}” is now in “${kbDisplayName}”.`,
    })
  }

  function openContentDetailChat() {
    runWithAuth(() => {
      if (!showContentDetail) return
      launchLibraryChat({
        contentTitle: showContentDetail.title,
        contentDocId: showContentDetail.id,
      })
    })
  }


  const KbHeaderIcon = knowledgeBaseIconForTitle(
    knowledgeBase?.name ?? "",
    knowledgeBase?.description
  )

  function ingestLibraryFiles(files: FileList | null, sourceLabel = "Upload") {
    if (!files?.length) return
    const now = Date.now()
    const dateStr = `${new Date().getMonth() + 1}/${new Date().getDate()}`
    let nextId = contents.reduce((max, c) => Math.max(max, c.id), 0)
    const added = Array.from(files).map((file) => {
      nextId += 1
      return {
        id: nextId,
        title: file.name.replace(/\.[^.]+$/, "") || file.name,
        excerpt: `Uploaded ${sourceLabel.toLowerCase()} — ready for Q&A and Studio.`,
        source: sourceLabel,
        author: kbDisplayName,
        date: dateStr,
        image: "",
      }
    })
    setContents((prev) => [...added, ...prev])
  
    toast.success(added.length === 1 ? "Source added" : `${added.length} sources added`, {
      description: `Added to “${kbDisplayName}”.`,
    })
  }

  function ingestLibraryLink(url: string, forcedKind?: LibraryLinkKind) {
    const trimmed = url.trim()
    if (!trimmed) return
    const kind = forcedKind ?? detectLibraryLinkKind(trimmed)
    const nextId = contents.reduce((max, c) => Math.max(max, c.id), 0) + 1
    const dateStr = `${new Date().getMonth() + 1}/${new Date().getDate()}`
    const doc: LibraryDoc = {
      id: nextId,
      title: titleFromLinkUrl(trimmed, kind),
      excerpt: trimmed.slice(0, 120),
      source: sourceLabelForLinkKind(kind),
      author: kbDisplayName,
      date: dateStr,
      image: "",
    }
    setContents((prev) => [doc, ...prev])
    toast.success(`${sourceLabelForLinkKind(kind)} added`)
  }

  function addLibraryLinkSource() {
    const url = window.prompt("Paste a web link URL")
    if (!url?.trim()) return
    ingestLibraryLink(url)
  }

  function addLibraryLinkFromKind(kind: LibraryLinkKind) {
    const url = promptForLibraryLink(kind)
    if (!url) return
    ingestLibraryLink(url, kind)
  }

  function addKbPastedText() {
    const text = window.prompt("Paste text content")?.trim()
    if (!text) return
    const nextId = contents.reduce((max, c) => Math.max(max, c.id), 0) + 1
    const dateStr = `${new Date().getMonth() + 1}/${new Date().getDate()}`
    const doc: LibraryDoc = {
      id: nextId,
      title: text.slice(0, 48) + (text.length > 48 ? "…" : ""),
      excerpt: text.slice(0, 160) + (text.length > 160 ? "…" : ""),
      source: "Text",
      author: kbDisplayName,
      date: dateStr,
      image: "",
    }
    setContents((prev) => [doc, ...prev])
    toast.success("Text added")
  }

  function handleKbAddSource(action: KnowledgeAddSourceAction) {
    setShowAddMenu(false)
    setAddSourcesModalOpen(false)
    runWithAuth(() => {
      switch (action) {
        case "local-file":
          kbFileInputRef.current?.click()
          break
        case "local-folder":
          kbFolderInputRef.current?.click()
          break
        case "web-link":
          addLibraryLinkSource()
          break
        case "note-text": {
          const text = window.prompt("Note title")?.trim()
          if (!text) return
          const nextId = contents.reduce((max, c) => Math.max(max, c.id), 0) + 1
          const dateStr = `${new Date().getMonth() + 1}/${new Date().getDate()}`
          setContents((prev) => [
            {
              id: nextId,
              title: text,
              excerpt: "Text note",
              source: "Note",
              author: kbDisplayName,
              date: dateStr,
              image: "",
            },
            ...prev,
          ])
          toast.success("Note added")
          break
        }
        case "note-rich":
          setHubRichNoteOpen(true)
          break
        case "recording":
          toast.message("Recording summary", { description: "Open recorder and generate summary (demo)." })
          break
        case "new-folder":
          toast.message("New folder", { description: "Create a subfolder (demo)." })
          break
        case "youtube-link":
          addLibraryLinkFromKind("youtube")
          break
        case "podcast-link":
          addLibraryLinkFromKind("podcast")
          break
        default:
          break
      }
    })
  }

  const kbSourceInputs = !isPublicKb ? (
    <>
      <input
        ref={kbFileInputRef}
        type="file"
        multiple
        className="hidden"
        accept={KNOWLEDGE_UPLOAD_ACCEPT}
        onChange={(e) => {
          if (e.target.files?.length) ingestLibraryFiles(e.target.files, "File")
          e.target.value = ""
        }}
      />
      <input
        ref={kbFolderInputRef}
        type="file"
        multiple
        className="hidden"
        {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
        onChange={(e) => {
          if (e.target.files?.length) ingestLibraryFiles(e.target.files, "Folder")
          e.target.value = ""
        }}
      />
    </>
  ) : null

  const kbAddSourcesModal = !isPublicKb ? (
    <KnowledgeAddSourcesModal
      open={addSourcesModalOpen}
      onClose={() => setAddSourcesModalOpen(false)}
      locale="en"
      itemCount={contents.length}
      onFiles={(files) =>
        runWithAuth(() => {
          ingestLibraryFiles(files)
          setAddSourcesModalOpen(false)
        })
      }
      onWebsite={() =>
        runWithAuth(() => {
          addLibraryLinkSource()
          setAddSourcesModalOpen(false)
        })
      }
      onYouTube={() =>
        runWithAuth(() => {
          addLibraryLinkFromKind("youtube")
          setAddSourcesModalOpen(false)
        })
      }
      onPodcast={() =>
        runWithAuth(() => {
          addLibraryLinkFromKind("podcast")
          setAddSourcesModalOpen(false)
        })
      }
      onCloudDrive={() =>
        runWithAuth(() =>
          toast.message("Cloud drive", {
            description: "Connect Google Drive or OneDrive (demo).",
          })
        )
      }
      onPasteText={() =>
        runWithAuth(() => {
          addKbPastedText()
          setAddSourcesModalOpen(false)
        })
      }
      onMoreAction={handleKbAddSource}
    />
  ) : null

  const openKbAddSources = () =>
    runWithAuth(() => {
      if (isPublicKb) {
        toast.message("Read-only library", {
          description: "Subscribed libraries are maintained by the publisher (demo).",
        })
        return
      }
      setAddSourcesModalOpen(true)
    })

  function goToAddMaterial() {
    setActiveView("content")
    openKbAddSources()
  }

  useEffect(() => {
    if (!isPersonalEmpty) return
    const kbKey = String(knowledgeBase?.id ?? kbDisplayName)
    const storageKey = `mind-kb-upload-intro-${kbKey}`
    try {
      if (sessionStorage.getItem(storageKey)) return
    } catch {
      /* private mode */
    }
    const timer = window.setTimeout(() => {
      runWithAuth(() => {
        setAddSourcesModalOpen(true)
        try {
          sessionStorage.setItem(storageKey, "1")
        } catch {
          /* private mode */
        }
      })
    }, 550)
    return () => window.clearTimeout(timer)
  }, [isPersonalEmpty, knowledgeBase?.id, kbDisplayName, runWithAuth])

  const shareSheet = shareTarget && (
    <div className="absolute inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={() => setShareTarget(null)} />
      <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white animate-in slide-in-from-bottom duration-200 dark:bg-zinc-950">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-stone-300 rounded-full" />
        </div>
        <div className="px-5 pb-2">
          <h3 className="text-lg font-semibold text-zinc-700">
            {shareTarget.scope === "library" ? "Share library" : "Share item"}
          </h3>
          <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
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
            className="w-full py-3 bg-stone-100 rounded-xl text-zinc-700 font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

  const libraryChatOverlay = (
    <KbLibraryChatOverlay
      open={libraryChatContext != null}
      context={libraryChatContext}
      onClose={closeLibraryChat}
      requireAuthThen={requireAuthThen}
      onNavigateToKnowledge={handleChatNavigateToKnowledge}
    />
  )

  if (hubRichNoteOpen) {
    return (
      <TextNoteEditor variant="hubRich" onBack={() => setHubRichNoteOpen(false)} />
    )
  }

  if (showFactoryOutput) {
    return (
      <div className="relative flex h-full flex-col">
        <PublicFactoryOutputDetailScreen
          output={showFactoryOutput}
          libraryName={kbDisplayName}
          onBack={closePublicFactoryOutput}
        />
        {libraryChatOverlay}
      </div>
    )
  }

  if (showContentDetail) {
    return (
      <div className="relative flex h-full flex-col bg-white dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-stone-80 bg-white px-4 py-3 dark:border-stone-40 dark:bg-zinc-950">
          <button
            type="button"
            onClick={closeLibraryDoc}
            className="-ml-2 rounded-full p-2 hover:bg-stone-50 dark:hover:bg-stone-100"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6 text-zinc-700 dark:text-zinc-200" />
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShareTarget({ scope: "item", title: showContentDetail.title })}
              className="rounded-full p-2 hover:bg-stone-50 dark:hover:bg-stone-100"
              aria-label="Share"
            >
              <MoreHorizontal className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 pb-8">
          <div className="mb-4 flex h-48 w-full items-center justify-center rounded-xl bg-gradient-to-br from-stone-50 to-white ring-1 ring-stone-100">
            <HubItemThumb
              kind={hubItemKindFromLabel(showContentDetail.source, showContentDetail.title)}
              size="lg"
              className="h-20 w-20"
            />
          </div>
          <h1 className="text-xl font-semibold text-zinc-700 mb-3">{showContentDetail.title}</h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500 mb-4">
            <span>{showContentDetail.source}</span>
            <span>·</span>
            <span>{showContentDetail.author}</span>
            <span>·</span>
            <span>{showContentDetail.date}</span>
          </div>
          <div className="space-y-4 text-[15px] leading-[1.7] text-zinc-600">
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

        <ContentFactoryModals
          open={factoryModal}
          onClose={() => setFactoryModal(null)}
          libraryName={`「${showContentDetail.title}」· ${kbDisplayName}`}
          onGenerateSubmit={handleFactoryGenerateSubmit}
          optionSurface="filled"
        />
        {libraryChatOverlay}
      </div>
    )
  }

  return (
    <div className="relative flex h-full flex-col bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-zinc-950">
        {embedded ? (
          <div className="w-10 shrink-0" aria-hidden />
        ) : (
          <button onClick={onBack} className="-ml-2 rounded-full p-2 hover:bg-stone-100">
            <ChevronLeft className="h-6 w-6 text-zinc-700" />
          </button>
        )}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              toast.message("Search this library", {
                description: "Filter titles and excerpts in this notebook (demo).",
              })
            }
            className="rounded-full p-2 hover:bg-stone-100"
            aria-label="Search this library"
          >
            <SmartSearchIcon className="h-5 w-5 text-zinc-600" />
          </button>
          {!isPublicKb ? (
            <div className="relative">
              <MindAddButton
                variant="header"
                icon={FilePlus2}
                aria-label="Add to library"
                onClick={() => setShowAddMenu(!showAddMenu)}
              />

              {showAddMenu ? (
                <div className="absolute right-0 top-full z-50 mt-1.5">
                  <KnowledgeAddSourceMenu
                    variant="dropdown"
                    locale="en"
                    open={showAddMenu}
                    onClose={() => setShowAddMenu(false)}
                    onAction={handleKbAddSource}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (isPersonalMineKb) {
                  setKbInfoVariant("personal")
                  return
                }
                if (isTeamKb) {
                  setLibraryOverflowOpen((o) => !o)
                  return
                }
                if (isSubscribedKb) {
                  setLibraryOverflowOpen((o) => !o)
                  return
                }
                setShareTarget({ scope: "library" })
              }}
              className="p-2 hover:bg-stone-100 rounded-full"
              aria-label={
                isPersonalMineKb
                  ? "Library information"
                  : isTeamKb || isSubscribedKb
                    ? "Library menu"
                    : "Share library"
              }
            >
              <MoreHorizontal className="w-5 h-5 text-zinc-600" />
            </button>
            {libraryOverflowOpen && isTeamKb ? (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLibraryOverflowOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-1.5 w-[14rem] overflow-hidden rounded-2xl border border-stone-200/90 bg-white py-1 shadow-[0_12px_40px_-4px_rgba(0,0,0,0.12)] animate-in fade-in slide-in-from-top-2 duration-200 dark:border-zinc-700 dark:bg-zinc-900">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left text-[15px] text-zinc-600 hover:bg-stone-50 active:bg-stone-100/80 dark:text-zinc-100 dark:hover:bg-zinc-800/60 dark:active:bg-zinc-800"
                    onClick={() => {
                      setLibraryOverflowOpen(false)
                      setKbInfoVariant("team")
                    }}
                  >
                    <span>Library information</span>
                    <Settings className="h-5 w-5 shrink-0 text-zinc-400" strokeWidth={1.75} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left text-[15px] text-zinc-600 hover:bg-stone-50 active:bg-stone-100/80 dark:text-zinc-100 dark:hover:bg-zinc-800/60 dark:active:bg-zinc-800"
                    onClick={() => {
                      setLibraryOverflowOpen(false)
                      setShareTarget({ scope: "library" })
                    }}
                  >
                    <span>Share</span>
                    <Share2 className="h-5 w-5 shrink-0 text-zinc-400" strokeWidth={1.75} aria-hidden />
                  </button>
                </div>
              </>
            ) : null}
            {libraryOverflowOpen && isSubscribedKb && !isTeamKb ? (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLibraryOverflowOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-1.5 w-[14rem] overflow-hidden rounded-2xl border border-stone-200/90 bg-white py-1 shadow-[0_12px_40px_-4px_rgba(0,0,0,0.12)] animate-in fade-in slide-in-from-top-2 duration-200 dark:border-zinc-700 dark:bg-zinc-900">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left text-[15px] text-zinc-600 hover:bg-stone-50 active:bg-stone-100/80 dark:text-zinc-100 dark:hover:bg-zinc-800/60 dark:active:bg-zinc-800"
                    onClick={() => {
                      setLibraryOverflowOpen(false)
                      setKbInfoVariant("subscribed")
                    }}
                  >
                    <span>Library information</span>
                    <Settings className="h-5 w-5 shrink-0 text-zinc-400" strokeWidth={1.75} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left text-[15px] text-zinc-600 hover:bg-stone-50 active:bg-stone-100/80 dark:text-zinc-100 dark:hover:bg-zinc-800/60 dark:active:bg-zinc-800"
                    onClick={() => {
                      setLibraryOverflowOpen(false)
                      handleSubscribedUnsubscribe()
                    }}
                  >
                    <span>Unsubscribe</span>
                    <UserMinus className="h-5 w-5 shrink-0 text-zinc-400" strokeWidth={1.75} aria-hidden />
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-3 px-4 py-3">
        {knowledgeBase?.coverVariant || knowledgeBase?.name ? (
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-black/[0.06] dark:ring-white/10">
            <LibraryCover
              name={knowledgeBase?.name ?? "Library"}
              coverVariant={
                knowledgeBase?.coverVariant ??
                libraryCoverVariantForId(0, knowledgeBase?.name ?? "")
              }
              showMiniUi={false}
            />
          </div>
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
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[16px] font-semibold tracking-tight text-zinc-700 dark:text-zinc-50">
            {kbDisplayName}
          </h1>
          {isPublicKb ? (
            <>
              <div className="mt-1 flex min-w-0 items-center gap-1.5">
                <div
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 text-[8px] font-bold text-white"
                  aria-hidden
                >
                  {(knowledgeBase?.publisherName ?? "Publisher").trim().charAt(0).toUpperCase() || "P"}
                </div>
                <span className="truncate text-[12px] text-zinc-500 dark:text-zinc-400">
                  {(knowledgeBase?.publisherName ?? "Publisher").trim()}
                </span>
              </div>
              {knowledgeBase?.publicTagline ? (
                <p className="mt-0.5 line-clamp-1 text-[12px] leading-snug text-zinc-400 dark:text-zinc-500">
                  {knowledgeBase.publicTagline}
                </p>
              ) : null}
              <p className="mt-1 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                {formatCompactCount(publicContentMetric)} content · {formatCompactCount(publicSubscribeMetric)}{" "}
                subscribers · {formatCompactCount(publicViewMetric)} views
              </p>
            </>
          ) : (
            <p className="line-clamp-2 text-[12px] leading-snug text-zinc-500 sm:line-clamp-1 dark:text-zinc-400">
              {knowledgeBase?.description || "Depth you can browse, connect, and turn into finished work"}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => openLibraryAgentEntry()}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
            mx.knowledgeAskPill
          )}
          aria-label={isPublicKb || isSubscribedKb ? "Chat with library" : "Ask library"}
        >
          <Sparkles className={cn("h-3.5 w-3.5", mx.knowledgeAskSparkle)} strokeWidth={2} aria-hidden />
          {isPublicKb || isSubscribedKb ? "Chat" : "Ask"}
        </button>
      </div>

      {isPublicKb ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-100/90 px-4 pb-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setPublicLiked((prev) => {
                setPublicLikeCount((c) => (prev ? Math.max(0, c - 1) : c + 1))
                return !prev
              })
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-stone-200/90 px-3 py-1.5 text-[12px] font-medium text-zinc-600 transition-colors dark:border-zinc-600 dark:text-zinc-300",
              publicLiked && "border-mind/25 bg-mind/5 text-mind dark:border-mind/30 dark:bg-mind/10"
            )}
            aria-pressed={publicLiked}
          >
            <Heart className={cn("h-3.5 w-3.5", publicLiked && "fill-current")} strokeWidth={2} aria-hidden />
            {publicLikeCount}
          </button>
          <button
            type="button"
            onClick={() => setShowCommentSheet(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/90 px-3 py-1.5 text-[12px] font-medium text-zinc-600 transition-colors hover:bg-stone-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
          >
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {publicComments.length}
          </button>
        </div>
      ) : null}

      {isPersonalEmpty ? (
        <PersonalKbUploadBanner libraryName={kbDisplayName} onUpload={goToAddMaterial} className="mt-1" />
      ) : null}

      <LibraryDetailViewNav
        activeView={activeView}
        onViewChange={setActiveView}
        emphasizeView={isPersonalEmpty ? "content" : undefined}
      />

      <div
        className={cn(
          "scrollbar-hide flex min-h-0 flex-1 flex-col",
          activeView === "content" ? "overflow-hidden" : "overflow-y-auto"
        )}
      >
        {activeView === "content" && (
          <KbMaterialView
            contents={contents}
            isPublicKb={isPublicKb}
            onAddSources={openKbAddSources}
            uploadGuideIntent={isPersonalEmpty ? "onboarding" : "default"}
            emptyUploadHandlers={materialEmptyUploadHandlers}
            header={
              isSubscribedKb && publicStudioOutputs.length > 0 ? (
                <PublicPublishedFactoryFeed
                  outputs={publicStudioOutputs}
                  onOpen={openPublicFactoryOutput}
                  compact
                  className="mb-4"
                />
              ) : null
            }
            renderRow={(content) => (
              <SwipeableLibraryDocRow
                key={content.id}
                content={content}
                onOpen={() => openLibraryDoc(content)}
                onDelete={() => {
                  if (isPublicKb) {
                    toast.message("Read-only", {
                      description: "Publisher content can't be removed from your subscription (demo).",
                    })
                    return
                  }
                  setContents((prev) => prev.filter((c) => c.id !== content.id))
                  setShowContentDetail((open) => (open?.id === content.id ? null : open))
                }}
              />
            )}
          />
        )}

        {activeView === "graph" && (
          <KbAiView
            libraryName={kbDisplayName}
            sourceCount={sourceCount}
            summary={kbOverviewNarrative}
            onAddMaterial={isPersonalEmpty ? goToAddMaterial : undefined}
            onOpenFullGraph={() =>
              toast.message("Knowledge graph", { description: "Full-screen graph explorer (demo)." })
            }
          />
        )}

        {activeView === "factory" && (
          <KbStudioTabView
            libraryName={kbDisplayName}
            materialCount={sourceCount}
            onAddMaterial={isPersonalEmpty ? goToAddMaterial : undefined}
            publishedOutputs={publicStudioOutputs}
            onOpenPublishedOutput={openPublicFactoryOutput}
            readOnlyPublisherStudio={isSubscribedKb && sharePublicFactory}
            userJobs={factoryUserJobs}
            showQuotaBanner={factoryQuotaBanner}
            onDismissQuotaBanner={() => setFactoryQuotaBanner(false)}
            toastFailedJobId={factoryToastFailedJobId}
            onRetryJob={handleFactoryRetry}
            onArchiveToLibrary={isSubscribedKb ? undefined : handleArchiveFactoryJobToHub}
            archivedJobIds={archivedFactoryJobIds}
            onSelectFactory={(kind) => setFactoryModal(kind)}
          />
        )}
      </div>

      {showCommentSheet ? (
        <div className="absolute inset-0 z-[88] flex flex-col justify-end bg-black/45" role="presentation">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close comments"
            onClick={() => setShowCommentSheet(false)}
          />
          <div
            className="relative z-10 flex max-h-[min(88dvh,640px)] w-full flex-col rounded-t-[1.25rem] bg-white shadow-2xl dark:bg-zinc-950"
            role="dialog"
            aria-modal="true"
            aria-labelledby="public-kb-comments-title"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
              <h2 id="public-kb-comments-title" className="text-[16px] font-semibold text-zinc-700 dark:text-zinc-50">
                Comments {publicComments.length}
              </h2>
              <button
                type="button"
                className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-zinc-800"
                onClick={() => setShowCommentSheet(false)}
                aria-label="Close"
              >
                <X className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
              {publicComments.map((c) => {
                const previewLen = 72
                const long = c.body.length > previewLen
                const expanded = commentExpandedIds.has(c.id)
                const shown = expanded || !long ? c.body : `${c.body.slice(0, previewLen)}…`
                return (
                  <div key={c.id} className="border-b border-stone-100 py-4 last:border-b-0 dark:border-zinc-800">
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                        <User className="h-4 w-4" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[15px] font-semibold text-zinc-700 dark:text-zinc-50">{c.user}</span>
                          {c.isAuthor ? (
                            <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-mind dark:bg-stone-500 dark:text-mind/18">
                              Author
                            </span>
                          ) : null}
                          <span className="text-[12px] text-zinc-400 dark:text-zinc-500">{c.meta}</span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-200">
                          {shown}
                        </p>
                        {long ? (
                          <button
                            type="button"
                            className="mt-1.5 text-[13px] font-medium text-mind dark:text-mind/38"
                            onClick={() =>
                              setCommentExpandedIds((prev) => {
                                const next = new Set(prev)
                                if (next.has(c.id)) next.delete(c.id)
                                else next.add(c.id)
                                return next
                              })
                            }
                          >
                            {expanded ? "Show less" : "Show more"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="shrink-0 border-t border-stone-100 bg-white px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-3 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-200 dark:bg-zinc-700">
                  <User className="h-4 w-4 text-zinc-600 dark:text-zinc-300" aria-hidden />
                </div>
                <input
                  value={commentComposerDraft}
                  onChange={(e) => setCommentComposerDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      const t = commentComposerDraft.trim()
                      if (!t) return
                      setPublicComments((prev) => [
                        { id: `pc-${Date.now()}`, user: "Guest", meta: "Just now", body: t },
                        ...prev,
                      ])
                      setCommentComposerDraft("")
                      toast.success("Posted", { description: "Comment added to the thread (demo)." })
                    }
                  }}
                  placeholder="Write a comment…"
                  className="min-h-[44px] flex-1 rounded-full border border-transparent bg-stone-100 px-4 text-[14px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200/60 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-zinc-200/50"
                />
                <button
                  type="button"
                  disabled={!commentComposerDraft.trim()}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                    commentComposerDraft.trim()
                      ? "text-mind hover:bg-stone-50 dark:hover:bg-stone-100"
                      : "text-zinc-300 dark:text-zinc-600"
                  )}
                  aria-label="Send"
                  onClick={() => {
                    const t = commentComposerDraft.trim()
                    if (!t) return
                    setPublicComments((prev) => [
                      { id: `pc-${Date.now()}`, user: "Guest", meta: "Just now", body: t },
                      ...prev,
                    ])
                    setCommentComposerDraft("")
                    toast.success("Posted", { description: "Comment added to the thread (demo)." })
                  }}
                >
                  <Send className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {kbSourceInputs}
      {kbAddSourcesModal}
      {shareSheet}

      <PersonalKbInfoOverlay
        open={kbInfoVariant === "personal"}
        onClose={() => setKbInfoVariant(null)}
        name={kbDisplayName}
        description={knowledgeBase?.description}
        coverVariant={knowledgeBase?.coverVariant}
        colorClass={knowledgeBase?.color}
      />
      <TeamKbInfoOverlay
        open={kbInfoVariant === "team"}
        onClose={() => setKbInfoVariant(null)}
        name={kbDisplayName}
        description={kbDescription}
        coverVariant={knowledgeBase?.coverVariant}
        colorClass={knowledgeBase?.color}
        settings={teamSettings}
        onSettingsChange={setTeamSettings}
        onNameChange={setKbName}
        onDescriptionChange={setKbDescription}
      />
      <SubscribedKbInfoOverlay
        open={kbInfoVariant === "subscribed"}
        onClose={() => setKbInfoVariant(null)}
        name={kbDisplayName}
        description={knowledgeBase?.description}
        coverVariant={knowledgeBase?.coverVariant}
        colorClass={knowledgeBase?.color}
        onUnsubscribe={handleSubscribedUnsubscribe}
      />

      <ContentFactoryModals
        open={factoryModal}
        onClose={() => setFactoryModal(null)}
        libraryName={kbDisplayName}
        onGenerateSubmit={handleFactoryGenerateSubmit}
        optionSurface="filled"
      />

      {libraryChatOverlay}
    </div>
  )
}
