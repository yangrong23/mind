"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { getMindAccount, accountSpaceLabel, type MindAccountId } from "@/lib/mind-accounts"
import { mx } from "@/lib/medrix-design-tokens"
import { Mic, Bluetooth, Smartphone, Library, Trash2, ChevronRight, ChevronDown, X, Folder, Package, Plus, MoreHorizontal, ArrowUpDown, FileText, FileInput, Check } from "lucide-react"
import { toast } from "sonner"
import type { NoteFolder } from "@/lib/note-folders"
import { folderIconComponent } from "@/lib/note-folders"
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"
import { MindDevicesSheet } from "@/components/mind-v2/mind-devices-sheet"

export interface Note {
  id: number
  title: string
  type: "hardware" | "phone" | "text"
  date: string
  duration?: string
  preview: string
  /** Rich HTML body for `type: "text"`; list row uses plain `preview` */
  bodyHtml?: string
  status: "pending" | "analyzed" | "transferred"
  source?: string
  /** Multimodal badge, e.g. highlight count */
  highlightCount?: number
  /** Local folder (存入文件夹); color comes from folder definition */
  folderId?: string | null
  /** Swipe-right archive / save to library (demo: hide from list) */
  archived?: boolean
}

export const mockNotes: Note[] = [
  {
    id: 1,
    title: "Product requirements sync",
    type: "hardware",
    date: "Today 2:32 PM",
    duration: "23 min",
    preview: "Discussed the next release, including knowledge graph visualization…",
    status: "analyzed",
    source: "Mind Recorder",
    highlightCount: 3,
  },
  {
    id: 2,
    title: "User interview notes",
    type: "hardware",
    date: "Today 10:15 AM",
    duration: "45 min",
    preview: "Feedback on transcription accuracy and latency…",
    status: "pending",
    source: "Mind Recorder",
  },
  {
    id: 3,
    title: "Podcast — AI product design",
    type: "phone",
    date: "Yesterday 4:20 PM",
    duration: "1h 12m",
    preview: "Principles of AI product design and UX tradeoffs…",
    status: "analyzed",
    source: "Phone mic",
    highlightCount: 5,
  },
  {
    id: 4,
    title: "Technical design notes",
    type: "phone",
    date: "Yesterday 11:00 AM",
    duration: "42 min",
    preview: "RAG architecture: vector retrieval and reranking…",
    status: "transferred",
    source: "Phone mic",
  },
  {
    id: 5,
    title: "Customer call recording",
    type: "hardware",
    date: "May 6",
    duration: "18 min",
    preview: "Project timeline and next-phase planning…",
    status: "analyzed",
    source: "Mind Recorder",
    highlightCount: 1,
  },
]

function NoteCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3 animate-pulse" aria-hidden>
      <div className="flex justify-between gap-3">
        <div className="h-6 flex-1 rounded-md bg-gray-300" />
        <div className="h-5 w-16 rounded-md bg-gray-200" />
      </div>
      <div className="h-3 w-40 rounded bg-gray-200" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-4/5 rounded bg-gray-200" />
      </div>
      <p className="text-[11px] text-gray-500">Minder is still polishing this one—almost there.</p>
    </div>
  )
}

interface SwipeableMemoCardProps {
  note: Note
  folders: NoteFolder[]
  onOpen: () => void
  onArchive?: () => void
  onDelete?: () => void
}

function SwipeableMemoCard({ note, folders, onOpen, onArchive, onDelete }: SwipeableMemoCardProps) {
  const folder = note.folderId ? folders.find((f) => f.id === note.folderId) : undefined
  const FolderIcon = folder ? folderIconComponent(folder.iconKey) : null
  const startX = useRef(0)
  const [dx, setDx] = useState(0)
  const dragging = useRef(false)

  const onStart = (clientX: number) => {
    startX.current = clientX
    dragging.current = true
  }
  const onMove = (clientX: number) => {
    if (!dragging.current) return
    const d = clientX - startX.current
    setDx(Math.max(-120, Math.min(120, d)))
  }
  const onEnd = () => {
    dragging.current = false
    if (dx > 72) {
      onArchive?.()
      setDx(0)
    } else if (dx < -72) {
      onDelete?.()
      setDx(0)
    } else {
      setDx(0)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Swipe right: add to library */}
      <div
        className="absolute inset-y-0 left-0 flex w-24 items-center justify-center bg-zinc-600 text-white rounded-l-2xl"
        style={{ opacity: dx > 0 ? Math.min(1, dx / 72) : 0 }}
      >
        <Library className="w-6 h-6" strokeWidth={1.75} />
      </div>
      {/* Swipe left: delete */}
      <div
        className="absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-red-600 text-white rounded-r-2xl"
        style={{ opacity: dx < 0 ? Math.min(1, -dx / 72) : 0 }}
      >
        <Trash2 className="w-6 h-6" strokeWidth={1.75} />
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onOpen()}
        onClick={() => {
          if (Math.abs(dx) < 8) onOpen()
        }}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => dragging.current && onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={() => dragging.current && onEnd()}
        className="relative z-10 w-full cursor-pointer select-none text-left"
        style={{ transform: `translateX(${dx}px)`, transition: dragging.current ? "none" : "transform 0.2s ease-out" }}
      >
        <div className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="text-[19px] font-semibold leading-snug tracking-tight text-gray-900 line-clamp-2">
              {note.title}
            </h3>
            {note.highlightCount != null && note.highlightCount > 0 && (
              <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                💡 {note.highlightCount} highlights
              </span>
            )}
          </div>
          <p className="mb-3 line-clamp-2 text-[15px] leading-relaxed text-gray-600">{note.preview}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-gray-500">
            <span>{note.date}</span>
            {note.duration && (
              <>
                <span className="text-gray-400">·</span>
                <span>{note.duration}</span>
              </>
            )}
            <span className="ml-auto flex items-center gap-1">
              {note.type === "hardware" ? (
                <Mic className={cn("h-3.5 w-3.5", mx.navActiveIcon)} strokeWidth={2} />
              ) : (
                <Smartphone className="h-3.5 w-3.5 text-gray-500" strokeWidth={2} />
              )}
            </span>
          </div>
          {folder && FolderIcon && (
            <div className="mt-2 flex items-center gap-1.5 text-[12px] text-gray-600">
              <FolderIcon className="h-4 w-4 shrink-0" style={{ color: folder.color }} strokeWidth={2} aria-hidden />
              <span className="truncate font-medium text-gray-700">{folder.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface NotesTabProps {
  activeAccountId: MindAccountId
  notes: Note[]
  folders: NoteFolder[]
  onNotesChange: (notes: Note[]) => void
  onNoteClick: (note: Note) => void
  onStartRecording: () => void
}

export function NotesTab({
  activeAccountId,
  notes,
  folders,
  onNotesChange,
  onNoteClick,
  onStartRecording,
}: NotesTabProps) {
  const activeAccount = getMindAccount(activeAccountId)
  const [showDeviceSheet, setShowDeviceSheet] = useState(false)
  const [showRecordOptions, setShowRecordOptions] = useState(false)
  const [isDeviceConnected, setIsDeviceConnected] = useState(true)
  /** 筛选：全部 / 手机 / 设备 / 回收站；与「文件夹」互斥 */
  const [fileScope, setFileScope] = useState<"all" | "phone" | "device" | "trash">("all")
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [showFilterSortSheet, setShowFilterSortSheet] = useState(false)
  const [showFilesMenu, setShowFilesMenu] = useState(false)
  const [listScope, setListScope] = useState<"all" | "active">("all")

  const inListScope = (n: Note) => (listScope === "active" ? !n.archived : true)
  const nonArchived = notes.filter((n) => !n.archived)
  const archivedCount = notes.filter((n) => n.archived).length
  const phoneCount = nonArchived.filter((n) => n.type === "phone").length
  const deviceCount = nonArchived.filter((n) => n.type === "hardware").length
  const textDialogCount = nonArchived.filter((n) => n.type === "text").length
  const importCount = nonArchived.filter((n) => n.type === "hardware" || n.type === "phone").length

  const filteredNotes = (() => {
    if (selectedFolderId) {
      return notes.filter((n) => inListScope(n) && n.folderId === selectedFolderId)
    }
    if (fileScope === "trash") {
      return notes.filter((n) => n.archived)
    }
    return notes
      .filter((n) => inListScope(n) && !n.archived)
      .filter((n) => {
        if (fileScope === "phone") return n.type === "phone"
        if (fileScope === "device") return n.type === "hardware"
        return true
      })
  })()

  return (
    <div className="relative flex h-full flex-col bg-[#ebebe8]">
      <div className="border-b border-gray-300/90 bg-white">
        <div className="flex items-center justify-between px-5 py-3">
          <button
            type="button"
            onClick={() => setShowDeviceSheet(true)}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-xl py-1 pl-0.5 pr-2 text-left transition-colors hover:bg-gray-50 active:bg-gray-100/80"
            aria-label="设备与录音机"
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                isDeviceConnected ? "bg-sky-600" : "bg-gray-400"
              )}
            >
              <Bluetooth className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-900">Mind</span>
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-tight",
                    activeAccount.kind === "work"
                      ? cn(mx.accentWorkSoft, mx.accentWorkIcon)
                      : cn(mx.accentPersonalSoft, "text-emerald-800")
                  )}
                >
                  {accountSpaceLabel(activeAccount.kind)}
                </span>
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isDeviceConnected ? "bg-sky-300" : "bg-gray-400"
                  )}
                />
              </div>
              <p className="text-[11px] text-gray-500">Recorder status · use mic button for devices</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              toast.message("智能搜索", {
                description: "在全部文件中搜索（演示）。后续可接入全文检索与向量检索。",
              })
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-200"
            aria-label="Smart search"
          >
            <SmartSearchIcon className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-2 pt-5">
        <div className="relative mb-1">
          <button
            type="button"
            onClick={() => setShowFilesMenu((v) => !v)}
            className="flex items-center gap-1 text-[15px] font-semibold text-gray-900"
            aria-haspopup="listbox"
            aria-expanded={showFilesMenu}
          >
            {listScope === "all" ? "全部文件" : "未归档"}
            <ChevronDown
              className={cn("h-4 w-4 text-gray-500 transition-transform", showFilesMenu && "rotate-180")}
              strokeWidth={2}
              aria-hidden
            />
          </button>
          {showFilesMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowFilesMenu(false)} />
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                {(
                  [
                    { id: "all" as const, label: "全部文件" },
                    { id: "active" as const, label: "未归档" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setListScope(opt.id)
                      setShowFilesMenu(false)
                      toast.message("列表范围已更新", { description: opt.label })
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-100",
                      listScope === opt.id ? "font-medium text-gray-900" : "text-gray-700"
                    )}
                  >
                    {opt.label}
                    {listScope === opt.id && (
                      <svg className="h-4 w-4 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowFilterSortSheet(true)}
            className="text-left"
          >
            <h1 className="text-[28px] font-bold tracking-tight text-gray-900">Notes</h1>
          </button>
          <button
            type="button"
            onClick={() => setShowFilterSortSheet(true)}
            className="relative flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-white"
            aria-label="筛选和排序"
          >
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="16" y2="12" />
              <line x1="4" y1="18" x2="12" y2="18" />
            </svg>
            {(fileScope !== "all" || selectedFolderId) && (
              <span className="max-w-[5.5rem] truncate font-medium text-gray-900">
                {selectedFolderId
                  ? folders.find((f) => f.id === selectedFolderId)?.name ?? "文件夹"
                  : fileScope === "phone"
                    ? "手机"
                    : fileScope === "device"
                      ? "设备"
                      : "回收站"}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-28 pt-2">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="max-w-[280px] text-[17px] leading-relaxed text-gray-700">
              Put on your Medrix Mind and capture your first spark in the real world.
            </p>
            <button
              type="button"
              onClick={() => setShowRecordOptions(true)}
              className="mt-6 rounded-full bg-zinc-600 px-6 py-3 text-[15px] font-medium text-white hover:bg-zinc-700"
            >
              Start recording
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredNotes.map((note) =>
              note.status === "pending" ? (
                <NoteCardSkeleton key={note.id} />
              ) : (
                <SwipeableMemoCard
                  key={note.id}
                  note={note}
                  folders={folders}
                  onOpen={() => onNoteClick(note)}
                  onArchive={() => {
                    toast.success("已加入知识库", {
                      description: `「${note.title.length > 40 ? `${note.title.slice(0, 40)}…` : note.title}」`,
                    })
                    onNotesChange(notes.map((n) => (n.id === note.id ? { ...n, archived: true } : n)))
                  }}
                  onDelete={() => onNotesChange(notes.filter((n) => n.id !== note.id))}
                />
              )
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowRecordOptions(true)}
        className="absolute bottom-7 right-6 z-30 flex items-center justify-center"
        aria-label="Recording options"
      >
        <div className="flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full bg-gradient-to-br from-zinc-400 via-zinc-500 to-stone-600 text-white shadow-[0_10px_28px_-6px_rgba(63,63,70,0.35)] ring-[3px] ring-white/95 transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-95">
          <Mic className="h-7 w-7" strokeWidth={2.25} />
        </div>
      </button>

      {showRecordOptions && (
        <div className="absolute inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/35"
            aria-label="Dismiss"
            onClick={() => setShowRecordOptions(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 animate-in slide-in-from-bottom rounded-t-3xl bg-white duration-300">
            <div className="flex justify-center pb-2 pt-3">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>
            <div className="px-5 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Record</h3>
              <p className="mt-1 text-sm text-gray-500">Start a capture or open device details</p>
            </div>
            <div className="space-y-2 px-5 pb-6">
              <button
                type="button"
                onClick={() => {
                  setShowRecordOptions(false)
                  onStartRecording()
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-900 py-3.5 pl-4 pr-3 text-left text-white"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Mic className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold">Start recording</div>
                  <div className="text-[12px] text-white/70">Phone mic or linked Mind Recorder</div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-white/50" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRecordOptions(false)
                  setShowDeviceSheet(true)
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white py-3.5 pl-4 pr-3 text-left hover:bg-gray-50"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    isDeviceConnected ? "bg-sky-600" : "bg-gray-400"
                  )}
                >
                  <Bluetooth className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold text-gray-900">Source & devices</div>
                  <div className="text-[12px] text-gray-500">Battery, storage, firmware, pairing</div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showFilterSortSheet && (
        <div className="absolute inset-0 z-[45] flex flex-col justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="关闭筛选"
            onClick={() => setShowFilterSortSheet(false)}
          />
          <div className="relative max-h-[85vh] overflow-hidden rounded-t-[1.35rem] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)]">
            <div className="flex max-h-[85vh] flex-col">
              <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
                <h2 className="text-[18px] font-bold text-gray-900">筛选和排序</h2>
                <button
                  type="button"
                  onClick={() => setShowFilterSortSheet(false)}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                  aria-label="关闭"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-1">
                <button
                  type="button"
                  onClick={() => toast.message("排序", { description: "按创建时间排序（演示）。" })}
                  className="mb-4 flex w-full items-center justify-between rounded-xl py-2 text-left text-[15px] text-gray-800"
                >
                  <span>创建时间</span>
                  <ArrowUpDown className="h-4 w-4 text-gray-400" strokeWidth={2} />
                </button>

                <div className="space-y-0.5 border-b border-gray-100 pb-4">
                  {(
                    [
                      {
                        id: "all" as const,
                        label: "全部文件",
                        count: notes.filter((n) => inListScope(n)).length,
                        icon: Folder,
                        active: fileScope === "all" && !selectedFolderId,
                      },
                      {
                        id: "phone" as const,
                        label: "手机",
                        count: phoneCount,
                        icon: Smartphone,
                        active: fileScope === "phone" && !selectedFolderId,
                      },
                      {
                        id: "device" as const,
                        label: "设备",
                        count: deviceCount,
                        icon: Package,
                        active: fileScope === "device" && !selectedFolderId,
                      },
                      {
                        id: "trash" as const,
                        label: "回收站",
                        count: archivedCount,
                        icon: Trash2,
                        active: fileScope === "trash",
                      },
                    ] as const
                  ).map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => {
                        setSelectedFolderId(null)
                        setFileScope(row.id)
                        setShowFilterSortSheet(false)
                        toast.message("已应用筛选", { description: `${row.label}（${row.count}）` })
                      }}
                      className="flex w-full items-center gap-3 rounded-xl py-3.5 pl-1 pr-2 text-left hover:bg-gray-50"
                    >
                      <row.icon className="h-5 w-5 shrink-0 text-gray-500" strokeWidth={1.75} />
                      <span className="flex-1 text-[15px] text-gray-900">
                        {row.label}{" "}
                        <span className="text-gray-400">({row.count})</span>
                      </span>
                      {row.active ? <Check className="h-5 w-5 shrink-0 text-gray-900" strokeWidth={2.5} /> : null}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-[13px] font-semibold uppercase tracking-wide text-gray-400">文件夹</span>
                  <button
                    type="button"
                    onClick={() => toast.message("新建文件夹", { description: "在更多入口创建文件夹（演示）。" })}
                    className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
                    aria-label="添加文件夹"
                  >
                    <Plus className="h-5 w-5" strokeWidth={2} />
                  </button>
                </div>
                <div className="space-y-0.5 border-b border-gray-100 pb-4 pt-1">
                  {folders.map((f) => {
                    const cnt = notes.filter((n) => inListScope(n) && n.folderId === f.id).length
                    const Fi = folderIconComponent(f.iconKey)
                    return (
                      <div key={f.id} className="flex items-center gap-2 rounded-xl py-2 pl-1 pr-1 hover:bg-gray-50">
                        <button
                          type="button"
                          onClick={() => {
                            setFileScope("all")
                            setSelectedFolderId(f.id)
                            setShowFilterSortSheet(false)
                            toast.message("已筛选文件夹", { description: f.name })
                          }}
                          className="flex min-w-0 flex-1 items-center gap-3 py-2 text-left"
                        >
                          <Fi className="h-5 w-5 shrink-0" style={{ color: f.color }} strokeWidth={1.75} />
                          <span className="truncate text-[15px] text-gray-900">
                            {f.name}{" "}
                            <span className="text-gray-400">({cnt})</span>
                          </span>
                        </button>
                        <button
                          type="button"
                          className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          aria-label="更多"
                          onClick={() => toast.message(f.name, { description: "重命名 / 删除（演示）。" })}
                        >
                          <MoreHorizontal className="h-5 w-5" strokeWidth={2} />
                        </button>
                      </div>
                    )
                  })}
                </div>

                <p className="mt-4 text-[13px] font-semibold uppercase tracking-wide text-gray-400">来自</p>
                <div className="mt-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      toast.message("笔记 · 对话模式", {
                        description: `共 ${textDialogCount} 条与对话相关的笔记（演示筛选）。`,
                      })
                    }
                    className="flex w-full items-center gap-3 rounded-xl py-3.5 pl-1 text-left hover:bg-gray-50"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-gray-500" strokeWidth={1.75} />
                    <span className="text-[15px] text-gray-900">
                      笔记 · 对话模式 <span className="text-gray-400">({textDialogCount})</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      toast.message("导入", { description: `共 ${importCount} 条导入类录音（演示）。` })
                    }
                    className="flex w-full items-center gap-3 rounded-xl py-3.5 pl-1 text-left hover:bg-gray-50"
                  >
                    <FileInput className="h-5 w-5 shrink-0 text-gray-500" strokeWidth={1.75} />
                    <span className="text-[15px] text-gray-900">
                      导入 <span className="text-gray-400">({importCount})</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <MindDevicesSheet
        open={showDeviceSheet}
        onClose={() => setShowDeviceSheet(false)}
        isDeviceConnected={isDeviceConnected}
        onSetDeviceConnected={setIsDeviceConnected}
      />
    </div>
  )
}
