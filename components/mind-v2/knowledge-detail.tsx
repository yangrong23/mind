"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
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
import { WebStudioOutputsPanel } from "@/components/mind-v2/web-studio-outputs-panel"
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
import { publicAgentDisplayName } from "@/lib/public-kb-settings"
import { KbAgentSuggestionRail } from "@/components/mind-v2/kb-agent-suggestion-rail"
import { KbUploadFileIcon } from "@/components/mind-v2/kb-upload-file-icon"
import { hubItemKindFromLabel } from "@/lib/product-media"
import { bodyForLibraryDocument } from "@/lib/library-document-body"
import { isKbPinned, readPinnedKbIds, togglePinnedKb } from "@/lib/web-pinned-kbs"
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
  WebPanelHeader,
} from "@/components/mind-v2/knowledge-detail-web-shell"
import { AgentExamplePromptRail } from "@/components/mind-v2/agent-example-prompt-rail"
import {
  WebKbAiViewChatToggle,
  WebKbAiViewEntry,
  WebKbAiViewPanel,
  type WebKbCenterSurface,
} from "@/components/mind-v2/web-kb-ai-view"
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
import { PublicKbCommentsPanel } from "@/components/mind-v2/public-kb-comments-panel"
import {
  PublicKbEngagementBar,
  PublicKbEngagementStats,
} from "@/components/mind-v2/public-kb-engagement-bar"
import {
  demoCommentsForKb,
  engagementMetricsForKb,
  readPlazaLikedKbIds,
  writePlazaLikedKbIds,
  type PublicKbComment,
} from "@/lib/plaza-kb-engagement"
import {
  WebPlazaKbChatEmptyCenter,
} from "@/components/mind-v2/web-plaza-kb-overview"

type ShareTarget =
  | { scope: "library" }
  | { scope: "item"; title: string }

export type KbLibraryDocument = {
  id: number
  title: string
  excerpt: string
  source: string
  author: string
  date: string
}

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
  initialView?: "content" | "ai" | "graph" | "factory"
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
  /** Web: open dedicated article reader with side agent chat + content factory. */
  onOpenDocumentReader?: (doc: KbLibraryDocument) => void
  /** Web: rich-text note editor with right AI co-write column. */
  onOpenRichTextEditor?: () => void
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
  initialFocusStudio = false,
  initialOpenTeamInfo,
  initialOpenContentId,
  requireAuthThen,
  embedded = false,
  webLayout = false,
  onOpenDocumentEditor,
  onOpenDocumentReader,
  onOpenRichTextEditor,
  onOpenAdvancedKbSettings,
  plazaAccess,
}: KnowledgeDetailProps) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [addSourcesModalOpen, setAddSourcesModalOpen] = useState(false)
  const kbFileInputRef = useRef<HTMLInputElement>(null)
  const kbFolderInputRef = useRef<HTMLInputElement>(null)
  const studioPanelRef = useRef<HTMLDivElement>(null)
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
  const [activeView, setActiveView] = useState<"content" | "ai" | "factory">(
    initialView === "graph" ? "ai" : initialView === "ai" ? "ai" : initialView
  )
  const [webCenterSurface, setWebCenterSurface] = useState<WebKbCenterSurface>("chat")
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
  const [publicComments, setPublicComments] = useState<PublicKbComment[]>([])
  const [pinnedKbIds, setPinnedKbIds] = useState<number[]>(() => readPinnedKbIds())
  const commentSeedLenRef = useRef(0)
  const [commentCountBase, setCommentCountBase] = useState(0)
  const [subscribedContentTab, setSubscribedContentTab] = useState<"content" | "comments">("content")
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
    setWebCenterSurface("chat")
  }, [knowledgeBase?.id])

  useEffect(() => {
    if (!knowledgeBase?.isPublicKb || knowledgeBase.id == null) return
    const kbId = knowledgeBase.id
    const subs = knowledgeBase.subscriberCount ?? 0
    const seeded = demoCommentsForKb(kbId)
    commentSeedLenRef.current = seeded.length
    const engagement = engagementMetricsForKb(kbId, subs, {
      likeCount: knowledgeBase.initialLikeCount,
      commentCount: knowledgeBase.initialCommentCount,
    })
    const liked = readPlazaLikedKbIds().has(kbId)
    setPublicComments(seeded)
    setCommentCountBase(engagement.commentCount)
    setPublicLikeCount(engagement.likeCount + (liked ? 1 : 0))
    setPublicLiked(liked)
    setSubscribedContentTab("content")
  }, [
    knowledgeBase?.id,
    knowledgeBase?.isPublicKb,
    knowledgeBase?.initialLikeCount,
    knowledgeBase?.initialCommentCount,
    knowledgeBase?.subscriberCount,
    knowledgeBase?.name,
  ])

  const togglePublicLike = () => {
    const kbId = knowledgeBase?.id
    setPublicLiked((prev) => {
      const next = !prev
      setPublicLikeCount((c) => (prev ? Math.max(0, c - 1) : c + 1))
      if (kbId != null) {
        const liked = readPlazaLikedKbIds()
        if (next) liked.add(kbId)
        else liked.delete(kbId)
        writePlazaLikedKbIds(liked)
      }
      return next
    })
  }

  const openPublicComments = () => {
    if (webLayout && isSubscribedKb) {
      setSubscribedContentTab("comments")
      return
    }
    setShowCommentSheet(true)
  }

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

  const publicCommentCount = Math.max(
    commentCountBase,
    commentCountBase + (publicComments.length - commentSeedLenRef.current)
  )

  const publicEngagementMetrics = useMemo(
    () => ({
      subscriberCount: publicSubscribeMetric,
      likeCount: publicLikeCount,
      commentCount: publicCommentCount,
    }),
    [publicSubscribeMetric, publicLikeCount, publicCommentCount]
  )

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
    if (webLayout && onOpenDocumentReader) {
      onOpenDocumentReader(doc)
      return
    }
    setShowContentDetail(doc)
    if (webLayout) setWebCenterMode("hub")
  }

  function closeLibraryDoc() {
    setShowContentDetail(null)
    if (webLayout) setWebCenterMode("hub")
  }

  const kbDisplayName = kbName
  const kbPinned = knowledgeBase?.id != null && isKbPinned(knowledgeBase.id, pinnedKbIds)

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
    return `“${kbDisplayName}” gathers ${sourceCount} ${srcWord} you can trust as one place to think from. Read and search here, open AI view for a quick map of themes, then use Studio when it’s time to ship something finished.`
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
    setWebCenterSurface("chat")
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
          if (webLayout && onOpenRichTextEditor) {
            onOpenRichTextEditor()
          } else {
            setHubRichNoteOpen(true)
          }
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

        <div className="shrink-0 px-3 pb-3 pt-1.5">
          <KbAgentSuggestionRail
            suggestions={kbAgentSuggestions}
            libraryName={kbDisplayName}
            onSelect={setNotebookAskDraft}
            className="relative z-[1] mb-2.5 px-0.5"
          />
          <MindChatComposer
            variant="thread"
            className="max-w-none"
            uploadIconStyle="kb-file"
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

  if (hubRichNoteOpen && !webLayout) {
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
            {bodyForLibraryDocument(
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

    const plazaAgentName =
      isPublicKb && publicSettings ? publicAgentDisplayName(publicSettings) : null

    const webSubscriberNotebook = isSubscribedKb
    const webKbReadOnly = kbUploadDisabled

    const webChatPanelTitle = plazaAgentName ?? "Assistant"

    const webChatPanelHeader = (
      <WebPanelHeader
        title={webChatPanelTitle}
        trailing={
          <div className="flex items-center gap-2">
            <WebKbAiViewChatToggle mode={webCenterSurface} onChange={setWebCenterSurface} />
            <span
              className={cn(
                "hidden w-[6.25rem] shrink-0 text-right text-[12px] tabular-nums text-zinc-500 sm:inline",
                webCenterSurface !== "chat" && "invisible"
              )}
              aria-hidden={webCenterSurface !== "chat"}
            >
              {webSelectedCount} in context
            </span>
            <MindChatHeaderActions
              size="compact"
              newChatAccent={false}
              onNewChat={() => {
                setNotebookAskDraft("")
                setWebNotebookMessages([])
                setNotebookQaHistoryOpen(false)
                setWebCenterSurface("chat")
                toast.message("New session", { description: "Dialogue cleared (demo)." })
              }}
              onOpenHistory={() => setNotebookQaHistoryOpen(true)}
            />
          </div>
        }
      />
    )

    const webEmptyTryPrompts =
      publicSettings && publicSettings.exampleQuestions.length > 0
        ? publicSettings.exampleQuestions
        : kbAgentSuggestions.map((s) => s.prompt)

    const webChatEmptyWithAiView =
      webNotebookMessages.length === 0 ? (
        <div className="mx-auto max-w-3xl space-y-4 pb-2">
          <WebKbAiViewPanel
            libraryName={kbDisplayName}
            sourceCount={sourceCount}
            description={knowledgeBase?.description}
            expanded
            className="!px-0"
          />
          {webEmptyTryPrompts.length > 0 ? (
            <section className="border-t border-black/[0.04] pt-4">
              <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                <Sparkles className="h-3 w-3 text-mind" strokeWidth={2} aria-hidden />
                Try asking
              </p>
              <AgentExamplePromptRail
                layout="wrap"
                prompts={webEmptyTryPrompts.map((q, i) => ({
                  id: `kb-prompt-${i}`,
                  label: q,
                  prompt: q,
                }))}
                onSelect={(prompt) => {
                  if (canUsePlazaChat) askPlazaAgentInDialogue(prompt)
                }}
                className="w-full"
              />
              {!canUsePlazaChat ? (
                <p className="mt-3 text-center text-[12px] text-zinc-500">
                  Subscribe to chat about this library
                </p>
              ) : null}
            </section>
          ) : null}
        </div>
      ) : null

    const webChatBody = (
      <div className="flex min-h-0 flex-1 flex-col">
        {webCenterSurface === "chat" && webNotebookMessages.length > 0 ? (
          <WebKbAiViewEntry
            libraryName={kbDisplayName}
            sourceCount={sourceCount}
            onOpen={() => setWebCenterSurface("ai")}
          />
        ) : null}
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {webCenterSurface === "ai" ? (
            <WebKbAiViewPanel
              libraryName={kbDisplayName}
              sourceCount={sourceCount}
              description={knowledgeBase?.description}
              expanded
              className="!px-0"
            />
          ) : (
            <>
              {webChatEmptyWithAiView}
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
                onRegenerate={(id) =>
                  runWithAuth(() => regenerateWebNotebookReply(id, webSelectedCount))
                }
                className={cn(
                  webNotebookMessages.length === 0 && "hidden",
                  webNotebookMessages.length > 0 &&
                    !webSubscriberNotebook &&
                    isPublicKb &&
                    publicSettings &&
                    "mt-4 border-t border-black/[0.04] pt-6"
                )}
              />
            </>
          )}
        </div>
        <WebNotebookDialogueComposer
          draft={notebookAskDraft}
          onDraftChange={setNotebookAskDraft}
          onSubmit={submitNotebookAsk}
          sourceCount={webSelectedCount}
          voiceOn={notebookVoiceOn}
          onVoiceToggle={() => setNotebookVoiceOn((prev) => !prev)}
          requireAuthThen={requireAuthThen}
          agentSuggestions={undefined}
          onQuickQuestion={(prompt) => runWithAuth(() => askPlazaAgentInDialogue(prompt))}
          libraryName={kbDisplayName}
          onAddFiles={webKbReadOnly ? undefined : openKbAddSources}
          allowUpload={!webKbReadOnly}
          placeholder={
            webCenterSurface === "ai"
              ? "Ask about a topic or connection in this library…"
              : webSubscriberNotebook
                ? "Ask based on this library…"
                : "Ask or create content…"
          }
          showFactoryRail={false}
          disclaimer={publicSettings?.disclaimer}
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
          metrics={publicEngagementMetrics}
          viewCount={publicViewMetric || 3341}
          subscribed={plazaSubscribed}
          liked={publicLiked}
          isOwner={plazaOwner}
          onToggleSubscribe={() =>
            runWithAuth(() => {
              if (plazaSubscribed) plazaAccess?.onUnsubscribe?.()
              else plazaAccess?.onSubscribe?.()
            })
          }
          onToggleLike={() => runWithAuth(togglePublicLike)}
          onOpenComments={() => runWithAuth(openPublicComments)}
          onShare={() => runWithAuth(() => setShareTarget({ scope: "library" }))}
          pinned={kbPinned}
          onTogglePin={
            knowledgeBase?.id != null
              ? () =>
                  runWithAuth(() => {
                    const wasPinned = kbPinned
                    const next = togglePinnedKb(knowledgeBase.id!)
                    setPinnedKbIds(next)
                    toast.message(wasPinned ? "Unpinned" : "Pinned to top", {
                      description: wasPinned
                        ? `“${kbDisplayName}” removed from pinned libraries.`
                        : `“${kbDisplayName}” will appear at the top of your library list.`,
                    })
                  })
              : undefined
          }
        />
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
          <div className="min-h-[280px]">
            <WebSubscribedKbContentPanel
              items={contents}
              contentCount={publicContentMetric}
              comments={publicComments}
              onCommentsChange={setPublicComments}
              initialTab={subscribedContentTab}
              commentCount={publicCommentCount}
              searchQuery={webSourceSearch}
              onSearchQueryChange={setWebSourceSearch}
              selectedIds={webSourceSelected}
              onToggleSelected={(id) => toggleWebSource(id)}
              onOpenItem={(item) => {
                openLibraryDoc({
                  id: item.id,
                  title: item.title,
                  excerpt: item.excerpt,
                  source: item.source,
                  author: item.source,
                  date: item.date,
                  image: "",
                })
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
                  className="rounded-lg px-2 py-1 text-[12px] font-semibold text-mind hover:bg-mind/8"
                >
                  Add sources
                </button>
              ) : null}
              <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                <input
                  type="checkbox"
                  className="rounded border-black/[0.12]"
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
              className={cn(web.kbInput, "py-2 pl-8 pr-2")}
              aria-label="Search sources"
            />
          </div>
        </div>
        {contents.length === 0 && !isPublicKb ? (
          <div className="shrink-0 px-2.5 pb-2">
            <button
              type="button"
              onClick={() => runWithAuth(() => setAddSourcesModalOpen(true))}
              className="w-full rounded-xl border border-dashed border-black/[0.08] py-6 text-[13px] font-medium text-zinc-500 hover:border-black/[0.12] hover:bg-zinc-900/[0.03] hover:text-zinc-700"
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
                className={cn("flex items-start gap-2 rounded-lg px-2 py-2", web.kbRowHover)}
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
        <WebPanelHeader
          title="Studio"
          trailing={<span className="text-[10px] text-zinc-400">Create</span>}
        />
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-2.5 pb-4">
          <MindarContentFactoryGrid
            librarySummary={`${webSelectedCount} sources linked`}
            onSelect={(kind) => setFactoryModal(kind)}
            surface="filled"
            layout="kb"
            studioCompact
            className="!mt-0"
          />
          <StudioFactoryJobsInline
            userJobs={factoryUserJobs}
            showQuotaBanner={factoryQuotaBanner}
            onDismissQuotaBanner={() => setFactoryQuotaBanner(false)}
            toastFailedJobId={factoryToastFailedJobId}
            onRetryJob={handleFactoryRetry}
            showCompletedOutputs={false}
          />
          <WebStudioOutputsPanel
            userJobs={factoryUserJobs}
            communityOutputs={communityFactoryOutputs}
            onArchiveToLibrary={handleArchiveFactoryJobToHub}
            archiveTargetLabel={kbDisplayName}
            archivedJobIds={archivedFactoryJobIds}
            className="px-0.5"
          />
          {factoryUserJobs.filter((j) => j.status === "complete").length === 0 &&
          communityFactoryOutputs.length === 0 &&
          factoryUserJobs.filter((j) => j.status === "generating").length === 0 ? (
            <p className="mt-4 px-1 text-center text-[12px] leading-relaxed text-zinc-500">
              Pick a format above — outputs appear here with type filters.
            </p>
          ) : null}
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
                <KbUploadFileIcon className="h-5 w-5 text-zinc-600" />
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
              <div className="mt-1">
                <PublicKbEngagementStats
                  metrics={publicEngagementMetrics}
                  className="text-[11px] dark:text-zinc-500"
                />
                <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                  {formatCompactCount(publicContentMetric)} items · {formatCompactCount(publicViewMetric)} views
                </p>
              </div>
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
        <div className="border-b border-stone-100/90 px-4 pb-3 dark:border-zinc-800">
          <PublicKbEngagementBar
            metrics={publicEngagementMetrics}
            subscribed={plazaSubscribed}
            liked={publicLiked}
            onToggleSubscribe={() =>
              runWithAuth(() => {
                if (plazaSubscribed) plazaAccess?.onUnsubscribe?.()
                else plazaAccess?.onSubscribe?.()
              })
            }
            onToggleLike={() => runWithAuth(togglePublicLike)}
            onOpenComments={() => runWithAuth(openPublicComments)}
            onOpenChat={plazaOwner ? undefined : () => runWithAuth(() => requestPlazaChat())}
            showChat={!plazaOwner}
            subscribeLabel={
              plazaOwner ? { follow: "Published", following: "Your library" } : undefined
            }
          />
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
                className="rounded-full bg-mind px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90"
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
              { id: "ai" as const, label: "AI view" },
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

        {activeView === "ai" && (
          <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto bg-white px-4 py-4 dark:bg-zinc-950">
            <WebKbAiViewPanel
              libraryName={kbDisplayName}
              sourceCount={sourceCount}
              description={knowledgeBase?.description}
              expanded
              className="!px-0"
            />
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
              studioCompact
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
                Comments · {publicCommentCount}
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
            <PublicKbCommentsPanel
              comments={publicComments}
              onCommentsChange={setPublicComments}
              className="min-h-[240px] max-h-[min(72dvh,520px)]"
            />
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
