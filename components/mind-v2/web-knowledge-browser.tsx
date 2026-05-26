"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavListItem } from "@/components/mind-v2/web-nav-selection"
import { KnowledgeUploadGuide } from "@/components/mind-v2/knowledge-upload-guide"
import {
  KnowledgeAddSourceMenu,
  type KnowledgeAddSourceAction,
} from "@/components/mind-v2/knowledge-add-source-menu"
import { LibraryCover, LibraryCoverFromKb, LibraryCoverWithUpdateBadge } from "@/components/mind-v2/library-cover"
import { HubItemThumb } from "@/components/mind-v2/mind-media-art"
import { hubItemKindFromLabel } from "@/lib/product-media"
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
import { publicAgentDisplayName } from "@/lib/public-kb-settings"
import { WebKbShareDialog } from "@/components/mind-v2/web-kb-share-dialog"
import {
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
  Link2,
  Plus,
  Search,
  Store,
  Upload,
} from "lucide-react"

type SidebarSectionId = "mine" | "followed" | "team" | "published"

/** Sidebar order: Personal → Following → Shared → Published */
const SIDEBAR_SECTIONS: {
  id: SidebarSectionId
  label: string
  canCreate: boolean
  browsePlaza?: boolean
}[] = [
  { id: "mine", label: "Personal", canCreate: true },
  { id: "followed", label: "Following", canCreate: false, browsePlaza: true },
  { id: "team", label: "Shared", canCreate: true },
  { id: "published", label: "Published", canCreate: false },
]

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
  "appearance-none rounded-full bg-white py-2 pl-3 pr-8 text-[12px] font-medium text-zinc-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] outline-none focus:ring-teal-200/50"

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

/** 知识库浏览 — 分类树 + 可搜索/排序/添加的内容列表 */
export function WebKnowledgeBrowser({
  selectedKbId,
  onSelectKb,
  onOpenWorkspace,
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
}: {
  selectedKbId: number | null
  onSelectKb: (kb: KnowledgeBase) => void
  onOpenWorkspace: (kb: KnowledgeBase) => void
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
}) {
  const [expanded, setExpanded] = useState<Record<SidebarSectionId, boolean>>({
    mine: true,
    followed: true,
    team: true,
    published: true,
  })
  const [kbSearch, setKbSearch] = useState("")
  const [kbSort, setKbSort] = useState<KbSortId>("recent")
  const [contentSearch, setContentSearch] = useState("")
  const [contentSort, setContentSort] = useState<ContentSortId>("newest")
  const [hubByKb, setHubByKb] = useState<Record<number, HubLibraryItem[]>>(buildInitialHubByKb)
  const [customKBs, setCustomKBs] = useState<KnowledgeBase[]>([])
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [teamMetaById, setTeamMetaById] = useState(buildInitialTeamMeta)
  const [personalMetaById, setPersonalMetaById] = useState(buildInitialPersonalMeta)
  const [shareOpen, setShareOpen] = useState(false)
  const [overflowOpen, setOverflowOpen] = useState(false)
  const [createDialogMode, setCreateDialogMode] = useState<WebCreateKbDialogMode | null>(null)
  const [contentSearchOpen, setContentSearchOpen] = useState(false)
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
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
  const displayMeta =
    selectedBase && isSharedKb
      ? teamMetaById[selectedBase.id]
      : selectedBase && isPersonalKb
        ? personalMetaById[selectedBase.id]
        : undefined
  const selected = selectedBase ? mergeKbWithMeta(selectedBase, displayMeta) : null
  const kbQuery = kbSearch.trim().toLowerCase()
  const contentQuery = contentSearch.trim().toLowerCase()

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
      publicSettings: meta?.publicSettings ?? selectedBase.publicSettings,
    }
  }, [createDialogMode, selectedBase, teamMetaById, personalMetaById])

  const handleCreateOrEditKb = useCallback(
    (payload: WebCreateKbPayload) => {
      if (!createDialogMode) return
      if (createDialogMode.kind === "create") {
        if (onCreateKnowledgeBase) {
          void onCreateKnowledgeBase(payload).then((kb) => {
            if (!kb) return
            onSelectKb(kb)
            onRefreshKnowledgeBases?.()
            toast.success("Library created", { description: `"${kb.name}" is ready.` })
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
          publicSettings: kb.publicSettings,
        }
        if (kb.category === "team") {
          setTeamMetaById((prev) => ({ ...prev, [kb.id]: meta }))
        } else {
          setPersonalMetaById((prev) => ({ ...prev, [kb.id]: meta }))
        }
        onSelectKb(kb)
        toast.success("Library created", {
          description: payload.publicSettings?.isPublic
            ? `"${kb.name}" is published to the plaza with assistant “${publicAgentDisplayName(payload.publicSettings)}”.`
            : payload.category === "team"
              ? `"${kb.name}" is ready for your team.`
              : `"${kb.name}" is in Personal.`,
        })
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
      toast.success("Library updated", { description: `"${payload.name}" saved.` })
    },
    [createDialogMode, nextKbId, customKBs, onSelectKb]
  )

  const grouped = useMemo(() => {
    const subscribed = allKBs.filter((k) => k.category === "subscribed")
    const base: Record<SidebarSectionId, KnowledgeBase[]> = {
      mine: allKBs.filter((k) => k.category === "mine"),
      followed: subscribed.filter((kb) => subscribedRoleOf(kb) === "followed"),
      team: allKBs.filter((k) => k.category === "team"),
      published: subscribed.filter((kb) => subscribedRoleOf(kb) === "published"),
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
      SIDEBAR_SECTIONS.map((s) => [s.id, sortKnowledgeBases(filtered[s.id], kbSort)])
    ) as Record<SidebarSectionId, KnowledgeBase[]>
  }, [allKBs, kbQuery, kbSort])

  useEffect(() => {
    if (!kbQuery) return
    setExpanded({ mine: true, followed: true, team: true, published: true })
  }, [kbQuery])

  useEffect(() => {
    setOverflowOpen(false)
    setShareOpen(false)
    setCreateDialogMode(null)
    setAddMenuOpen(false)
    setSortMenuOpen(false)
    setContentSearchOpen(false)
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
            contentSort === o.id && "font-semibold text-teal-700"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )

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
          title: title || (isSharedKb ? "粘贴的文字" : "Pasted text"),
          source: isSharedKb ? "文字" : "Text",
          author: "Me",
          date: "Just now",
          dateSort: now,
        },
      ])
      toast.success(isSharedKb ? "已添加文字" : "Text added")
    })
  }, [addHubItems, isSharedKb, runAuth, selected])

  const hubListBody = (
    <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-0">
      {visibleHubItems.length === 0 && !contentQuery ? (
        kbHubUploadDisabled ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[15px] font-medium text-zinc-700">Read-only library</p>
            <p className="mt-2 max-w-sm text-[13px] text-zinc-500">
              Following libraries cannot accept uploads. Open the workspace to browse sources and chat
              with the library agent.
            </p>
            {selected ? (
              <button
                type="button"
                onClick={() => onOpenWorkspace(selected)}
                className="mt-6 rounded-full bg-zinc-900 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-zinc-800"
              >
                Open workspace
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4 py-8 sm:py-12">
            <KnowledgeUploadGuide
              locale="en"
              hideActionPills
              itemCount={hubItems.length}
              onFiles={(files) => runAuth(() => ingestFiles(files, "文件"))}
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
            {isSharedKb ? "没有匹配的内容" : "No content matches your search"}
          </p>
          <p className="mt-2 max-w-xs text-[13px] text-zinc-500">
            {isSharedKb ? "换个关键词，或清空搜索。" : "Try another keyword or clear the search box."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-stone-100/90">
          {visibleHubItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onOpenWorkspace(selected!)}
                className="flex w-full gap-4 py-4 text-left hover:bg-stone-50/50"
              >
                <HubItemThumb
                  kind={hubItemKindFromLabel(item.source, item.title)}
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-zinc-700">{item.title}</p>
                  <p className="mt-1 text-[12px] text-zinc-500">
                    {item.source} · {item.author} · {item.date}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  return (
    <div className={cn("flex h-full min-h-0", web.canvas)}>
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col overflow-hidden",
          web.secondaryWidth,
          "bg-white/50"
        )}
      >
        <div className="shrink-0 space-y-2 border-b border-black/[0.04] px-2 pb-3 pt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={kbSearch}
              onChange={(e) => setKbSearch(e.target.value)}
              placeholder="Search libraries"
              className="w-full rounded-lg bg-white py-2 pl-8 pr-2 text-[12px] text-zinc-700 ring-1 ring-black/[0.04] outline-none placeholder:text-zinc-400 focus:ring-teal-200/50"
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
          {SIDEBAR_SECTIONS.map((section) => {
            const items = grouped[section.id]
            const open = expanded[section.id]
            const isFollowingSection = section.id === "followed"

            return (
              <div key={section.id}>
                <button
                  type="button"
                  onClick={() => setExpanded((e) => ({ ...e, [section.id]: !e[section.id] }))}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-white/60"
                >
                  <span className="text-[13px] font-semibold text-zinc-600">{section.label}</span>
                  <div className="flex items-center gap-1">
                    {section.browsePlaza ? (
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation()
                          runAuth(() => {
                            if (onBrowsePlaza) onBrowsePlaza()
                            else
                              toast.message("Library plaza", {
                                description: "Discover libraries to subscribe.",
                              })
                          })
                        }}
                        className="rounded-md p-0 text-zinc-400 hover:bg-stone-100 hover:text-zinc-600"
                        aria-label="Discover libraries"
                      >
                        <Store className="h-2 w-2" strokeWidth={2.25} />
                      </button>
                    ) : section.canCreate ? (
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
                        className="rounded-md p-0 text-zinc-400 hover:bg-stone-100 hover:text-zinc-600"
                        aria-label={`New ${section.label} library`}
                      >
                        <Plus className="h-2 w-2" strokeWidth={2.25} />
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
                      <p className="px-2.5 py-2 text-[11px] text-zinc-400">No libraries match</p>
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
                                {isFollowingSection ? (
                                  <LibraryCoverWithUpdateBadge
                                    kb={displayKb}
                                    hasUpdate={kb.hasContentUpdate}
                                  />
                                ) : (
                                  <div className="h-6 w-6 shrink-0 overflow-hidden rounded-md">
                                    <LibraryCoverFromKb kb={displayKb} showMiniUi={false} />
                                  </div>
                                )}
                                {isFollowingSection ? (
                                  <div className="min-w-0 flex-1">
                                    <span className="block truncate text-zinc-700">{displayKb.name}</span>
                                    {displayKb.publicSettings ? (
                                      <span className="mt-0.5 block truncate text-[10px] text-teal-700/80">
                                        Assistant: {publicAgentDisplayName(displayKb.publicSettings)}
                                      </span>
                                    ) : null}
                                    <span className="mt-0.5 block truncate text-[10px] tabular-nums text-zinc-400">
                                      Updated {kb.lastUpdate}
                                    </span>
                                  </div>
                                ) : (
                                  <>
                                    <span className="min-w-0 flex-1 truncate text-zinc-700">
                                      {displayKb.name}
                                      {displayKb.isPublicPublished || displayKb.publicSettings?.isPublic ? (
                                        <span className="ml-1.5 inline-flex rounded-full bg-teal-50 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-teal-700 ring-1 ring-teal-200/80">
                                          Public
                                        </span>
                                      ) : null}
                                    </span>
                                    <span
                                      className={cn(
                                        "shrink-0 tabular-nums text-[10px]",
                                        active ? web.navItemActiveCount : "text-zinc-400"
                                      )}
                                    >
                                      {itemCount}
                                    </span>
                                  </>
                                )}
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
                        className={cn(
                          "flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed py-2.5 text-[12px] font-medium transition-colors",
                          "border-stone-200 bg-stone-50 text-zinc-600 hover:border-stone-300 hover:bg-stone-100"
                        )}
                      >
                        <Store className="h-2 w-2 shrink-0 text-zinc-500" strokeWidth={2.25} aria-hidden />
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

      <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-white/40">
        {selected ? (
          <>
            {isSharedKb ? (
              <>
                <WebSharedKbHeader
                  title={selected.name}
                  description={selected.description}
                  coverVariant={selected.coverVariant}
                  ownerName={selectedBase?.ownerName}
                  onShare={() => runAuth(() => setShareOpen(true))}
                  overflowOpen={overflowOpen}
                  onOverflowToggle={() => setOverflowOpen((o) => !o)}
                  onEditInfo={() =>
                    runAuth(() => setCreateDialogMode({ kind: "edit", category: "team", kbId: selected.id }))
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
                <div className="flex shrink-0 justify-end gap-2 border-b border-black/[0.04] px-8 pb-3">
                  <button
                    type="button"
                    onClick={() => onOpenWorkspace(selected)}
                    className="rounded-full bg-zinc-900 px-4 py-2 text-[13px] font-semibold text-white hover:bg-zinc-800"
                  >
                    Open workspace
                  </button>
                </div>
              </>
            ) : (
              <>
                <WebPersonalKbHeader
                  title={selected.name}
                  description={selected.description}
                  coverVariant={selected.coverVariant}
                  hasContentUpdate={isSubscribedKb ? selectedBase?.hasContentUpdate : undefined}
                  overflowOpen={overflowOpen}
                  onOverflowToggle={() => setOverflowOpen((o) => !o)}
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
                <div className="shrink-0 px-8 pb-2">
                  <p className="text-[12px] text-zinc-400">
                    {hubItems.length} items · Updated {selected.lastUpdate}
                    {isFollowingKb ? " · Read-only (following)" : ""}
                  </p>
                </div>
                <div className="relative shrink-0 px-8 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[12rem] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="search"
                      value={contentSearch}
                      onChange={(e) => setContentSearch(e.target.value)}
                      placeholder="Search content in this library"
                      className="w-full rounded-full bg-white py-2 pl-9 pr-3 text-[13px] ring-1 ring-black/[0.04] outline-none placeholder:text-zinc-400 focus:ring-teal-200/50"
                      aria-label="Search library content"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={contentSort}
                      onChange={(e) => setContentSort(e.target.value as ContentSortId)}
                      className={cn(selectClass, "min-w-[9.5rem]")}
                      aria-label="Sort content"
                    >
                      {CONTENT_SORT_OPTIONS.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  </div>
                  {!kbHubUploadDisabled ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setAddMenuOpen((o) => !o)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-zinc-800"
                      >
                        <Upload className="h-4 w-4" strokeWidth={2} />
                        Add files
                        <ChevronDown
                          className={cn("h-3.5 w-3.5 transition-transform", addMenuOpen && "rotate-180")}
                        />
                      </button>
                      {addFilesMenu}
                    </div>
                  ) : null}
                </div>
                  <p className="mt-2 text-[12px] text-zinc-500">
                    {contentQuery
                      ? `${visibleHubItems.length} result${visibleHubItems.length === 1 ? "" : "s"}`
                      : `Content (${hubItems.length})`}
                  </p>
                </div>
                <div className="flex shrink-0 justify-end gap-2 border-b border-black/[0.04] px-8 pb-3">
                  <button
                    type="button"
                    onClick={() => onOpenWorkspace(selected)}
                    className="rounded-full bg-zinc-900 px-4 py-2 text-[13px] font-semibold text-white hover:bg-zinc-800"
                  >
                    Open workspace
                  </button>
                </div>
              </>
            )}

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
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="text-[15px] font-medium text-zinc-700">Select a library on the left</p>
            <p className="mt-2 max-w-sm text-[13px] text-zinc-500">
              Search and sort libraries in the sidebar. After you pick one, search content, change sort
              order, and add files before opening the workspace.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
