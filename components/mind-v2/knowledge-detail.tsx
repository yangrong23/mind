"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
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
import { MindChatComposer } from "@/components/mind-v2/mind-chat-composer"
import { MindarContentFactoryGrid } from "@/components/mind-v2/mindar-content-factory-grid"
import { WebPublicFactoryGallery } from "@/components/mind-v2/web-public-factory-gallery"
import { publicFactoryOutputsForKb } from "@/lib/public-factory-outputs"
import type { PublicKbSettings } from "@/lib/public-kb-settings"
import { MindChatHeaderActions } from "@/components/mind-v2/mind-chat-header-actions"
import {
  MindChatQaHistoryPanel,
  seedDemoQaHistory,
  type MindQaHistoryItem,
} from "@/components/mind-v2/mind-chat-qa-history-panel"
import { knowledgeBaseIconForTitle } from "@/components/mind-v2/knowledge-base-icon"
import { KNOWLEDGE_UPLOAD_ACCEPT } from "@/components/mind-v2/knowledge-upload-guide"
import {
  KnowledgeAddSourceMenu,
  type KnowledgeAddSourceAction,
} from "@/components/mind-v2/knowledge-add-source-menu"
import { KnowledgeAddSourcesModal } from "@/components/mind-v2/knowledge-add-sources-modal"
import { LibraryCover } from "@/components/mind-v2/library-cover"
import { HubItemThumb } from "@/components/mind-v2/mind-media-art"
import { getKbAgentSuggestions } from "@/lib/kb-agent-suggestions"
import { PlazaLibraryAgentIntro } from "@/components/mind-v2/plaza-library-agent-intro"
import { publicAgentDisplayName } from "@/lib/public-kb-settings"
import { KbAgentSuggestionRail } from "@/components/mind-v2/kb-agent-suggestion-rail"
import { hubItemKindFromLabel } from "@/lib/product-media"
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
  Upload,
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
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"
import {
  KnowledgeDetailWebShell,
  KnowledgeGraphPreview,
  WebPanelHeader,
} from "@/components/mind-v2/knowledge-detail-web-shell"
import {
  WebNotebookDialogueBlock,
  WebNotebookDialogueComposer,
  buildWebNotebookExchange,
  useWebNotebookFeedback,
  type WebNotebookMessage,
} from "@/components/mind-v2/web-notebook-dialogue"
import {
  WebSubscribedKbProfileHeader,
  WebSubscribedKbContentPanel,
} from "@/components/mind-v2/web-subscribed-kb-chrome"
import {
  WebPlazaKbAgentHome,
  WebPlazaKbGraphSection,
} from "@/components/mind-v2/web-plaza-kb-overview"

type ShareTarget =
  | { scope: "library" }
  | { scope: "item"; title: string }

export type LibraryChatLaunchContext = {
  kbName: string
  kbId?: number
  contentTitle?: string
  initialPrompt?: string
  /** When set, backing out of Chat re-opens this Hub article. */
  contentDocId?: number
  publicSettings?: PublicKbSettings
  publisherName?: string
}

export type PlazaLibraryAccess = {
  isSubscribed: boolean
  isOwner: boolean
  onSubscribe?: () => void
  onUnsubscribe?: () => void
}

interface KnowledgeDetailProps {
  onBack: () => void
  onAgentChat?: (context: LibraryChatLaunchContext) => void
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
  /** Plaza / discover: scroll attention to Studio (content factory) on open */
  initialFocusStudio?: boolean
  /** Gate add-to-library / ask flows for guests who can still browse the library. */
  requireAuthThen?: (run: () => void) => void
  /** Web master–detail: hide mobile back affordance */
  embedded?: boolean
  /** Desktop: Sources | Hub/Chat | Graph + Studio on one screen (NotebookLM-style). */
  webLayout?: boolean
  onOpenDocumentEditor?: (title: string) => void
  /** Vue admin: chunking, models, datasources — not replaced in React web shell */
  onOpenAdvancedKbSettings?: () => void
  /** Plaza preview / subscribed public library — subscribe gate + assistant panel */
  plazaAccess?: PlazaLibraryAccess
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
function notebookSummaryForLibrary(name: string, sourceCount: number): string {
  const unit = sourceCount === 1 ? "file" : "files"
  return `Across the ${sourceCount} ${unit} in “${name}”, we pull a single thread you can read in one pass: what each source contributes, where they reinforce each other, and where they diverge. Skim this first, then jump into chat when you want detail—replies stay tied to the passages they came from.`
}

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
  onAgentChat,
  knowledgeBase,
  initialView = "content",
  initialFactoryModal,
  initialFocusStudio = false,
  initialOpenTeamInfo,
  initialOpenContentId,
  requireAuthThen,
  embedded = false,
  webLayout = false,
  onOpenDocumentEditor,
  onOpenAdvancedKbSettings,
  plazaAccess,
}: KnowledgeDetailProps) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [addSourcesModalOpen, setAddSourcesModalOpen] = useState(false)
  const kbFileInputRef = useRef<HTMLInputElement>(null)
  const kbFolderInputRef = useRef<HTMLInputElement>(null)
  const studioPanelRef = useRef<HTMLElement>(null)
  const [studioHighlight, setStudioHighlight] = useState(initialFocusStudio)
  const [hubRichNoteOpen, setHubRichNoteOpen] = useState(false)
  const [showNotebookAsk, setShowNotebookAsk] = useState(false)
  const [webCenterMode, setWebCenterMode] = useState<"hub" | "ask" | "doc">("hub")
  const [webSourceSelected, setWebSourceSelected] = useState<Set<number>>(() => new Set(mockContents.map((c) => c.id)))
  const [webSourceSearch, setWebSourceSearch] = useState("")
  const [notebookAskDraft, setNotebookAskDraft] = useState("")
  const [notebookQaHistoryOpen, setNotebookQaHistoryOpen] = useState(false)
  const [notebookQaHistoryItems, setNotebookQaHistoryItems] = useState<MindQaHistoryItem[]>(() => seedDemoQaHistory())
  const [notebookVoiceOn, setNotebookVoiceOn] = useState(false)
  const [webNotebookMessages, setWebNotebookMessages] = useState<WebNotebookMessage[]>([])
  const { feedbackById: webFeedbackById, setFeedback: setWebMessageFeedback } =
    useWebNotebookFeedback()
  const [activeView, setActiveView] = useState<"content" | "graph" | "factory">(initialView)
  const [showContentDetail, setShowContentDetail] = useState<LibraryDoc | null>(null)
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
  const [subscribePromptOpen, setSubscribePromptOpen] = useState(false)

  const isPublicKb = knowledgeBase?.isPublicKb ?? false
  const publicSettings = knowledgeBase?.publicSettings
  const plazaSubscribed = plazaAccess?.isSubscribed ?? !isPublicKb
  const plazaOwner = plazaAccess?.isOwner ?? false
  const canUsePlazaChat = plazaSubscribed || plazaOwner || !isPublicKb
  const kbCategory = knowledgeBase?.category
  const isPersonalMineKb = kbCategory === "mine" && !isPublicKb
  const isTeamKb = kbCategory === "team" && !isPublicKb
  const isSubscribedKb = kbCategory === "subscribed" || isPublicKb
  /** Subscribers cannot upload or add sources — publisher maintains the library. */
  const kbUploadDisabled = isSubscribedKb

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

  useEffect(() => {
    if (!initialFocusStudio || !webLayout) return
    const subscribed =
      knowledgeBase?.category === "subscribed" || Boolean(knowledgeBase?.isPublicKb)
    if (subscribed) {
      setFactoryModal("report")
      return
    }
    setStudioHighlight(true)
    const scrollId = window.setTimeout(() => {
      studioPanelRef.current?.scrollIntoView({ behavior: "smooth", inline: "end", block: "nearest" })
    }, 150)
    const fadeId = window.setTimeout(() => setStudioHighlight(false), 2800)
    return () => {
      window.clearTimeout(scrollId)
      window.clearTimeout(fadeId)
    }
  }, [initialFocusStudio, webLayout, knowledgeBase?.category, knowledgeBase?.isPublicKb])

  useEffect(() => {
    if (!showNotebookAsk) setNotebookAskDraft("")
  }, [showNotebookAsk])

  const [factoryUserJobs, setFactoryUserJobs] = useState<FactoryJob[]>([])
  const [factoryQuotaBanner, setFactoryQuotaBanner] = useState(false)
  const [factoryToastFailedJobId, setFactoryToastFailedJobId] = useState<string | null>(null)
  const [archivedFactoryJobIds, setArchivedFactoryJobIds] = useState<string[]>([])
  const [contents, setContents] = useState<LibraryDoc[]>(() => mockContents.map((c) => ({ ...c })))
  const sourceCount = contents.length
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
      if (onOpenAdvancedKbSettings) onOpenAdvancedKbSettings()
      else setKbInfoVariant("team")
    }
  }, [initialOpenTeamInfo, kbCategory, isPublicKb, onOpenAdvancedKbSettings])

  useEffect(() => {
    if (initialOpenContentId == null) return
    const doc = contents.find((c) => c.id === initialOpenContentId)
    if (doc) {
      setShowContentDetail(doc)
      if (webLayout) setWebCenterMode("hub")
    }
  }, [initialOpenContentId, contents, webLayout])

  function openNotebookAsk() {
    if (webLayout) {
      setWebCenterMode("hub")
      setShowNotebookAsk(false)
      return
    }
    setShowNotebookAsk(true)
  }

  function openLibraryDoc(doc: LibraryDoc) {
    setShowContentDetail(doc)
    if (webLayout) setWebCenterMode("hub")
  }

  function closeLibraryDoc() {
    setShowContentDetail(null)
    if (webLayout) setWebCenterMode("hub")
  }

  const kbDisplayName = kbName

  const kbAgentSuggestions = useMemo(
    () =>
      getKbAgentSuggestions({
        name: kbDisplayName,
        description: kbDescription,
        category: kbCategory,
        coverVariant: knowledgeBase?.coverVariant,
        isPublicKb,
        recommendedQuestions: teamSettings.recommendedQuestions,
        exampleQuestions: publicSettings?.exampleQuestions,
      }),
    [
      kbDisplayName,
      kbDescription,
      kbCategory,
      knowledgeBase?.coverVariant,
      isPublicKb,
      teamSettings.recommendedQuestions,
      publicSettings?.exampleQuestions,
    ]
  )

  const webSourceQuery = webSourceSearch.trim().toLowerCase()
  const filteredWebSources = useMemo(() => {
    if (!webSourceQuery) return contents
    return contents.filter(
      (c) =>
        c.title.toLowerCase().includes(webSourceQuery) ||
        c.excerpt.toLowerCase().includes(webSourceQuery) ||
        c.source.toLowerCase().includes(webSourceQuery)
    )
  }, [contents, webSourceQuery])

  function launchLibraryChat(payload: {
    initialPrompt?: string
    contentTitle?: string
    contentDocId?: number
    requirePrompt?: boolean
  }) {
    if (!onAgentChat) return false
    const q = payload.initialPrompt?.trim()
    if (payload.requirePrompt && !q) {
      toast.error("Add a question first")
      return false
    }
    onAgentChat({
      kbName: kbDisplayName,
      kbId: knowledgeBase?.id,
      contentTitle: payload.contentTitle,
      contentDocId: payload.contentDocId,
      initialPrompt: q,
      publicSettings: knowledgeBase?.publicSettings,
      publisherName: knowledgeBase?.publisherName,
    })
    return true
  }

  function requestPlazaChat(initialPrompt?: string) {
    if (!canUsePlazaChat) {
      setSubscribePromptOpen(true)
      return
    }
    launchLibraryChat({ initialPrompt, requirePrompt: false })
  }

  function handleSubscribedUnsubscribe() {
    setLibraryOverflowOpen(false)
    setKbInfoVariant(null)
    toast.success("Unsubscribed", {
      description: `${kbDisplayName} was removed from your list (demo).`,
    })
    onBack()
  }

  const notebookSummaryBody = notebookSummaryForLibrary(kbDisplayName, sourceCount)

  const kbOverviewNarrative = useMemo(() => {
    const srcWord = sourceCount === 1 ? "source" : "sources"
    const desc = knowledgeBase?.description?.trim()
    if (desc) {
      return `${desc} “${kbDisplayName}” is built from ${sourceCount} ${srcWord} right now. Overview shows how ideas connect; Studio turns the same sources into audio, slides, and reports without starting from a blank page.`
    }
    return `“${kbDisplayName}” gathers ${sourceCount} ${srcWord} you can trust as one place to think from. Read and search here, explore the graph below, then use Studio when it’s time to ship something finished.`
  }, [knowledgeBase?.description, kbDisplayName, sourceCount])

  const sharePublicFactory =
    isPublicKb ||
    isSubscribedKb ||
    Boolean(
      knowledgeBase?.publicSettings?.isPublic && knowledgeBase.publicSettings.shareFactoryOutputsWithEveryone
    )

  const communityFactoryOutputs = useMemo(() => {
    if (!webLayout || !sharePublicFactory) return []
    const kbId = knowledgeBase?.id ?? 0
    return publicFactoryOutputsForKb(kbId, kbDisplayName, true)
  }, [webLayout, sharePublicFactory, knowledgeBase?.id, kbDisplayName])

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

  function saveNotebookNoteToLibrary(body: string, titleSuffix: string) {
    if (kbUploadDisabled) {
      toast.message("Read-only library", {
        description: "Subscribed libraries cannot be edited by subscribers (demo).",
      })
      return
    }
    const title = `${kbDisplayName} · ${titleSuffix}`
    const now = new Date()
    const dateStr = `${now.getMonth() + 1}/${now.getDate()}`
    const nextId = contents.reduce((max, c) => Math.max(max, c.id), 0) + 1
    const doc: LibraryDoc = {
      id: nextId,
      title,
      excerpt: body.slice(0, 160) + (body.length > 160 ? "…" : ""),
      source: "Dialogue",
      author: kbDisplayName,
      date: dateStr,
      image: "",
    }
    setContents((prev) => [doc, ...prev])
    if (!webLayout) setActiveView("content")
    toast.success("Saved to notes", {
      description: `Added to “${kbDisplayName}”.`,
    })
  }

  function saveAskSummaryToLibrary() {
    saveNotebookNoteToLibrary(notebookSummaryBody, "rolling summary")
  }

  function saveWebReplyToLibrary(content: string) {
    saveNotebookNoteToLibrary(content, "Q&A note")
  }

  function submitWebNotebookAsk(selectedSourceCount: number, promptOverride?: string) {
    const q = (promptOverride ?? notebookAskDraft).trim()
    if (!q) {
      toast.error("Add a question first")
      return
    }
    setWebNotebookMessages((prev) => [...prev, ...buildWebNotebookExchange(q, selectedSourceCount)])
    setNotebookAskDraft("")
    setWebCenterMode("hub")
  }

  function askPlazaAgentInDialogue(prompt?: string) {
    if (!canUsePlazaChat) {
      setSubscribePromptOpen(true)
      return
    }
    if (prompt) setNotebookAskDraft(prompt)
    runWithAuth(() => submitWebNotebookAsk(webSourceSelected.size, prompt))
  }

  function regenerateWebNotebookReply(assistantId: string, selectedSourceCount: number) {
    setWebNotebookMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId
          ? {
              ...m,
              timeLabel: `Today · ${new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}`,
              content: `Regenerated answer grounded on ${selectedSourceCount} ${
                selectedSourceCount === 1 ? "source" : "sources"
              } (demo).`,
            }
          : m
      )
    )
    toast.message("Regenerated", { description: "Demo — refreshed model reply." })
  }

  function submitNotebookAsk() {
    runWithAuth(() => {
      if (webLayout) {
        submitWebNotebookAsk(webSourceSelected.size)
        return
      }
      if (
        launchLibraryChat({
          initialPrompt: notebookAskDraft,
          requirePrompt: true,
        })
      ) {
        setNotebookAskDraft("")
        setShowNotebookAsk(false)
      }
    })
  }

  const KbHeaderIcon = knowledgeBaseIconForTitle(
    knowledgeBase?.name ?? "",
    knowledgeBase?.description
  )

  function ingestLibraryFiles(files: FileList | null, sourceLabel = "Upload") {
    if (kbUploadDisabled) {
      toast.message("Read-only library", {
        description: "Subscribed libraries cannot accept uploads (demo).",
      })
      return
    }
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
    if (webLayout) {
      setWebSourceSelected((prev) => {
        const next = new Set(prev)
        added.forEach((d) => next.add(d.id))
        return next
      })
    }
    toast.success(added.length === 1 ? "Source added" : `${added.length} sources added`, {
      description: `Added to “${kbDisplayName}”.`,
    })
  }

  function addLibraryLinkSource() {
    if (kbUploadDisabled) {
      toast.message("Read-only library", {
        description: "Subscribed libraries cannot accept new sources (demo).",
      })
      return
    }
    const url = window.prompt("Paste a web link URL")
    if (!url?.trim()) return
    let title = url.trim()
    try {
      title = new URL(url.trim()).hostname.replace(/^www\./, "")
    } catch {
      /* keep raw */
    }
    const nextId = contents.reduce((max, c) => Math.max(max, c.id), 0) + 1
    const dateStr = `${new Date().getMonth() + 1}/${new Date().getDate()}`
    const doc: LibraryDoc = {
      id: nextId,
      title,
      excerpt: url.trim().slice(0, 120),
      source: "Link",
      author: kbDisplayName,
      date: dateStr,
      image: "",
    }
    setContents((prev) => [doc, ...prev])
    if (webLayout) setWebSourceSelected((prev) => new Set(prev).add(doc.id))
    toast.success("Link added")
  }

  function addKbPastedText() {
    if (kbUploadDisabled) {
      toast.message("Read-only library", {
        description: "Subscribed libraries cannot accept new sources (demo).",
      })
      return
    }
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
    if (webLayout) setWebSourceSelected((prev) => new Set(prev).add(doc.id))
    toast.success("Text added")
  }

  function handleKbAddSource(action: KnowledgeAddSourceAction) {
    setShowAddMenu(false)
    setAddSourcesModalOpen(false)
    if (kbUploadDisabled) {
      toast.message("Read-only library", {
        description: "Subscribed libraries cannot accept new sources (demo).",
      })
      return
    }
    runWithAuth(() => {
      switch (action) {
        case "local-file":
          kbFileInputRef.current?.click()
          break
        case "local-folder":
          kbFolderInputRef.current?.click()
          break
        case "personal-kb":
          toast.message("Personal library", { description: "Import from another library (demo)." })
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
        default:
          break
      }
    })
  }

  const kbSourceInputs = !kbUploadDisabled ? (
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

  const kbAddSourcesModal = !kbUploadDisabled ? (
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
      if (kbUploadDisabled) {
        toast.message("Read-only library", {
          description: "Subscribed libraries are maintained by the publisher (demo).",
        })
        return
      }
      setAddSourcesModalOpen(true)
    })

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

  if (showNotebookAsk && !webLayout) {
    return (
      <div className="relative flex h-full flex-col bg-white dark:bg-zinc-950">
        <div className="flex shrink-0 items-center justify-between border-b border-stone-50 bg-white/80 px-3 py-2.5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <button
            type="button"
            onClick={() => setShowNotebookAsk(false)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-stone-200/60"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6 text-zinc-600" />
          </button>
          <h1 className="min-w-0 flex-1 px-2 text-center text-[15px] font-semibold tracking-tight text-zinc-700 truncate">
            {kbDisplayName}
          </h1>
          <MindChatHeaderActions
            size="compact"
            newChatAccent={false}
            onNewChat={() => {
              setNotebookAskDraft("")
              setNotebookQaHistoryOpen(false)
              toast.message("New session", { description: "Draft cleared (demo)." })
            }}
            onOpenHistory={() => setNotebookQaHistoryOpen(true)}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Rolling summary
          </p>
          <h2 className="mt-1.5 text-[19px] font-semibold leading-snug tracking-tight text-zinc-700">{kbDisplayName}</h2>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-stone-100/90 px-2.5 py-1 text-[12px] font-medium text-zinc-600">
            <span className="tabular-nums">{sourceCount}</span>
            <span className="text-zinc-400">·</span>
            <span>from your sources</span>
          </p>

          <p className="mt-6 text-[15px] leading-[1.72] text-zinc-600">{notebookSummaryBody}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => toast.success("Copied")}
                className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-stone-200/70 hover:text-zinc-600"
                aria-label="Copy summary"
              >
                <Copy className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => toast.success("Thanks", { description: "Marked as helpful." })}
                className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-stone-200/70 hover:text-zinc-600"
                aria-label="Good summary"
              >
                <ThumbsUp className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => toast.message("Noted", { description: "We will improve summaries (demo)." })}
                className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-stone-200/70 hover:text-zinc-600"
                aria-label="Bad summary"
              >
                <ThumbsDown className="h-5 w-5" />
              </button>
              {!kbUploadDisabled ? (
                <button
                  type="button"
                  title="Save this summary into your knowledge library"
                  aria-label="Add to library"
                  onClick={() => runWithAuth(saveAskSummaryToLibrary)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-stone-200/70 hover:text-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100"
                >
                  <Library className="h-5 w-5" strokeWidth={1.85} />
                </button>
              ) : null}
            </div>
            <p className="max-w-[14rem] text-[11px] leading-snug text-zinc-500 dark:text-zinc-400 sm:max-w-none">
              Add this answer to your library so it stays grounded with your sources.
            </p>
          </div>

        </div>

        <div className="shrink-0 bg-white/85 px-3 pb-2 pt-1.5 backdrop-blur-sm dark:bg-zinc-900/85">
          <KbAgentSuggestionRail
            suggestions={kbAgentSuggestions}
            libraryName={kbDisplayName}
            onSelect={setNotebookAskDraft}
            className="mb-2.5 px-0.5"
          />
          <MindChatComposer
            variant="thread"
            className="max-w-none"
            value={notebookAskDraft}
            onChange={setNotebookAskDraft}
            onSubmit={submitNotebookAsk}
            placeholder={`Ask ${sourceCount} sources…`}
            voiceOn={notebookVoiceOn}
            onVoiceToggle={() =>
              runWithAuth(() => {
                setNotebookVoiceOn((prev) => {
                  const next = !prev
                  toast.message(next ? "Voice input" : "Voice input off", {
                    description: next ? "Demo: tap again to stop." : "Demo: no audio sent.",
                  })
                  return next
                })
              })
            }
            atTitle={`${sourceCount} sources`}
            onAtClick={() =>
              toast.message("Sources", { description: `Covers ${sourceCount} items (demo).` })
            }
            onUploadClick={openKbAddSources}
          />
        </div>

        <MindChatQaHistoryPanel
          open={notebookQaHistoryOpen}
          onClose={() => setNotebookQaHistoryOpen(false)}
          items={notebookQaHistoryItems}
          title="Q&A history"
          retentionHint="Keeps the last 90 days of history for you."
          locale="en-US"
        />

        <ContentFactoryModals
          open={factoryModal}
          onClose={() => setFactoryModal(null)}
          libraryName={kbDisplayName}
          onGenerateSubmit={handleFactoryGenerateSubmit}
          optionSurface="filled"
        />
      </div>
    )
  }

  if (hubRichNoteOpen) {
    return (
      <TextNoteEditor variant="hubRich" onBack={() => setHubRichNoteOpen(false)} />
    )
  }

  if (showContentDetail && !webLayout) {
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
      </div>
    )
  }

  if (webLayout) {
    const webSelectedCount = webSourceSelected.size
    const allSourcesSelected = contents.length > 0 && webSelectedCount === contents.length

    function toggleWebSource(id: number) {
      setWebSourceSelected((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    }

    function toggleAllWebSources() {
      if (allSourcesSelected) setWebSourceSelected(new Set())
      else setWebSourceSelected(new Set(contents.map((c) => c.id)))
    }

    function ingestWebSources(files: FileList | null, sourceLabel = "Upload") {
      if (!files?.length) return
      const now = Date.now()
      const dateStr = `${new Date().getMonth() + 1}/${new Date().getDate()}`
      let nextId = contents.reduce((max, c) => Math.max(max, c.id), 0)
      const added = Array.from(files).map((file, i) => {
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
      setWebSourceSelected((prev) => {
        const next = new Set(prev)
        added.forEach((d) => next.add(d.id))
        return next
      })
      toast.success(added.length === 1 ? "Source added" : `${added.length} sources added`, {
        description: `Added to “${kbDisplayName}”.`,
      })
    }

    function addWebLinkSource() {
      const url = window.prompt("Paste a link URL")
      if (!url?.trim()) return
      let title = url.trim()
      try {
        title = new URL(url.trim()).hostname.replace(/^www\./, "")
      } catch {
        /* keep raw */
      }
      const nextId = contents.reduce((max, c) => Math.max(max, c.id), 0) + 1
      const dateStr = `${new Date().getMonth() + 1}/${new Date().getDate()}`
      const doc: LibraryDoc = {
        id: nextId,
        title,
        excerpt: url.trim().slice(0, 120),
        source: "Link",
        author: kbDisplayName,
        date: dateStr,
        image: "",
      }
      setContents((prev) => [doc, ...prev])
      setWebSourceSelected((prev) => new Set(prev).add(doc.id))
      toast.success("Link added")
    }

    const webDocActive = showContentDetail != null

    const plazaAgentName =
      isPublicKb && publicSettings ? publicAgentDisplayName(publicSettings) : null

    const webSubscriberNotebook = isSubscribedKb
    const webKbReadOnly = kbUploadDisabled

    const webChatPanelHeader = (
      <WebPanelHeader
        title={webDocActive ? showContentDetail!.title : plazaAgentName ?? "Assistant"}
        trailing={
          webDocActive ? (
            <button
              type="button"
              onClick={() => {
                closeLibraryDoc()
                setWebCenterMode("hub")
              }}
              className="text-[12px] font-medium text-zinc-600 hover:underline"
            >
              Back to chat
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] tabular-nums text-zinc-500">
                {webSelectedCount} in context
              </span>
              <MindChatHeaderActions
                size="compact"
                newChatAccent={false}
                onNewChat={() => {
                  setNotebookAskDraft("")
                  setWebNotebookMessages([])
                  setNotebookQaHistoryOpen(false)
                  toast.message("New session", { description: "Dialogue cleared (demo)." })
                }}
                onOpenHistory={() => setNotebookQaHistoryOpen(true)}
              />
            </div>
          )
        }
      />
    )

    const webChatBody = webDocActive ? (
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          {showContentDetail!.source} · {showContentDetail!.date}
        </p>
        <div className="mt-4 space-y-4 text-[15px] leading-[1.72] text-zinc-600">
          {bodyForContent(showContentDetail!.id, showContentDetail!.title, showContentDetail!.excerpt).map(
            (para, i) => (
              <p key={i}>{para}</p>
            )
          )}
        </div>
      </div>
    ) : (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {webSubscriberNotebook && publicSettings ? (
            <>
              {webNotebookMessages.length === 0 ? (
                <WebPlazaKbAgentHome
                  libraryName={kbDisplayName}
                  libraryDescription={knowledgeBase?.description}
                  kbId={knowledgeBase?.id}
                  contentCount={publicContentMetric}
                  publicSettings={publicSettings}
                  exampleQuestions={
                    publicSettings.exampleQuestions.length > 0
                      ? publicSettings.exampleQuestions
                      : kbAgentSuggestions.map((s) => s.prompt)
                  }
                  onTryQuestion={(prompt) => askPlazaAgentInDialogue(prompt)}
                  chatDisabled={!canUsePlazaChat}
                  chatDisabledReason={
                    canUsePlazaChat ? undefined : "Subscribe to chat with this library assistant"
                  }
                />
              ) : null}
              <WebPlazaKbGraphSection
                compact
                embeddedInChat
                className={cn(
                  "!px-0 border-t border-stone-100",
                  webNotebookMessages.length === 0 ? "mt-5 pt-4" : "mt-4 pt-4"
                )}
              />
            </>
          ) : null}
          {!webSubscriberNotebook && !isPublicKb ? (
            <p className="text-[15px] leading-[1.72] text-zinc-700">{kbOverviewNarrative}</p>
          ) : null}
          {!webSubscriberNotebook && isPublicKb && publicSettings ? (
            <PlazaLibraryAgentIntro
              libraryName={kbDisplayName}
              libraryDescription={knowledgeBase?.description}
              contentCount={publicContentMetric}
              kbId={knowledgeBase?.id}
              publicSettings={publicSettings}
              exampleQuestions={
                publicSettings.exampleQuestions.length > 0
                  ? publicSettings.exampleQuestions
                  : kbAgentSuggestions.map((s) => s.prompt)
              }
              onStartThread={(prompt) => askPlazaAgentInDialogue(prompt)}
              chatDisabled={!canUsePlazaChat}
              chatDisabledReason={
                canUsePlazaChat ? undefined : "Subscribe to chat with this library assistant"
              }
              variant="dialogue"
            />
          ) : null}
          {!webSubscriberNotebook && !isPublicKb ? (
            <section className="mt-8">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[13px] font-semibold text-zinc-600">Knowledge graph</h3>
                <button
                  type="button"
                  className="text-[12px] font-semibold text-mind hover:underline"
                  onClick={() =>
                    toast.message("Full graph", {
                      description: "Opens immersive graph view (demo).",
                    })
                  }
                >
                  Expand
                </button>
              </div>
              <div className="mt-4 flex flex-col items-center rounded-2xl bg-gradient-to-b from-stone-50/90 to-white px-4 py-6 ring-1 ring-stone-200/60">
                <KnowledgeGraphPreview compact />
                <p className="mt-3 max-w-[280px] text-center text-[12px] leading-relaxed text-zinc-500">
                  See how concepts, people, and documents in this library connect.
                </p>
              </div>
            </section>
          ) : null}
          <WebNotebookDialogueBlock
            messages={webNotebookMessages}
            sourceCount={webSelectedCount}
            feedbackById={webFeedbackById}
            onFeedback={setWebMessageFeedback}
            onSaveReply={
              kbUploadDisabled
                ? undefined
                : (content) => runWithAuth(() => saveWebReplyToLibrary(content))
            }
            onRegenerate={(id) => runWithAuth(() => regenerateWebNotebookReply(id, webSelectedCount))}
            className={cn(
              webSubscriberNotebook && webNotebookMessages.length === 0 && "hidden",
              !webSubscriberNotebook && isPublicKb && publicSettings && "mt-8 border-t border-stone-100 pt-6"
            )}
          />
        </div>
        <WebNotebookDialogueComposer
          draft={notebookAskDraft}
          onDraftChange={setNotebookAskDraft}
          onSubmit={submitNotebookAsk}
          sourceCount={webSelectedCount}
          voiceOn={notebookVoiceOn}
          onVoiceToggle={() => setNotebookVoiceOn((prev) => !prev)}
          requireAuthThen={requireAuthThen}
          agentSuggestions={webSubscriberNotebook ? undefined : kbAgentSuggestions}
          libraryName={webSubscriberNotebook ? undefined : plazaAgentName ?? kbDisplayName}
          onAddFiles={webKbReadOnly ? undefined : openKbAddSources}
          allowUpload={!webKbReadOnly}
          placeholder={
            webSubscriberNotebook ? "Ask based on this library…" : "Ask or create content…"
          }
          selectedFactory={factoryModal}
          onFactorySelect={(kind) => runWithAuth(() => setFactoryModal(kind))}
        />
      </div>
    )

    const webSourcesPanel = webSubscriberNotebook ? (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <WebSubscribedKbProfileHeader
          libraryName={kbDisplayName}
          libraryDescription={knowledgeBase?.description}
          publisherName={knowledgeBase?.publisherName}
          kbId={knowledgeBase?.id}
          publicSettings={publicSettings}
          contentCount={publicContentMetric}
          subscriberCount={publicSubscribeMetric || 845}
          viewCount={publicViewMetric || 3341}
          likeCount={publicLikeCount}
          commentCount={publicComments.length}
          liked={publicLiked}
          onToggleLike={() => {
            setPublicLiked((prev) => {
              setPublicLikeCount((c) => (prev ? Math.max(0, c - 1) : c + 1))
              return !prev
            })
          }}
          onOpenComments={() => setShowCommentSheet(true)}
        />
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
          <div className="min-h-[280px]">
            <WebSubscribedKbContentPanel
              items={contents}
              contentCount={publicContentMetric}
              commentCount={publicComments.length}
              searchQuery={webSourceSearch}
              onSearchQueryChange={setWebSourceSearch}
              selectedIds={webSourceSelected}
              onToggleSelected={(id) => toggleWebSource(id)}
              onOpenItem={(item) => {
                toggleWebSource(item.id)
                toast.message("Source in context", { description: item.title })
              }}
            />
          </div>
        </div>
      </div>
    ) : (
      <>
        <WebPanelHeader
          title="Sources"
          trailing={
            <div className="flex items-center gap-2">
              {!isPublicKb ? (
                <button
                  type="button"
                  onClick={() => runWithAuth(() => setAddSourcesModalOpen(true))}
                  className="rounded-lg px-2 py-1 text-[12px] font-semibold text-teal-600 hover:bg-teal-50"
                >
                  Add sources
                </button>
              ) : null}
              <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                <input
                  type="checkbox"
                  className="rounded border-stone-300"
                  checked={allSourcesSelected}
                  onChange={toggleAllWebSources}
                />
                All
              </label>
            </div>
          }
        />
        <div className="shrink-0 px-2.5 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={webSourceSearch}
              onChange={(e) => setWebSourceSearch(e.target.value)}
              placeholder="Search sources…"
              className="w-full rounded-lg bg-stone-50/90 py-2 pl-8 pr-2 text-[12px] text-zinc-700 ring-1 ring-stone-200/80 outline-none placeholder:text-zinc-400 focus:ring-teal-200/60"
              aria-label="Search sources"
            />
          </div>
        </div>
        {contents.length === 0 && !isPublicKb ? (
          <div className="shrink-0 px-2.5 pb-2">
            <button
              type="button"
              onClick={() => runWithAuth(() => setAddSourcesModalOpen(true))}
              className="w-full rounded-xl border border-dashed border-stone-200 py-6 text-[13px] font-medium text-zinc-500 hover:border-stone-300 hover:bg-stone-50/80 hover:text-zinc-700"
            >
              Add sources to get started
            </button>
          </div>
        ) : null}
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-2 pb-0">
          {filteredWebSources.length === 0 ? (
            <p className="px-2 py-6 text-center text-[12px] text-zinc-500">
              {webSourceQuery ? "No sources match your search." : "No sources yet."}
            </p>
          ) : null}
          {filteredWebSources.map((content) => {
            const checked = webSourceSelected.has(content.id)
            return (
              <div
                key={content.id}
                className="flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-stone-50 dark:hover:bg-zinc-800/60"
              >
                <button
                  type="button"
                  onClick={() => openLibraryDoc(content)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="line-clamp-2 text-[13px] font-medium leading-snug text-zinc-600 dark:text-zinc-100">
                    {content.title}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-500">{content.source}</p>
                </button>
                <input
                  type="checkbox"
                  className="mt-1 shrink-0 rounded border-stone-300"
                  checked={checked}
                  onChange={() => toggleWebSource(content.id)}
                  aria-label={`Include ${content.title}`}
                />
              </div>
            )
          })}
        </div>
      </>
    )

    const webStudioPanel = (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <WebPanelHeader title="Studio" trailing={<span className="text-[11px] text-zinc-400">Content factory</span>} />
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-3 pb-0">
          <MindarContentFactoryGrid
            librarySummary={`${webSelectedCount} sources linked`}
            onSelect={(kind) => setFactoryModal(kind)}
            surface="filled"
            layout="kb"
            className="!mt-0"
          />
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
          {factoryUserJobs.length === 0 && communityFactoryOutputs.length === 0 ? (
            <p className="mt-6 px-1 text-center text-[12px] leading-relaxed text-zinc-500">
              Pick a format to generate audio, slides, quizzes, and more from your sources.
            </p>
          ) : null}
          <WebPublicFactoryGallery outputs={communityFactoryOutputs} className="px-0.5 pb-4" />
        </div>
      </div>
    )

    return (
      <KnowledgeDetailWebShell
        title={kbDisplayName}
        description={knowledgeBase?.description}
        embedded={embedded}
        onBack={onBack}
        layout={webSubscriberNotebook ? "subscribed" : "notebook"}
        studioRef={studioPanelRef}
        studioHighlight={studioHighlight}
        sources={webSourcesPanel}
        center={
          <>
            {webChatPanelHeader}
            {webChatBody}
          </>
        }
        studio={webStudioPanel}
        overlays={
          <>
            {kbSourceInputs}
            {kbAddSourcesModal}
            {shareSheet}
            <ContentFactoryModals
              open={factoryModal}
              onClose={() => setFactoryModal(null)}
              libraryName={kbDisplayName}
              onGenerateSubmit={handleFactoryGenerateSubmit}
              optionSurface="filled"
            />
            <MindChatQaHistoryPanel
              open={notebookQaHistoryOpen}
              onClose={() => setNotebookQaHistoryOpen(false)}
              items={notebookQaHistoryItems}
              title="Q&A history"
              retentionHint="Keeps the last 90 days of history for you."
              locale="en-US"
            />
          </>
        }
      />
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
          {!kbUploadDisabled ? (
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="p-2 hover:bg-stone-100 rounded-full"
                type="button"
                aria-label="Upload to library"
              >
                <Upload className="h-5 w-5 text-zinc-600" strokeWidth={1.75} aria-hidden />
              </button>

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
                      if (onOpenAdvancedKbSettings) onOpenAdvancedKbSettings()
                      else setKbInfoVariant("team")
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
          onClick={() => (isPublicKb && onAgentChat ? requestPlazaChat() : openNotebookAsk())}
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
            "border border-mind/20 bg-mind/8 text-mind shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] hover:border-mind/25 hover:bg-mind/12"
          )}
        >
          <Sparkles className={cn("h-3.5 w-3.5", "text-mind")} strokeWidth={2} />
          {isPublicKb && publicSettings ? `Ask ${publicAgentDisplayName(publicSettings)}` : "Ask"}
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
          {plazaAccess ? (
            <>
              <button
                type="button"
                onClick={() =>
                  runWithAuth(() => {
                    if (plazaSubscribed) plazaAccess.onUnsubscribe?.()
                    else plazaAccess.onSubscribe?.()
                  })
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                  plazaSubscribed
                    ? "border-teal-200 bg-teal-50 text-teal-800"
                    : "border-stone-200/90 text-zinc-600 hover:bg-stone-50"
                )}
              >
                {plazaSubscribed ? "Subscribed ✓" : "Subscribe"}
              </button>
              {!plazaOwner ? (
                <button
                  type="button"
                  onClick={() => runWithAuth(() => requestPlazaChat())}
                  className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-teal-700"
                >
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  Chat
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

      {subscribePromptOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/30 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-zinc-950"
          >
            <h3 className="text-[16px] font-semibold text-zinc-800">Subscribe to chat</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-600">
              Subscribe to “{kbDisplayName}” to chat with{" "}
              {publicAgentDisplayName(publicSettings)} and use scoped example prompts.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSubscribePromptOpen(false)}
                className="rounded-full px-4 py-2 text-[13px] font-medium text-zinc-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  runWithAuth(() => {
                    plazaAccess?.onSubscribe?.()
                    setSubscribePromptOpen(false)
                    toast.success("Subscribed", { description: `"${kbDisplayName}" is in your library list.` })
                  })
                }
                className="rounded-full bg-teal-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-teal-700"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="bg-white dark:bg-zinc-950" role="tablist" aria-label="Library views">
          <div className="flex w-full">
            {[
              { id: "content" as const, label: "Hub" },
              { id: "graph" as const, label: "Graph" },
              { id: "factory" as const, label: "Studio" },
            ].map((mode) => {
              const selected = activeView === mode.id
              return (
                <button
                  key={mode.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveView(mode.id)}
                  className={cn(
                    "relative flex min-w-0 flex-1 items-center justify-center pb-3.5 pt-3.5 text-[15px] font-semibold tracking-tight transition-colors",
                    selected
                      ? "text-zinc-700 dark:text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  )}
                >
                  {mode.label}
                  {selected ? (
                    <span
                      className={cn(
                        "absolute bottom-0 left-1/2 h-[2px] w-10 -translate-x-1/2 rounded-full",
                        "bg-mind/20 dark:bg-mind/25"
                      )}
                      aria-hidden
                    />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

      <div className={cn("scrollbar-hide flex min-h-0 flex-1 flex-col", activeView === "content" ? "overflow-hidden" : "overflow-y-auto")}>
        {activeView === "content" && (
          <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-zinc-950">
            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
              <div className="px-4 pb-2 pt-3">
                <section className="mb-8">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
                      Overview
                    </h2>
                    <span className="shrink-0 text-[12px] font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                      {sourceCount} {sourceCount === 1 ? "source" : "sources"}
                    </span>
                  </div>
                  <p className="mt-4 text-[15px] leading-[1.7] text-zinc-700 dark:text-zinc-300">{kbOverviewNarrative}</p>
                </section>
                <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
                  Documents
                </h2>
                <div className="divide-y divide-stone-100 overflow-hidden dark:divide-zinc-800">
                  {contents.length === 0 ? (
                    <div className="px-4 py-10 text-center text-[13px] text-zinc-500">No documents yet</div>
                  ) : (
                    contents.map((content) => (
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
                          setWebSourceSelected((prev) => {
                            const next = new Set(prev)
                            next.delete(content.id)
                            return next
                          })
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
            <h3 className="text-lg font-semibold text-zinc-700 mb-2">Knowledge graph</h3>
            <p className="text-sm text-zinc-500 text-center mb-4">
              Visualize how ideas connect across your library.
            </p>
            <button className="px-6 py-2.5 bg-zinc-500 text-white rounded-xl text-sm font-medium hover:bg-zinc-600">
              Open full graph
            </button>
          </div>
        )}

        {activeView === "factory" && (
          <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto bg-white px-4 pb-10 pt-4 dark:bg-zinc-950">
            <h3 className="mb-3 text-[15px] font-semibold tracking-tight text-zinc-600">Create new content</h3>

            <MindarContentFactoryGrid
              librarySummary=""
              onSelect={(kind) => setFactoryModal(kind)}
              className="!mt-0"
              surface="filled"
              layout="kb"
            />

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
                <Sparkles className="mb-2 h-7 w-7 text-mind/30" strokeWidth={1.5} />
                <p className="max-w-[260px] text-[13px] leading-relaxed text-zinc-500">
                  Choose a format above to generate. Runs and results stack here so you can start another anytime—no
                  extra screen.
                </p>
              </div>
            ) : null}
          </div>
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
    </div>
  )
}
