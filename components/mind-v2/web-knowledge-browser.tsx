"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavListItem } from "@/components/mind-v2/web-nav-selection"
import { KnowledgeUploadGuide } from "@/components/mind-v2/knowledge-upload-guide"
import {
  KnowledgeAddSourceMenu,
  type KnowledgeAddSourceAction,
} from "@/components/mind-v2/knowledge-add-source-menu"
import {
  KbContentUpdateDot,
  LibraryCover,
  LibraryCoverFromKb,
  LibraryCoverWithUpdateBadge,
} from "@/components/mind-v2/library-cover"
import { LibraryListThumbnail } from "@/components/mind-v2/library-list-thumbnail"
import { KbListMetaBadges } from "@/components/mind-v2/library-kb-badges"
import {
  WebLibraryContentEmpty,
  WebLibraryHubWelcome,
  WebLibrarySectionEmpty,
} from "@/components/mind-v2/web-library-empty-guide"
import { LIBRARY_HUB_SECTIONS } from "@/lib/library-hub-sections"
import {
  DEFAULT_TEAM_LIBRARY_SETTINGS,
  MOCK_KNOWLEDGE_BASES,
  knowledgeBaseFromWebCreate,
  type KnowledgeBase,
  type SubscribedKbRole,
  type TeamLibrarySettings,
} from "@/lib/mock-knowledge-bases"
import type { LibraryCoverVariant } from "@/lib/product-media"
import {
  WebCreateKbDialog,
  type WebCreateKbDialogMode,
  type WebCreateKbPayload,
} from "@/components/mind-v2/web-create-kb-dialog"
import { MINDAR_COPILOT_AGENT, MINDAR_DEMO_MY_AGENTS } from "@/components/mind-v2/agent-tab"
import type { PublicKbSettings } from "@/lib/public-kb-settings"
import {
  defaultAgentSettingsForCreate,
  publicAgentDisplayName,
} from "@/lib/public-kb-settings"
import { WebKbShareDialog } from "@/components/mind-v2/web-kb-share-dialog"
import {
  PublicKbEngagementBar,
  PublicKbEngagementStats,
} from "@/components/mind-v2/public-kb-engagement-bar"
import {
  engagementMetricsForKb,
  readPlazaLikedKbIds,
  writePlazaLikedKbIds,
} from "@/lib/plaza-kb-engagement"
import {
  isLibrarySubscribed,
  subscribePlazaLibrary,
  unsubscribePlazaLibrary,
} from "@/lib/plaza-subscription-store"
import {
  WebKbDetailHero,
  WebKbDetailSortSelect,
  WebKbDetailToolbar,
  WebKbHubContentList,
  type WebKbHubListItem,
} from "@/components/mind-v2/web-kb-detail-chrome"
import { WebLibraryNavPanel } from "@/components/mind-v2/web-library-nav-panel"
import { WebKbMaterialsGrid, WebKbMaterialsList } from "@/components/mind-v2/web-kb-materials-grid"
import {
  SHARED_KB_PRODUCT_LINE,
  WebKbOverflowMenu,
  WebPersonalKbHeader,
  WebSharedKbContentBar,
  WebSharedKbHeader,
} from "@/components/mind-v2/web-shared-kb-chrome"
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  Link2,
  List,
  Plus,
  Search,
  Share2,
  Users,
} from "lucide-react"
import { KbUploadFileIcon } from "@/components/mind-v2/kb-upload-file-icon"
export type { LibraryHubSectionId } from "@/lib/library-hub-sections"
import type { LibraryHubSectionId } from "@/lib/library-hub-sections"

type SidebarSectionId = LibraryHubSectionId

const SIDEBAR_SECTIONS = LIBRARY_HUB_SECTIONS

function subscribedRoleOf(kb: KnowledgeBase): SubscribedKbRole {
  return kb.subscribedRole === "published" ? "published" : "followed"
}

export type HubLibraryItem = {
  id: number
  title: string
  source: string
  author: string
  date: string
  dateSort: number
}

type KbSortId = "recent" | "name" | "count"
type ContentSortId = "newest" | "oldest" | "title" | "source"

const KB_SORT_OPTIONS: { id: KbSortId; label: string }[] = [
  { id: "recent", label: "Recently updated" },
  { id: "name", label: "Name A–Z" },
  { id: "count", label: "Most items" },
]

const CONTENT_SORT_OPTIONS: { id: ContentSortId; label: string }[] = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "title", label: "Title A–Z" },
  { id: "source", label: "Source type" },
]

const DEMO_HUB_SEED: Omit<HubLibraryItem, "id" | "dateSort">[] = [
  {
    title: "Where is the AI recorder card headed?",
    source: "Article",
    author: "Wei",
    date: "5/12",
  },
  {
    title: "Product experience background notes",
    source: "Note",
    author: "Me",
    date: "5/10",
  },
  {
    title: "NotebookLM workflow comparison",
    source: "Link",
    author: "Medrix",
    date: "5/8",
  },
  {
    title: "Vector store architecture",
    source: "Note",
    author: "Tech weekly",
    date: "5/1",
  },
  {
    title: "How NotebookLM shifts AI workflows",
    source: "Web",
    author: "AI PM",
    date: "4/28",
  },
]

function lastUpdateRank(label: string): number {
  const t = label.toLowerCase()
  if (t.includes("just now")) return 0
  if (t.includes("today")) return 1
  const h = t.match(/(\d+)\s*h/)
  if (h) return 10 + Number(h[1])
  const d = t.match(/(\d+)\s*d/)
  if (d) return 100 + Number(d[1])
  if (t.includes("yesterday")) return 50
  return 200
}

function buildInitialHubByKb(): Record<number, HubLibraryItem[]> {
  const now = Date.now()
  return Object.fromEntries(
    MOCK_KNOWLEDGE_BASES.map((kb) => [
      kb.id,
      DEMO_HUB_SEED.map((item, j) => ({
        ...item,
        id: kb.id * 1000 + j + 1,
        dateSort: now - j * 86_400_000,
      })),
    ])
  )
}

function sortKnowledgeBases(items: KnowledgeBase[], sort: KbSortId): KnowledgeBase[] {
  const copy = [...items]
  switch (sort) {
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case "count":
      return copy.sort((a, b) => b.count - a.count)
    case "recent":
    default:
      return copy.sort((a, b) => lastUpdateRank(a.lastUpdate) - lastUpdateRank(b.lastUpdate))
  }
}

/** Following — libraries with new content surface first, then usual sort */
function sortFollowingLibraries(items: KnowledgeBase[], sort: KbSortId): KnowledgeBase[] {
  const withUpdate = items.filter((k) => k.hasContentUpdate)
  const rest = items.filter((k) => !k.hasContentUpdate)
  return [...sortKnowledgeBases(withUpdate, sort), ...sortKnowledgeBases(rest, sort)]
}

function sortHubItems(items: HubLibraryItem[], sort: ContentSortId): HubLibraryItem[] {
  const copy = [...items]
  switch (sort) {
    case "oldest":
      return copy.sort((a, b) => a.dateSort - b.dateSort)
    case "title":
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    case "source":
      return copy.sort((a, b) => a.source.localeCompare(b.source) || b.dateSort - a.dateSort)
    case "newest":
    default:
      return copy.sort((a, b) => b.dateSort - a.dateSort)
  }
}

function matchesQuery(text: string, q: string) {
  return text.toLowerCase().includes(q)
}

const selectClass =
  "appearance-none rounded-full bg-white py-2 pl-3 pr-8 text-[12px] font-medium text-zinc-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] outline-none focus:ring-2 focus:ring-mind/20"

type KbDisplayMeta = {
  name: string
  description: string
  coverVariant: LibraryCoverVariant
  settings?: TeamLibrarySettings
  publicSettings?: PublicKbSettings
}

const WEB_BINDABLE_AGENTS = [MINDAR_COPILOT_AGENT, ...MINDAR_DEMO_MY_AGENTS]

function buildInitialTeamMeta(): Record<number, KbDisplayMeta> {
  return Object.fromEntries(
    MOCK_KNOWLEDGE_BASES.filter((k) => k.category === "team").map((kb) => [
      kb.id,
      {
        name: kb.name,
        description: kb.description,
        coverVariant: kb.coverVariant,
        settings: kb.teamSettings ?? { ...DEFAULT_TEAM_LIBRARY_SETTINGS },
      },
    ])
  )
}

function buildInitialPersonalMeta(): Record<number, KbDisplayMeta> {
  return Object.fromEntries(
    MOCK_KNOWLEDGE_BASES.filter((k) => k.category === "mine").map((kb) => [
      kb.id,
      { name: kb.name, description: kb.description, coverVariant: kb.coverVariant },
    ])
  )
}

function mergeKbWithMeta(kb: KnowledgeBase, meta?: KbDisplayMeta): KnowledgeBase {
  if (!meta) return kb
  const pub = meta.publicSettings
  return {
    ...kb,
    name: meta.name,
    description: meta.description,
    coverVariant: meta.coverVariant,
    ...(meta.settings ? { teamSettings: meta.settings } : {}),
    ...(pub
      ? {
          publicSettings: pub,
          isPublicPublished: pub.isPublic,
          ...(pub.isPublic
            ? {
                publicTagline: kb.publicTagline ?? "Public · Mindar agent",
                publisherName: kb.publisherName ?? "You",
              }
            : { isPublicPublished: false }),
        }
      : {}),
  }
}

export type WebKnowledgeIntegratedNav = boolean | "shell"

/** 知识库浏览 — 分类树 + 可搜索/排序/添加的内容列表 */
export function WebKnowledgeBrowser({
  integratedNav = false,
  onLibraryNavMount,
  selectedKbId,
  onSelectKb,
  onOpenWorkspace,
  onOpenDocument,
  onDeselectKb,
  onBrowsePlaza,
  requireAuthThen,
  knowledgeBases: knowledgeBasesProp,
  knowledgeBasesLoading = false,
  onRefreshKnowledgeBases,
  onCreateKnowledgeBase,
  onUpdateKnowledgeBase,
  onDeleteKnowledgeBase,
  onOpenKnowledgeBaseSettings,
  extraSubscribedKbs = [],
  recentKbIds = [],
  onKbCreated,
  onLibraryPublished,
}: {
  /** `true` = middle column; `shell` = mount library tree in primary nav via callback */
  integratedNav?: WebKnowledgeIntegratedNav
  onLibraryNavMount?: (node: ReactNode) => void
  selectedKbId: number | null
  onSelectKb: (kb: KnowledgeBase) => void
  onOpenWorkspace: (kb: KnowledgeBase) => void
  /** Open article reader for a library item (grid / list click). */
  onOpenDocument?: (kb: KnowledgeBase, item: WebKbHubListItem) => void
  onDeselectKb?: () => void
  onBrowsePlaza?: () => void
  requireAuthThen?: (run: () => void) => void
  /** Plaza subscriptions persisted in local demo store */
  extraSubscribedKbs?: KnowledgeBase[]
  /** When set, replaces demo MOCK_KNOWLEDGE_BASES (API-backed web shell) */
  knowledgeBases?: KnowledgeBase[]
  knowledgeBasesLoading?: boolean
  onRefreshKnowledgeBases?: () => void
  onCreateKnowledgeBase?: (payload: WebCreateKbPayload) => Promise<KnowledgeBase | null>
  onUpdateKnowledgeBase?: (kbId: number, payload: WebCreateKbPayload) => Promise<void>
  onDeleteKnowledgeBase?: (kbId: number) => Promise<void>
  /** Opens legacy Vue KB settings (chunking, models, datasources) — do not replace in React */
  onOpenKnowledgeBaseSettings?: (kbId: number) => void
  /** Recently opened libraries — shown above full sidebar sections */
  recentKbIds?: number[]
  /** After create — e.g. touch recents in parent shell */
  onKbCreated?: (kb: KnowledgeBase) => void
  /** When user publishes to plaza from the wizard */
  onLibraryPublished?: (kb: KnowledgeBase) => void
}) {
  const [expanded, setExpanded] = useState<Record<SidebarSectionId, boolean>>({
    mine: true,
    followed: true,
    team: true,
    published: true,
  })
  const [kbSearch, setKbSearch] = useState("")
  const [materialsView, setMaterialsView] = useState<"grid" | "list">("grid")
  const [kbSort, setKbSort] = useState<KbSortId>("recent")
  const [contentSearch, setContentSearch] = useState("")
  const [contentSort, setContentSort] = useState<ContentSortId>("newest")
  const [hubByKb, setHubByKb] = useState<Record<number, HubLibraryItem[]>>(buildInitialHubByKb)
  const [customKBs, setCustomKBs] = useState<KnowledgeBase[]>([])
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [openAddMenuForKbId, setOpenAddMenuForKbId] = useState<number | null>(null)
  const [teamMetaById, setTeamMetaById] = useState(buildInitialTeamMeta)
  const [personalMetaById, setPersonalMetaById] = useState(buildInitialPersonalMeta)
  const [shareOpen, setShareOpen] = useState(false)
  const [overflowOpen, setOverflowOpen] = useState(false)
  const [contentSearchOpen, setContentSearchOpen] = useState(false)
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [createDialogMode, setCreateDialogMode] = useState<WebCreateKbDialogMode | null>(null)
  const [previewLiked, setPreviewLiked] = useState(false)
  const [previewLikeCount, setPreviewLikeCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const useApiKbs =
    knowledgeBasesProp != null && knowledgeBasesProp.length > 0
  const allKBs = useMemo(() => {
    if (useApiKbs) return [...knowledgeBasesProp!]
    const baseIds = new Set([...MOCK_KNOWLEDGE_BASES, ...customKBs].map((k) => k.id))
    const extra = extraSubscribedKbs.filter((k) => !baseIds.has(k.id))
    return [...MOCK_KNOWLEDGE_BASES, ...customKBs, ...extra]
  }, [useApiKbs, knowledgeBasesProp, customKBs, extraSubscribedKbs])
  const nextKbId = useMemo(
    () => allKBs.reduce((max, kb) => Math.max(max, kb.id), 0) + 1,
    [allKBs]
  )

  const selectedBase = allKBs.find((k) => k.id === selectedKbId) ?? null
  const isSharedKb = selectedBase?.category === "team"
  const isPersonalKb = selectedBase?.category === "mine"
  const isSubscribedKb = selectedBase?.category === "subscribed"
  const isFollowingKb =
    isSubscribedKb && selectedBase != null && subscribedRoleOf(selectedBase) === "followed"
  const kbHubUploadDisabled = isFollowingKb
  const plazaSubscribed = selectedBase ? isLibrarySubscribed(selectedBase) : false

  const subscribedEngagement = useMemo(() => {
    if (!selectedBase || !isSubscribedKb) return null
    return engagementMetricsForKb(selectedBase.id, selectedBase.subscribers ?? 0, {
      likeCount: selectedBase.likeCount,
      commentCount: selectedBase.commentCount,
    })
  }, [selectedBase, isSubscribedKb])

  useEffect(() => {
    if (!selectedBase || !subscribedEngagement) return
    const liked = readPlazaLikedKbIds().has(selectedBase.id)
    setPreviewLiked(liked)
    setPreviewLikeCount(subscribedEngagement.likeCount + (liked ? 1 : 0))
  }, [selectedBase?.id, subscribedEngagement])
  const displayMeta =
    selectedBase && isSharedKb
      ? teamMetaById[selectedBase.id]
      : selectedBase && isPersonalKb
        ? personalMetaById[selectedBase.id]
        : undefined
  const selected = selectedBase ? mergeKbWithMeta(selectedBase, displayMeta) : null
  const kbQuery = kbSearch.trim().toLowerCase()
  const contentQuery = contentSearch.trim().toLowerCase()

  useEffect(() => {
    if (openAddMenuForKbId == null || selected?.id !== openAddMenuForKbId) return
    setAddMenuOpen(true)
    setOpenAddMenuForKbId(null)
  }, [openAddMenuForKbId, selected?.id])

  const runAuth = useCallback(
    (run: () => void) => {
      if (requireAuthThen) requireAuthThen(run)
      else run()
    },
    [requireAuthThen]
  )

  const kbForList = useCallback(
    (kb: KnowledgeBase) => {
      if (kb.category === "team") return mergeKbWithMeta(kb, teamMetaById[kb.id])
      if (kb.category === "mine") return mergeKbWithMeta(kb, personalMetaById[kb.id])
      return kb
    },
    [teamMetaById, personalMetaById]
  )

  const createDialogInitial = useMemo((): Partial<WebCreateKbPayload> | undefined => {
    if (!createDialogMode || createDialogMode.kind !== "edit" || !selectedBase) return undefined
    const meta =
      createDialogMode.category === "team"
        ? teamMetaById[selectedBase.id]
        : personalMetaById[selectedBase.id]
    return {
      name: meta?.name ?? selectedBase.name,
      description: meta?.description ?? selectedBase.description,
      coverVariant: meta?.coverVariant ?? selectedBase.coverVariant,
      category: createDialogMode.category,
      teamSettings: meta?.settings ?? selectedBase.teamSettings,
      publicSettings:
        meta?.publicSettings ??
        selectedBase.publicSettings ??
        defaultAgentSettingsForCreate(WEB_BINDABLE_AGENTS),
    }
  }, [createDialogMode, selectedBase, teamMetaById, personalMetaById])

  const completeLibraryCreate = useCallback(
    (kb: KnowledgeBase, payload: WebCreateKbPayload) => {
      onSelectKb(kb)
      onKbCreated?.(kb)
      const published = Boolean(payload.publicSettings?.isPublic)
      if (published) {
        onLibraryPublished?.(kb)
        setExpanded((e) => ({ ...e, published: true }))
        toast.success("Published to plaza", {
          description: `“${publicAgentDisplayName(payload.publicSettings)}” is live in Published.`,
          action: onBrowsePlaza
            ? {
                label: "View plaza",
                onClick: () => onBrowsePlaza(),
              }
            : undefined,
        })
      } else {
        toast.success("Library created", {
          description: `"${kb.name}" is ready — add sources to power cited answers.`,
          action: {
            label: "Add sources",
            onClick: () => setOpenAddMenuForKbId(kb.id),
          },
        })
      }
    },
    [onSelectKb, onKbCreated, onLibraryPublished, onBrowsePlaza]
  )

  const handleCreateOrEditKb = useCallback(
    (payload: WebCreateKbPayload) => {
      if (!createDialogMode) return
      if (createDialogMode.kind === "create") {
        if (onCreateKnowledgeBase) {
          void onCreateKnowledgeBase(payload).then((kb) => {
            if (!kb) return
            onRefreshKnowledgeBases?.()
            completeLibraryCreate(kb, payload)
          })
          return
        }
        const kb = knowledgeBaseFromWebCreate(payload, nextKbId)
        setCustomKBs((prev) => [kb, ...prev])
        setHubByKb((prev) => ({ ...prev, [kb.id]: [] }))
        const meta: KbDisplayMeta = {
          name: kb.name,
          description: kb.description,
          coverVariant: kb.coverVariant,
          settings: kb.teamSettings,
          publicSettings: kb.publicSettings ?? payload.publicSettings,
        }
        if (kb.category === "team") {
          setTeamMetaById((prev) => ({ ...prev, [kb.id]: meta }))
        } else {
          setPersonalMetaById((prev) => ({ ...prev, [kb.id]: meta }))
        }
        completeLibraryCreate(kb, payload)
        return
      }
      const id = createDialogMode.kbId
      if (onUpdateKnowledgeBase) {
        void onUpdateKnowledgeBase(id, payload).then(() => {
          onRefreshKnowledgeBases?.()
        })
        return
      }
      const meta: KbDisplayMeta = {
        name: payload.name,
        description: payload.description,
        coverVariant: payload.coverVariant,
        ...(payload.teamSettings ? { settings: payload.teamSettings } : {}),
        publicSettings: payload.publicSettings,
      }
      if (customKBs.some((k) => k.id === id)) {
        setCustomKBs((prev) =>
          prev.map((k) =>
            k.id === id
              ? {
                  ...k,
                  name: payload.name,
                  description: payload.description,
                  coverVariant: payload.coverVariant,
                  teamSettings: payload.teamSettings ?? k.teamSettings,
                  publicSettings: payload.publicSettings,
                  isPublicPublished: payload.publicSettings?.isPublic,
                  ...(payload.publicSettings?.isPublic
                    ? {
                        publicTagline: k.publicTagline ?? "Public · Mindar agent",
                        publisherName: "You",
                      }
                    : {}),
                }
              : k
          )
        )
      }
      if (createDialogMode.category === "team") {
        setTeamMetaById((prev) => ({ ...prev, [id]: meta }))
      } else {
        setPersonalMetaById((prev) => ({ ...prev, [id]: meta }))
      }
      const wasPublished = payload.publicSettings?.isPublic
      if (wasPublished) {
        const updated =
          customKBs.find((k) => k.id === id) ??
          allKBs.find((k) => k.id === id)
        if (updated) {
          onLibraryPublished?.({
            ...updated,
            name: payload.name,
            description: payload.description,
            publicSettings: payload.publicSettings,
            isPublicPublished: true,
          })
        }
      }
      toast.success("Library updated", {
        description: wasPublished ? `"${payload.name}" plaza listing saved.` : `"${payload.name}" saved.`,
      })
    },
    [createDialogMode, nextKbId, customKBs, allKBs, onSelectKb, completeLibraryCreate, onLibraryPublished]
  )

  const recentKbs = useMemo(
    () =>
      recentKbIds
        .map((id) => allKBs.find((k) => k.id === id))
        .filter((k): k is KnowledgeBase => Boolean(k))
        .slice(0, 5),
    [allKBs, recentKbIds]
  )

  const grouped = useMemo(() => {
    const subscribed = allKBs.filter((k) => k.category === "subscribed")
    const publishedOwned = allKBs.filter(
      (k) =>
        (k.category === "mine" || k.category === "team") &&
        k.isPublicPublished &&
        k.publicSettings?.isPublic
    )
    const base: Record<SidebarSectionId, KnowledgeBase[]> = {
      mine: allKBs.filter((k) => k.category === "mine"),
      followed: subscribed.filter((kb) => subscribedRoleOf(kb) === "followed"),
      team: allKBs.filter((k) => k.category === "team"),
      published: [
        ...subscribed.filter((kb) => subscribedRoleOf(kb) === "published"),
        ...publishedOwned,
      ],
    }
    const filtered = Object.fromEntries(
      SIDEBAR_SECTIONS.map((s) => [
        s.id,
        base[s.id].filter(
          (kb) =>
            !kbQuery ||
            matchesQuery(kb.name, kbQuery) ||
            matchesQuery(kb.description, kbQuery)
        ),
      ])
    ) as Record<SidebarSectionId, KnowledgeBase[]>
    return Object.fromEntries(
      SIDEBAR_SECTIONS.map((s) => [
        s.id,
        s.id === "followed"
          ? sortFollowingLibraries(filtered[s.id], kbSort)
          : sortKnowledgeBases(filtered[s.id], kbSort),
      ])
    ) as Record<SidebarSectionId, KnowledgeBase[]>
  }, [allKBs, kbQuery, kbSort])

  const integratedLayout = integratedNav === true || integratedNav === "shell"

  const libraryNavPanel = useMemo(
    () => (
      <WebLibraryNavPanel
        grouped={grouped}
        selectedKbId={selectedKbId}
        searchQuery={kbSearch}
        onSearchQueryChange={setKbSearch}
        onSelectKb={onSelectKb}
        onCreateInSection={(sectionId) =>
          runAuth(() =>
            setCreateDialogMode({
              kind: "create",
              category: sectionId === "team" ? "team" : "mine",
            })
          )
        }
        recentKbs={recentKbs}
        embeddedInShell={integratedNav === "shell"}
      />
    ),
    [
      grouped,
      selectedKbId,
      kbSearch,
      onSelectKb,
      recentKbs,
      integratedNav,
      runAuth,
    ]
  )

  useEffect(() => {
    if (integratedNav !== "shell" || !onLibraryNavMount) return
    onLibraryNavMount(libraryNavPanel)
    return () => onLibraryNavMount(null)
  }, [integratedNav, onLibraryNavMount, libraryNavPanel])

  useEffect(() => {
    if (!kbQuery) return
    setExpanded({ mine: true, followed: true, team: true, published: true })
  }, [kbQuery])

  useEffect(() => {
    setOverflowOpen(false)
    setShareOpen(false)
    setCreateDialogMode(null)
    setAddMenuOpen(false)
  }, [selectedKbId])

  const hubItems = selected ? hubByKb[selected.id] ?? [] : []

  const visibleHubItems = useMemo(() => {
    let list = hubItems
    if (contentQuery) {
      list = list.filter(
        (item) =>
          matchesQuery(item.title, contentQuery) ||
          matchesQuery(item.source, contentQuery) ||
          matchesQuery(item.author, contentQuery)
      )
    }
    return sortHubItems(list, contentSort)
  }, [hubItems, contentQuery, contentSort])

  const addHubItems = useCallback(
    (kbId: number, items: HubLibraryItem[]) => {
      if (items.length === 0) return
      setHubByKb((prev) => ({
        ...prev,
        [kbId]: [...(prev[kbId] ?? []), ...items],
      }))
    },
    []
  )

  const ingestFiles = useCallback(
    (files: FileList | null, sourceLabel: string) => {
      if (kbHubUploadDisabled || !selected || !files?.length) return
      const now = Date.now()
      const added = Array.from(files).map((file, i) => ({
        id: now + i,
        title: file.name.replace(/\.[^.]+$/, "") || file.name,
        source: sourceLabel,
        author: "Me",
        date: "Just now",
        dateSort: now + i,
      }))
      addHubItems(selected.id, added)
      toast.success(
        added.length === 1 ? "File added" : `${added.length} files added`,
        { description: `Added to “${selected.name}”.` }
      )
    },
    [selected, addHubItems, kbHubUploadDisabled]
  )

  const addLinkItem = useCallback(() => {
    if (kbHubUploadDisabled || !selected) return
    const url = window.prompt("Paste a link URL")
    if (!url?.trim()) return
    let title = url.trim()
    try {
      title = new URL(url.trim()).hostname.replace(/^www\./, "")
    } catch {
      /* keep raw */
    }
    const now = Date.now()
    addHubItems(selected.id, [
      {
        id: now,
        title,
        source: "Link",
        author: "Me",
        date: "Just now",
        dateSort: now,
      },
    ])
    toast.success("Link added", { description: url.trim().slice(0, 80) })
  }, [selected, addHubItems, kbHubUploadDisabled])

  const addNoteItem = useCallback(() => {
    if (kbHubUploadDisabled || !selected) return
    const title = window.prompt("Note title")?.trim()
    if (!title) return
    const now = Date.now()
    addHubItems(selected.id, [
      {
        id: now,
        title,
        source: "Note",
        author: "Me",
        date: "Just now",
        dateSort: now,
      },
    ])
    toast.success("Note added")
  }, [selected, addHubItems, kbHubUploadDisabled])

  function handleHubAddSource(action: KnowledgeAddSourceAction) {
    setAddMenuOpen(false)
    if (kbHubUploadDisabled) {
      toast.message("Read-only library", {
        description: "Following libraries cannot accept uploads — open workspace to browse and chat.",
      })
      return
    }
    runAuth(() => {
      switch (action) {
        case "local-file":
          fileInputRef.current?.click()
          break
        case "local-folder":
          folderInputRef.current?.click()
          break
        case "personal-kb":
          toast.message("Personal library", { description: "Import from another library (demo)." })
          break
        case "web-link":
          addLinkItem()
          break
        case "note-text":
          addNoteItem()
          break
        case "note-rich":
          addNoteItem()
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

  const addFilesMenu = (
    <>
      {addMenuOpen ? (
        <div className="absolute right-0 top-full z-50 mt-1.5">
          <KnowledgeAddSourceMenu
            variant="dropdown"
            locale="en"
            open={addMenuOpen}
            onClose={() => setAddMenuOpen(false)}
            onAction={handleHubAddSource}
          />
        </div>
      ) : null}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          ingestFiles(e.target.files, "File")
          e.target.value = ""
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        className="hidden"
        {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
        onChange={(e) => {
          ingestFiles(e.target.files, "Folder")
          e.target.value = ""
        }}
      />
    </>
  )

  const handleCloudDrive = useCallback(() => {
    runAuth(() =>
      toast.message("Cloud drive", {
        description: "Connect Google Drive or OneDrive (demo).",
      })
    )
  }, [runAuth])

  const handlePasteText = useCallback(() => {
    runAuth(() => {
      const text = window.prompt("Paste text content")?.trim()
      if (!text) return
      if (!selected) return
      const title = text.slice(0, 48) + (text.length > 48 ? "…" : "")
      const now = Date.now()
      addHubItems(selected.id, [
        {
          id: now,
          title: title || "Pasted text",
          source: "Text",
          author: "Me",
          date: "Just now",
          dateSort: now,
        },
      ])
      toast.success("Text added")
    })
  }, [addHubItems, isSharedKb, runAuth, selected])

  const openHubItem = useCallback(
    (item: WebKbHubListItem) => {
      if (!selected) return
      if (onOpenDocument) {
        onOpenDocument(selected, item)
      } else {
        onOpenWorkspace(selected)
      }
    },
    [onOpenDocument, onOpenWorkspace, selected]
  )

  const sortPopover = (
    <div className="overflow-hidden rounded-xl border border-stone-200/90 bg-white py-1 shadow-lg">
      {CONTENT_SORT_OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => {
            setContentSort(o.id)
            setSortMenuOpen(false)
          }}
          className={cn(
            "flex w-full px-3 py-2 text-left text-[13px] text-zinc-700 hover:bg-stone-50",
            contentSort === o.id && "font-semibold text-mind"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )

  const sharedKbMemberCount =
    selectedBase?.subscribers ??
    (selectedBase?.teamRole === "owner" ? 6 : selectedBase ? Math.max(3, Math.min(24, Math.round(selectedBase.count / 12))) : undefined)

  const sharedKbCreatedLabel = selected
    ? `Updated ${selected.lastUpdate}${selectedBase?.teamRole === "owner" ? " · You created" : ""}`
    : undefined

  const hubListBody = (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {visibleHubItems.length === 0 && !contentQuery ? (
        kbHubUploadDisabled ? (
          <WebLibraryContentEmpty
            libraryName={selected?.name ?? "Library"}
            readOnly
            onOpenWorkspace={selected ? () => onOpenWorkspace(selected) : undefined}
          />
        ) : (
          <div className="space-y-4 py-6 sm:py-10">
            <WebLibraryContentEmpty
              libraryName={selected?.name ?? "Library"}
              onAddFirst={() => runAuth(() => handleHubAddSource("local-file"))}
            />
            <KnowledgeUploadGuide
              locale="en"
              hideActionPills
              itemCount={hubItems.length}
              onFiles={(files) => runAuth(() => ingestFiles(files, "Files"))}
              onWebsite={() => runAuth(addLinkItem)}
              onCloudDrive={handleCloudDrive}
              onPasteText={handlePasteText}
            />
            {selected ? (
              <KnowledgeAddSourceMenu variant="panel" locale="en" onAction={handleHubAddSource} />
            ) : null}
          </div>
        )
      ) : visibleHubItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-[14px] font-medium text-zinc-600">
            No content matches your search
          </p>
          <p className="mt-2 max-w-xs text-[13px] text-zinc-500">
            Try another keyword or clear the search box.
          </p>
        </div>
      ) : selected ? (
        integratedLayout ? (
          materialsView === "grid" ? (
            <WebKbMaterialsGrid items={visibleHubItems} onOpenItem={openHubItem} />
          ) : (
            <WebKbMaterialsList items={visibleHubItems} onOpenItem={openHubItem} />
          )
        ) : (
          <WebKbHubContentList
            items={visibleHubItems}
            onOpenItem={openHubItem}
            emptyMessage={
              contentQuery ? "No content matches your search." : "No content in this library yet."
            }
          />
        )
      ) : null}
    </div>
  )

  return (
    <div className={cn("flex h-full min-h-0", web.canvas)}>
      {integratedNav === true ? libraryNavPanel : null}
      {!integratedLayout ? (
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col overflow-hidden",
          web.secondaryWidth,
          "bg-transparent"
        )}
      >
        <div className="shrink-0 space-y-2.5 border-b border-black/[0.05] px-2.5 pb-3.5 pt-4">
          <div className={web.kbCreateRow}>
            <button
              type="button"
              onClick={() =>
                runAuth(() => setCreateDialogMode({ kind: "create", category: "mine" }))
              }
              className={cn(web.kbCreateBtn, "text-white ring-1 ring-black/[0.06]", web.kbPrimaryBtn)}
            >
              <Plus className="h-3.5 w-3.5 shrink-0 opacity-95" strokeWidth={2.5} aria-hidden />
              <span>New personal</span>
            </button>
            <button
              type="button"
              onClick={() =>
                runAuth(() => setCreateDialogMode({ kind: "create", category: "team" }))
              }
              className={cn(web.kbCreateBtn, web.kbPrimaryBtnOutline)}
            >
              <Users className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2.25} aria-hidden />
              <span>New shared</span>
            </button>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={kbSearch}
              onChange={(e) => setKbSearch(e.target.value)}
              placeholder="Search libraries"
              className="w-full rounded-lg bg-white py-2 pl-8 pr-2 text-[12px] text-zinc-700 ring-1 ring-black/[0.04] outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-mind/20"
              aria-label="Search libraries"
            />
          </div>
          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <select
              value={kbSort}
              onChange={(e) => setKbSort(e.target.value as KbSortId)}
              className={cn(selectClass, "w-full pl-8")}
              aria-label="Sort libraries"
            >
              {KB_SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-2 pt-3 pb-0">
          {recentKbs.length > 0 ? (
            <div>
              <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Recent
              </p>
              <ul className="mt-0.5 space-y-0.5 pl-1">
                {recentKbs.map((kb) => {
                  const displayKb = kbForList(kb)
                  const active = selectedKbId === kb.id
                  const itemCount = hubByKb[kb.id]?.length ?? kb.count
                  return (
                    <li key={`recent-${kb.id}`}>
                      <button
                        type="button"
                        onClick={() => onSelectKb(kb)}
                        className={webNavListItem(active, {
                          className:
                            "flex w-full items-center gap-2 px-2.5 py-2 text-left text-[13px] font-medium",
                        })}
                      >
                        <LibraryListThumbnail kb={displayKb} size="sm" />
                        <span className="min-w-0 flex-1 truncate text-zinc-700">{displayKb.name}</span>
                        <span
                          className={cn(
                            "shrink-0 tabular-nums text-[10px]",
                            active ? web.navItemActiveCount : "text-zinc-400"
                          )}
                        >
                          {itemCount}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <p
                id="web-all-libraries"
                className="mt-3 px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400"
              >
                All libraries
              </p>
            </div>
          ) : null}

          {SIDEBAR_SECTIONS.map((section) => {
            const items = grouped[section.id]
            const open = expanded[section.id]
            const isFollowingSection = section.id === "followed"

            return (
              <div key={section.id}>
                <button
                  type="button"
                  onClick={() => setExpanded((e) => ({ ...e, [section.id]: !e[section.id] }))}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-zinc-900/[0.04]"
                >
                  <span className="text-[14px] font-bold text-zinc-800">{section.label}</span>
                  <div className="flex items-center gap-1">
                    {section.canCreate ? (
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation()
                          runAuth(() =>
                            setCreateDialogMode({
                              kind: "create",
                              category: section.id === "team" ? "team" : "mine",
                            })
                          )
                        }}
                        className="inline-flex items-center gap-0.5 rounded-md bg-mind/10 px-1.5 py-0.5 text-mind hover:bg-mind/15"
                        aria-label={`New ${section.label} library`}
                      >
                        <Plus className="h-3 w-3" strokeWidth={2.25} />
                      </button>
                    ) : null}
                    <ChevronRight
                      className={cn("h-3.5 w-3.5 text-zinc-400 transition-transform", open && "rotate-90")}
                    />
                  </div>
                </button>
                {open ? (
                  <div className="mt-0.5 space-y-2 pl-0.5">
                    {items.length === 0 ? (
                      <div className="px-1 py-1">
                        {kbQuery ? (
                          <p className="px-1 text-[12px] text-zinc-500">No libraries match your search.</p>
                        ) : (
                          <WebLibrarySectionEmpty
                            sectionId={section.id}
                            onBrowsePlaza={section.browsePlaza ? () => onBrowsePlaza?.() : undefined}
                            onCreate={
                              section.canCreate
                                ? () =>
                                    runAuth(() =>
                                      setCreateDialogMode({
                                        kind: "create",
                                        category: section.id === "team" ? "team" : "mine",
                                      })
                                    )
                                : undefined
                            }
                          />
                        )}
                      </div>
                    ) : (
                      <ul className="mt-0.5 space-y-0.5 pl-1">
                        {items.map((kb) => {
                          const displayKb = kbForList(kb)
                          const active = selectedKbId === kb.id
                          const itemCount = hubByKb[kb.id]?.length ?? kb.count
                          return (
                            <li key={kb.id}>
                              <button
                                type="button"
                                onClick={() => onSelectKb(kb)}
                                className={webNavListItem(active, {
                                  className: cn(
                                    "flex w-full items-center gap-2 text-left text-[13px] font-medium",
                                    isFollowingSection ? "gap-2.5 px-2 py-2" : "gap-2 px-2.5 py-2"
                                  ),
                                })}
                              >
                                <div className="relative shrink-0">
                                  <LibraryListThumbnail kb={displayKb} size="sm" />
                                  {isFollowingSection && kb.hasContentUpdate ? (
                                    <KbContentUpdateDot className="-translate-y-px translate-x-px" />
                                  ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="flex flex-wrap items-center gap-1 truncate text-zinc-700">
                                    <span className="truncate">{displayKb.name}</span>
                                    <KbListMetaBadges kb={displayKb} />
                                  </span>
                                  {isFollowingSection ? (
                                    <span className="mt-0.5 block truncate text-[10px] tabular-nums text-zinc-400">
                                      Updated {kb.lastUpdate}
                                    </span>
                                  ) : (
                                    <span
                                      className={cn(
                                        "mt-0.5 block text-[10px] tabular-nums",
                                        active ? web.navItemActiveCount : "text-zinc-400"
                                      )}
                                    >
                                      {itemCount} items
                                    </span>
                                  )}
                                </div>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                    {section.browsePlaza ? (
                      <button
                        type="button"
                        onClick={() =>
                          runAuth(() => {
                            if (onBrowsePlaza) onBrowsePlaza()
                            else
                              toast.message("Library plaza", {
                                description: "Discover libraries to subscribe.",
                              })
                          })
                        }
                        className={web.kbPlazaBrowseLink}
                      >
                        Browse library plaza
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </aside>
      ) : null}

      <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
        {selected ? (
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-hidden",
              integratedLayout ? "mx-0" : cn("mx-6 my-6", web.surfaceCard)
            )}
          >
            {integratedLayout && isSharedKb ? (
              <>
                <WebSharedKbHeader
                  size="detail"
                  title={selected.name}
                  description={selected.description}
                  coverVariant={selected.coverVariant}
                  ownerName={selectedBase?.ownerName}
                  memberCount={sharedKbMemberCount}
                  createdLabel={sharedKbCreatedLabel}
                  onShare={() => runAuth(() => setShareOpen(true))}
                  overflowOpen={overflowOpen}
                  onOverflowToggle={() => setOverflowOpen((o) => !o)}
                  onEditInfo={() =>
                    runAuth(() =>
                      setCreateDialogMode({ kind: "edit", category: "team", kbId: selected.id })
                    )
                  }
                  onPermissionSettings={() =>
                    runAuth(() =>
                      onOpenKnowledgeBaseSettings
                        ? onOpenKnowledgeBaseSettings(selected.id)
                        : setCreateDialogMode({ kind: "edit", category: "team", kbId: selected.id })
                    )
                  }
                  onAddQuickAccess={() =>
                    runAuth(() =>
                      toast.success("Added to quick access", {
                        description: `"${selected.name}" will appear in the sidebar shortcuts (demo).`,
                      })
                    )
                  }
                  onLeaveLibrary={() =>
                    runAuth(() => {
                      if (window.confirm(`Leave "${selected.name}"?`)) {
                        toast.message("Left library", { description: "Demo: removed from shared list." })
                        onDeselectKb?.()
                      }
                    })
                  }
                />
                <WebSharedKbContentBar
                  itemCount={hubItems.length}
                  resultCount={contentQuery ? visibleHubItems.length : undefined}
                  searching={contentSearchOpen}
                  contentSearch={contentSearch}
                  onContentSearchChange={setContentSearch}
                  onToggleSearch={() => setContentSearchOpen((o) => !o)}
                  sortOpen={sortMenuOpen}
                  onSortToggle={() => setSortMenuOpen((o) => !o)}
                  sortControl={sortPopover}
                  onAddClick={() => runAuth(() => setAddMenuOpen((o) => !o))}
                  addMenu={addFilesMenu}
                />
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-b border-black/[0.04] px-5 pb-3 lg:px-8">
                  <div className="mr-auto flex items-center gap-1 rounded-xl bg-stone-100/90 p-0.5 ring-1 ring-black/[0.04]">
                    <button
                      type="button"
                      onClick={() => setMaterialsView("grid")}
                      className={cn(
                        "rounded-lg p-2 transition-colors",
                        materialsView === "grid"
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-700"
                      )}
                      aria-label="Grid view"
                      aria-pressed={materialsView === "grid"}
                    >
                      <LayoutGrid className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMaterialsView("list")}
                      className={cn(
                        "rounded-lg p-2 transition-colors",
                        materialsView === "list"
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-700"
                      )}
                      aria-label="List view"
                      aria-pressed={materialsView === "list"}
                    >
                      <List className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenWorkspace(selected)}
                    className={cn(
                      "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-[14px] font-semibold",
                      web.kbPrimaryBtn
                    )}
                  >
                    Open workspace
                  </button>
                </div>
              </>
            ) : integratedLayout ? (
              <>
                {isPersonalKb ? (
                  <WebPersonalKbHeader
                    title={selected.name}
                    description={selected.description}
                    coverVariant={selected.coverVariant}
                    hasContentUpdate={isFollowingKb ? selectedBase?.hasContentUpdate : undefined}
                    overflowOpen={overflowOpen}
                    onOverflowToggle={() => setOverflowOpen((o) => !o)}
                    onEditInfo={() =>
                      runAuth(() =>
                        setCreateDialogMode({ kind: "edit", category: "mine", kbId: selected.id })
                      )
                    }
                    onAddQuickAccess={() =>
                      runAuth(() =>
                        toast.success("Added to quick access", {
                          description: `"${selected.name}" pinned to shortcuts (demo).`,
                        })
                      )
                    }
                    onDeleteLibrary={
                      customKBs.some((k) => k.id === selected.id)
                        ? () =>
                            runAuth(() => {
                              if (!window.confirm(`Remove "${selected.name}"?`)) return
                              setCustomKBs((prev) => prev.filter((k) => k.id !== selected.id))
                              onDeselectKb?.()
                              toast.message("Library removed")
                            })
                        : undefined
                    }
                  />
                ) : (
                  <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/45 bg-white/40 px-5 py-3 backdrop-blur-md lg:px-8">
                    <h1 className={cn("min-w-0 break-words", web.typePageTitle)}>{selected.name}</h1>
                    <div className="flex shrink-0 items-center gap-1 rounded-xl bg-stone-100/90 p-0.5 ring-1 ring-black/[0.04]">
                      <button
                        type="button"
                        onClick={() => setMaterialsView("grid")}
                        className={cn(
                          "rounded-lg p-2 transition-colors",
                          materialsView === "grid"
                            ? "bg-white text-zinc-900 shadow-sm"
                            : "text-zinc-500 hover:text-zinc-700"
                        )}
                        aria-label="Grid view"
                        aria-pressed={materialsView === "grid"}
                      >
                        <LayoutGrid className="h-4 w-4" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMaterialsView("list")}
                        className={cn(
                          "rounded-lg p-2 transition-colors",
                          materialsView === "list"
                            ? "bg-white text-zinc-900 shadow-sm"
                            : "text-zinc-500 hover:text-zinc-700"
                        )}
                        aria-label="List view"
                        aria-pressed={materialsView === "list"}
                      >
                        <List className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : null}
            {!integratedLayout ? (
            <WebKbDetailHero
              title={selected.name}
              description={
                isSharedKb
                  ? [SHARED_KB_PRODUCT_LINE, selected.description].filter(Boolean).join(" · ")
                  : selected.description
              }
              cover={
                isFollowingKb ? (
                  <LibraryCoverWithUpdateBadge
                    kb={selected}
                    hasUpdate={selectedBase?.hasContentUpdate}
                    coverClassName="h-[72px] w-[72px] rounded-2xl"
                  />
                ) : (
                  <div className="h-[72px] w-[72px] overflow-hidden rounded-2xl">
                    <LibraryCoverFromKb
                      kb={selected}
                      showMiniUi={false}
                      size="lg"
                      className="h-full w-full"
                    />
                  </div>
                )
              }
              actions={
                isSharedKb ? (
                  <>
                    <button
                      type="button"
                      onClick={() => runAuth(() => setShareOpen(true))}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-stone-100 hover:text-zinc-800"
                      aria-label="Share library"
                    >
                      <Share2 className="h-5 w-5" strokeWidth={1.75} />
                    </button>
                    <WebKbOverflowMenu
                      open={overflowOpen}
                      onToggle={() => setOverflowOpen((o) => !o)}
                      onEditInfo={() =>
                        runAuth(() =>
                          setCreateDialogMode({ kind: "edit", category: "team", kbId: selected.id })
                        )
                      }
                      onPermissionSettings={() =>
                        runAuth(() =>
                          onOpenKnowledgeBaseSettings
                            ? onOpenKnowledgeBaseSettings(selected.id)
                            : setCreateDialogMode({ kind: "edit", category: "team", kbId: selected.id })
                        )
                      }
                      onAddQuickAccess={() =>
                        runAuth(() =>
                          toast.success("Added to quick access", {
                            description: `"${selected.name}" will appear in the sidebar shortcuts (demo).`,
                          })
                        )
                      }
                      onLeaveLibrary={() =>
                        runAuth(() => {
                          if (window.confirm(`Leave "${selected.name}"?`)) {
                            toast.message("Left library", { description: "Demo: removed from shared list." })
                            onDeselectKb?.()
                          }
                        })
                      }
                    />
                  </>
                ) : (
                  <WebKbOverflowMenu
                    open={overflowOpen}
                    onToggle={() => setOverflowOpen((o) => !o)}
                    onEditInfo={
                      isFollowingKb
                        ? undefined
                        : () =>
                            runAuth(() =>
                              setCreateDialogMode({ kind: "edit", category: "mine", kbId: selected.id })
                            )
                    }
                    onAddQuickAccess={() =>
                      runAuth(() =>
                        toast.success("Added to quick access", {
                          description: `"${selected.name}" pinned to shortcuts (demo).`,
                        })
                      )
                    }
                    onLeaveLibrary={
                      customKBs.some((k) => k.id === selected.id)
                        ? () =>
                            runAuth(() => {
                              if (!window.confirm(`Remove "${selected.name}"?`)) return
                              setCustomKBs((prev) => prev.filter((k) => k.id !== selected.id))
                              onDeselectKb?.()
                              toast.message("Library removed")
                            })
                        : undefined
                    }
                    leaveLabel="Remove library"
                    showPermissions={false}
                    showLeave={customKBs.some((k) => k.id === selected.id)}
                  />
                )
              }
              engagement={
                isSubscribedKb && selectedBase && subscribedEngagement ? (
                  <>
                    <PublicKbEngagementStats
                      metrics={{
                        subscriberCount: selectedBase.subscribers ?? 0,
                        likeCount: previewLikeCount,
                        commentCount: subscribedEngagement.commentCount,
                      }}
                    />
                    <PublicKbEngagementBar
                      metrics={{
                        subscriberCount: selectedBase.subscribers ?? 0,
                        likeCount: previewLikeCount,
                        commentCount: subscribedEngagement.commentCount,
                      }}
                      subscribed={plazaSubscribed}
                      liked={previewLiked}
                      onToggleSubscribe={() =>
                        runAuth(() => {
                          if (plazaSubscribed) {
                            unsubscribePlazaLibrary(selectedBase.id)
                            toast.message("Unsubscribed", {
                              description: `"${selected.name}" removed from following.`,
                            })
                          } else {
                            subscribePlazaLibrary(selectedBase)
                            toast.success("Subscribed", {
                              description: `"${selected.name}" added to your libraries.`,
                            })
                          }
                          onRefreshKnowledgeBases?.()
                        })
                      }
                      onToggleLike={() =>
                        runAuth(() => {
                          setPreviewLiked((prev) => {
                            const next = !prev
                            setPreviewLikeCount((c) => (prev ? Math.max(0, c - 1) : c + 1))
                            const liked = readPlazaLikedKbIds()
                            if (next) liked.add(selectedBase.id)
                            else liked.delete(selectedBase.id)
                            writePlazaLikedKbIds(liked)
                            return next
                          })
                        })
                      }
                      onOpenComments={() => runAuth(() => onOpenWorkspace(selected))}
                      onOpenChat={() => runAuth(() => onOpenWorkspace(selected))}
                    />
                  </>
                ) : undefined
              }
              meta={
                <>
                  {isSharedKb && selectedBase?.ownerName ? (
                    <span className="font-medium text-zinc-500">{selectedBase.ownerName}</span>
                  ) : null}
                  {isSharedKb && selectedBase?.ownerName ? (
                    <span className="text-zinc-300"> · </span>
                  ) : null}
                  {isSharedKb && sharedKbMemberCount != null ? (
                    <>
                      <span>{sharedKbMemberCount} joined</span>
                      <span className="text-zinc-300"> · </span>
                    </>
                  ) : null}
                  <span>
                    {hubItems.length} items · Updated {selected.lastUpdate}
                    {isFollowingKb ? " · Read-only (following)" : ""}
                  </span>
                </>
              }
            />
            ) : null}
            {!(integratedLayout && isSharedKb) ? (
              <WebKbDetailToolbar
                searchValue={contentSearch}
                onSearchChange={setContentSearch}
                sortControl={
                  <WebKbDetailSortSelect
                    value={contentSort}
                    onChange={(v) => setContentSort(v as ContentSortId)}
                    options={CONTENT_SORT_OPTIONS}
                  />
                }
                trailing={
                  <>
                    {!kbHubUploadDisabled ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => runAuth(() => setAddMenuOpen((o) => !o))}
                          className={cn(web.kbPill, "gap-2 px-4 py-2.5 text-[13px] font-semibold")}
                        >
                          <KbUploadFileIcon className="h-4 w-4" strokeWidth={2} />
                          Add files
                          <ChevronDown
                            className={cn("h-3.5 w-3.5 transition-transform", addMenuOpen && "rotate-180")}
                          />
                        </button>
                        {addFilesMenu}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onOpenWorkspace(selected)}
                      className={cn(
                        "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-[14px] font-semibold",
                        web.kbPrimaryBtn
                      )}
                    >
                      Open workspace
                    </button>
                  </>
                }
                sectionLabel="Content"
                sectionHint={
                  contentQuery
                    ? `${visibleHubItems.length} match${visibleHubItems.length === 1 ? "" : "es"}`
                    : `${hubItems.length} item${hubItems.length === 1 ? "" : "s"}`
                }
              />
            ) : null}

            {hubListBody}

            {isSharedKb ? (
              <WebKbShareDialog
                open={shareOpen && Boolean(selected)}
                onClose={() => setShareOpen(false)}
                name={selected?.name ?? ""}
                description={selected?.description}
                coverVariant={selected?.coverVariant ?? "product"}
                creatorName={selectedBase?.ownerName}
                tags={selected?.description}
                joinMode={selected?.teamSettings?.joinMode}
                onJoinModeClick={() => {
                  setShareOpen(false)
                  if (selectedBase) {
                    runAuth(() =>
                      setCreateDialogMode({ kind: "edit", category: "team", kbId: selectedBase.id })
                    )
                  }
                }}
              />
            ) : null}

            <WebCreateKbDialog
              open={Boolean(createDialogMode)}
              mode={createDialogMode}
              initial={createDialogInitial}
              bindableAgents={WEB_BINDABLE_AGENTS}
              onClose={() => setCreateDialogMode(null)}
              onSubmit={handleCreateOrEditKb}
            />
          </div>
        ) : integratedLayout ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-8">
            <WebLibraryHubWelcome
              variant="panel"
              onBrowsePlaza={() => onBrowsePlaza?.()}
              onCreatePersonal={() =>
                runAuth(() => setCreateDialogMode({ kind: "create", category: "mine" }))
              }
              onCreateShared={() =>
                runAuth(() => setCreateDialogMode({ kind: "create", category: "team" }))
              }
            />
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-8 py-10">
            <WebLibraryHubWelcome
              onBrowsePlaza={() => onBrowsePlaza?.()}
              onCreatePersonal={() =>
                runAuth(() => setCreateDialogMode({ kind: "create", category: "mine" }))
              }
              onCreateShared={() =>
                runAuth(() => setCreateDialogMode({ kind: "create", category: "team" }))
              }
            />
          </div>
        )}
      </section>
    </div>
  )
}
