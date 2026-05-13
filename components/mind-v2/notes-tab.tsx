"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { getMindAccount, accountSpaceLabel, type MindAccountId } from "@/lib/mind-accounts"
import { mx } from "@/lib/medrix-design-tokens"
import { Mic, Bluetooth, Smartphone, Library, Trash2, ChevronRight, ChevronDown, X, Folder, Package, Plus, MoreHorizontal, ArrowUpDown, FileText, FileInput, Check, LayoutList, LayoutGrid } from "lucide-react"
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
  /** Local folder; color comes from folder definition */
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
    <div className="rounded-2xl border border-stone-200/85 bg-white p-4 shadow-sm space-y-3 animate-pulse" aria-hidden>
      <div className="flex justify-between gap-3">
        <div className="h-6 flex-1 rounded-md bg-stone-200/90" />
        <div className="h-5 w-16 rounded-md bg-stone-100" />
      </div>
        <div className="h-3 w-40 rounded bg-stone-100" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-stone-100" />
        <div className="h-3 w-4/5 rounded bg-stone-100" />
      </div>
      <p className="text-[11px] text-zinc-500">Minder is still polishing this one—almost there.</p>
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
        className="absolute inset-y-0 left-0 flex w-24 items-center justify-center rounded-l-2xl bg-sky-700 text-white"
        style={{ opacity: dx > 0 ? Math.min(1, dx / 72) : 0 }}
      >
        <Library className="h-6 w-6" strokeWidth={1.65} />
      </div>
      {/* Swipe left: delete */}
      <div
        className="absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-red-600 text-white rounded-r-2xl"
        style={{ opacity: dx < 0 ? Math.min(1, -dx / 72) : 0 }}
      >
        <Trash2 className="h-6 w-6" strokeWidth={1.65} />
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
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm transition-shadow hover:border-stone-200 hover:shadow-md">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="text-[19px] font-semibold leading-snug tracking-tight text-zinc-900 line-clamp-2">
              {note.title}
            </h3>
            {note.highlightCount != null && note.highlightCount > 0 && (
              <span className="shrink-0 rounded-full bg-sky-100/95 px-2 py-0.5 text-[11px] font-medium text-sky-900">
                💡 {note.highlightCount} highlights
              </span>
            )}
          </div>
          <p className="mb-3 line-clamp-2 text-[15px] leading-relaxed text-zinc-600">{note.preview}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-zinc-500">
            <span>{note.date}</span>
            {note.duration && (
              <>
                <span className="text-zinc-400">·</span>
                <span>{note.duration}</span>
              </>
            )}
            <span className="ml-auto flex items-center gap-1">
              {note.type === "hardware" ? (
                <Mic className={cn("h-3.5 w-3.5", mx.navActiveIcon)} strokeWidth={2} />
              ) : (
                <Smartphone className="h-3.5 w-3.5 text-zinc-500" strokeWidth={2} />
              )}
            </span>
          </div>
          {folder && FolderIcon && (
            <div className="mt-2 flex items-center gap-1.5 text-[12px] text-zinc-600">
              <FolderIcon className="h-4 w-4 shrink-0" style={{ color: folder.color }} strokeWidth={2} aria-hidden />
              <span className="truncate font-medium text-zinc-700">{folder.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function NoteThumbnailSkeleton() {
  return (
    <div
      className="flex aspect-[4/5] flex-col rounded-xl border border-stone-200/70 bg-stone-50/80 p-2 animate-pulse"
      aria-hidden
    >
      <div className="h-9 rounded-lg bg-stone-200/90" />
      <div className="mt-2 flex-1 rounded-md bg-stone-100/90" />
      <div className="mt-1.5 h-2 w-2/3 rounded bg-stone-100" />
    </div>
  )
}

function NoteThumbnailCell({
  note,
  folders,
  onOpen,
  trashView,
}: {
  note: Note
  folders: NoteFolder[]
  onOpen: () => void
  trashView?: boolean
}) {
  const folder = note.folderId ? folders.find((f) => f.id === note.folderId) : undefined

  if (note.status === "pending") {
    return <NoteThumbnailSkeleton />
  }

  const TypeIcon = note.type === "hardware" ? Mic : note.type === "phone" ? Smartphone : FileText

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group flex aspect-[4/5] flex-col rounded-xl border bg-white p-1.5 text-left shadow-sm transition-all active:scale-[0.98]",
        trashView
          ? "border-zinc-200/80 opacity-90 hover:border-zinc-300"
          : "border-stone-200/80 hover:border-sky-200/90 hover:shadow-md"
      )}
    >
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-lg py-2",
          trashView ? "bg-zinc-100 dark:bg-zinc-800/80" : "bg-sky-50 dark:bg-sky-950/40"
        )}
      >
        <TypeIcon
          className={cn("h-5 w-5", trashView ? "text-zinc-600" : "text-sky-700 dark:text-sky-300")}
          strokeWidth={1.85}
          aria-hidden
        />
        {folder ? (
          <span
            className="absolute right-1 top-1 h-2 w-2 rounded-full ring-2 ring-white dark:ring-zinc-900"
            style={{ backgroundColor: folder.color }}
            title={folder.name}
          />
        ) : null}
      </div>
      <p className="mt-1 line-clamp-3 min-h-0 flex-1 px-0.5 text-[10px] font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
        {note.title}
      </p>
      <div className="mt-auto flex items-center justify-between gap-0.5 px-0.5 pt-0.5 text-[9px] text-zinc-400 dark:text-zinc-500">
        <span className="min-w-0 truncate">{note.duration ?? note.date}</span>
        {note.highlightCount != null && note.highlightCount > 0 ? (
          <span className="shrink-0 rounded bg-sky-100 px-1 text-[8px] font-semibold text-sky-800 dark:bg-sky-900/60 dark:text-sky-200">
            {note.highlightCount}
          </span>
        ) : null}
      </div>
    </button>
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
  /** Filter: all / phone / device / trash; mutually exclusive with folder pick */
  const [fileScope, setFileScope] = useState<"all" | "phone" | "device" | "trash">("all")
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [showFilterSortSheet, setShowFilterSortSheet] = useState(false)
  const [showFilesMenu, setShowFilesMenu] = useState(false)
  const [listScope, setListScope] = useState<"all" | "active">("all")
  const [notesViewMode, setNotesViewMode] = useState<"list" | "thumbnails">("list")

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
    <div className={cn("relative flex h-full flex-col", mx.shellCanvas)}>
      <div className={cn("border-b bg-white/90 backdrop-blur-sm", mx.shellHairline)}>
        <div className="flex items-center justify-between px-5 py-3">
          <button
            type="button"
            onClick={() => setShowDeviceSheet(true)}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-xl py-1 pl-0.5 pr-2 text-left transition-colors hover:bg-sky-50/50 active:bg-sky-50/70 dark:hover:bg-zinc-800/60"
            aria-label="Recorder and devices"
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                isDeviceConnected ? "bg-sky-600" : "bg-zinc-300 dark:bg-zinc-600"
              )}
            >
              <Bluetooth className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Mind</span>
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-tight",
                    activeAccount.kind === "work"
                      ? "bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-100"
                      : "bg-sky-50 text-sky-800 dark:bg-sky-950/35 dark:text-sky-100"
                  )}
                >
                  {accountSpaceLabel(activeAccount.kind)}
                </span>
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isDeviceConnected ? "bg-sky-300" : "bg-zinc-300 dark:bg-zinc-500"
                  )}
                />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Recorder status · use mic button for devices</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              toast.message("Smart search", {
                description: "Search across all captures (demo).",
              })
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-sky-50/60 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
            aria-label="Smart search"
          >
            <SmartSearchIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-2 pt-5">
        <div className="relative mb-1">
          <button
            type="button"
            onClick={() => setShowFilesMenu((v) => !v)}
            className="flex items-center gap-1 text-[15px] font-semibold text-zinc-900"
            aria-haspopup="listbox"
            aria-expanded={showFilesMenu}
          >
            {listScope === "all" ? "All files" : "Active"}
            <ChevronDown
              className={cn("h-4 w-4 text-zinc-500 transition-transform", showFilesMenu && "rotate-180")}
              strokeWidth={2}
              aria-hidden
            />
          </button>
          {showFilesMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowFilesMenu(false)} />
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-stone-200/85 bg-white py-1 shadow-lg">
                {(
                  [
                    { id: "all" as const, label: "All files" },
                    { id: "active" as const, label: "Active" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setListScope(opt.id)
                      setShowFilesMenu(false)
                      toast.message("List scope updated", { description: opt.label })
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-stone-100/85",
                      listScope === opt.id ? "font-medium text-zinc-900" : "text-zinc-700"
                    )}
                  >
                    {opt.label}
                    {listScope === opt.id && (
                      <svg className="h-4 w-4 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
          <div className="min-w-0 flex-1 text-left">
            <button type="button" onClick={() => setShowFilterSortSheet(true)} className="text-left">
              <h1 className="text-[28px] font-bold tracking-tight text-zinc-900">Notes</h1>
            </button>
            {notesViewMode === "thumbnails" ? (
              <p className="mt-0.5 text-[12px] font-medium text-sky-700 dark:text-sky-300">Thumbnail view · dense grid</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setShowFilterSortSheet(true)}
            className="relative flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-zinc-700 hover:bg-white"
            aria-label="Filter and sort"
          >
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="16" y2="12" />
              <line x1="4" y1="18" x2="12" y2="18" />
            </svg>
            {(fileScope !== "all" || selectedFolderId) && (
              <span className="max-w-[5.5rem] truncate font-medium text-zinc-900">
                {selectedFolderId
                  ? folders.find((f) => f.id === selectedFolderId)?.name ?? "Folder"
                  : fileScope === "phone"
                    ? "Phone"
                    : fileScope === "device"
                      ? "Device"
                      : "Trash"}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-28 pt-2">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="max-w-[280px] text-[17px] leading-relaxed text-zinc-700">
              Put on your Medrix Mind and capture your first spark in the real world.
            </p>
            <button
              type="button"
              onClick={() => setShowRecordOptions(true)}
              className={cn("mt-6 rounded-full px-6 py-3 text-[15px] font-semibold text-white shadow-sm", mx.brandCta)}
            >
              Start recording
            </button>
          </div>
        ) : notesViewMode === "thumbnails" ? (
          <div className="grid grid-cols-3 gap-2 pb-2">
            {filteredNotes.map((note) => (
              <NoteThumbnailCell
                key={note.id}
                note={note}
                folders={folders}
                trashView={fileScope === "trash"}
                onOpen={() => onNoteClick(note)}
              />
            ))}
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
                    toast.success("Saved to library", {
                      description: note.title.length > 40 ? `${note.title.slice(0, 40)}…` : note.title,
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
        <div className="flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-[0_12px_32px_-8px_rgba(14,165,233,0.45)] ring-[3px] ring-white/90 transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-95 dark:ring-zinc-900/80">
          <Mic className="h-7 w-7" strokeWidth={1.85} />
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
              <div className="h-1 w-10 rounded-full bg-stone-200/90" />
            </div>
            <div className="px-5 pb-2">
              <h3 className="text-lg font-semibold text-zinc-900">Record</h3>
              <p className="mt-1 text-sm text-zinc-500">Start a capture or open device details</p>
            </div>
            <div className="space-y-2 px-5 pb-6">
              <button
                type="button"
                onClick={() => {
                  setShowRecordOptions(false)
                  onStartRecording()
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border border-stone-200/85 py-3.5 pl-4 pr-3 text-left text-white shadow-sm",
                  mx.brandCta
                )}
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
                className="flex w-full items-center gap-3 rounded-xl border border-stone-200/85 bg-white py-3.5 pl-4 pr-3 text-left hover:bg-sky-50/50"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    isDeviceConnected ? "bg-sky-600" : "bg-zinc-300 dark:bg-zinc-600"
                  )}
                >
                  <Bluetooth className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold text-zinc-900">Source & devices</div>
                  <div className="text-[12px] text-zinc-500">Battery, storage, firmware, pairing</div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300" />
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
            aria-label="Close filters"
            onClick={() => setShowFilterSortSheet(false)}
          />
          <div className="relative max-h-[85vh] overflow-hidden rounded-t-[1.35rem] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)]">
            <div className="flex max-h-[85vh] flex-col">
              <div className="flex shrink-0 items-center justify-between border-b border-stone-100/80 px-5 py-4">
                <h2 className="text-[18px] font-bold text-zinc-900">Filter & sort</h2>
                <button
                  type="button"
                  onClick={() => setShowFilterSortSheet(false)}
                  className="rounded-full p-2 text-zinc-500 hover:bg-stone-100/85"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-1">
                <button
                  type="button"
                  onClick={() => toast.message("Sort", { description: "Sorted by created time (demo)." })}
                  className="mb-4 flex w-full items-center justify-between rounded-xl py-2 text-left text-[15px] text-zinc-800"
                >
                  <span>Created time</span>
                  <ArrowUpDown className="h-4 w-4 text-zinc-400" strokeWidth={2} />
                </button>

                <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-zinc-400">View</p>
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNotesViewMode("list")
                      setShowFilterSortSheet(false)
                      toast.success("List view", { description: "Comfortable rows with previews." })
                    }}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-colors",
                      notesViewMode === "list"
                        ? "border-sky-400 bg-sky-50/80 dark:border-sky-500 dark:bg-sky-950/45"
                        : "border-transparent bg-stone-50/80 hover:bg-stone-100/90 dark:bg-zinc-800/40"
                    )}
                  >
                    <LayoutList className="h-5 w-5 text-zinc-600 dark:text-zinc-300" strokeWidth={1.75} aria-hidden />
                    <span className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">List</span>
                    <span className="text-[11px] leading-snug text-zinc-500">Rows with excerpt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNotesViewMode("thumbnails")
                      setShowFilterSortSheet(false)
                      toast.success("Thumbnail view", { description: "Dense grid for quick scanning." })
                    }}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-colors",
                      notesViewMode === "thumbnails"
                        ? "border-sky-400 bg-sky-50/80 dark:border-sky-500 dark:bg-sky-950/45"
                        : "border-transparent bg-stone-50/80 hover:bg-stone-100/90 dark:bg-zinc-800/40"
                    )}
                  >
                    <LayoutGrid className="h-5 w-5 text-zinc-600 dark:text-zinc-300" strokeWidth={1.75} aria-hidden />
                    <span className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">Thumbnails</span>
                    <span className="text-[11px] leading-snug text-zinc-500">Small tiles, more on screen</span>
                  </button>
                </div>

                <div className="space-y-0.5 border-b border-stone-100/80 pb-4">
                  {(
                    [
                      {
                        id: "all" as const,
                        label: "All files",
                        count: notes.filter((n) => inListScope(n)).length,
                        icon: Folder,
                        active: fileScope === "all" && !selectedFolderId,
                      },
                      {
                        id: "phone" as const,
                        label: "Phone",
                        count: phoneCount,
                        icon: Smartphone,
                        active: fileScope === "phone" && !selectedFolderId,
                      },
                      {
                        id: "device" as const,
                        label: "Device",
                        count: deviceCount,
                        icon: Package,
                        active: fileScope === "device" && !selectedFolderId,
                      },
                      {
                        id: "trash" as const,
                        label: "Trash",
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
                        toast.message("Filter applied", { description: `${row.label} (${row.count})` })
                      }}
                      className="flex w-full items-center gap-3 rounded-xl py-3.5 pl-1 pr-2 text-left hover:bg-sky-50/50"
                    >
                      <row.icon className="h-5 w-5 shrink-0 text-zinc-500" strokeWidth={1.75} />
                      <span className="flex-1 text-[15px] text-zinc-900">
                        {row.label}{" "}
                        <span className="text-zinc-400">({row.count})</span>
                      </span>
                      {row.active ? <Check className="h-5 w-5 shrink-0 text-zinc-900" strokeWidth={2.5} /> : null}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-b border-stone-100/80 pb-2">
                  <span className="text-[13px] font-semibold uppercase tracking-wide text-zinc-400">Folders</span>
                  <button
                    type="button"
                    onClick={() => toast.message("New folder", { description: "Create from the overflow menu (demo)." })}
                    className="rounded-full p-1.5 text-zinc-500 hover:bg-stone-100/85"
                    aria-label="Add folder"
                  >
                    <Plus className="h-5 w-5" strokeWidth={2} />
                  </button>
                </div>
                <div className="space-y-0.5 border-b border-stone-100/80 pb-4 pt-1">
                  {folders.map((f) => {
                    const cnt = notes.filter((n) => inListScope(n) && n.folderId === f.id).length
                    const Fi = folderIconComponent(f.iconKey)
                    return (
                      <div key={f.id} className="flex items-center gap-2 rounded-xl py-2 pl-1 pr-1 hover:bg-sky-50/50">
                        <button
                          type="button"
                          onClick={() => {
                            setFileScope("all")
                            setSelectedFolderId(f.id)
                            setShowFilterSortSheet(false)
                            toast.message("Folder filter", { description: f.name })
                          }}
                          className="flex min-w-0 flex-1 items-center gap-3 py-2 text-left"
                        >
                          <Fi className="h-5 w-5 shrink-0" style={{ color: f.color }} strokeWidth={1.75} />
                          <span className="truncate text-[15px] text-zinc-900">
                            {f.name}{" "}
                            <span className="text-zinc-400">({cnt})</span>
                          </span>
                        </button>
                        <button
                          type="button"
                          className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-stone-100/85 hover:text-zinc-600"
                          aria-label="More"
                          onClick={() => toast.message(f.name, { description: "Rename or delete (demo)." })}
                        >
                          <MoreHorizontal className="h-5 w-5" strokeWidth={2} />
                        </button>
                      </div>
                    )
                  })}
                </div>

                <p className="mt-4 text-[13px] font-semibold uppercase tracking-wide text-zinc-400">From</p>
                <div className="mt-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      toast.message("Chat-style notes", {
                        description: `${textDialogCount} items (demo filter).`,
                      })
                    }
                    className="flex w-full items-center gap-3 rounded-xl py-3.5 pl-1 text-left hover:bg-sky-50/50"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-zinc-500" strokeWidth={1.75} />
                    <span className="text-[15px] text-zinc-900">
                      Chat-style notes <span className="text-zinc-400">({textDialogCount})</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      toast.message("Imports", { description: `${importCount} imported captures (demo).` })
                    }
                    className="flex w-full items-center gap-3 rounded-xl py-3.5 pl-1 text-left hover:bg-sky-50/50"
                  >
                    <FileInput className="h-5 w-5 shrink-0 text-zinc-500" strokeWidth={1.75} />
                    <span className="text-[15px] text-zinc-900">
                      Imports <span className="text-zinc-400">({importCount})</span>
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
