"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { type MindAccountId } from "@/lib/mind-accounts"
import { mx } from "@/lib/medrix-design-tokens"
import { Mic, Bluetooth, Smartphone, Library, Trash2, ChevronRight, ChevronDown, X, Folder, Package, Plus, MoreHorizontal, ArrowUpDown, FileText, Check, LayoutList, LayoutGrid, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import type { NoteFolder } from "@/lib/note-folders"
import { folderIconComponent } from "@/lib/note-folders"
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"
import { MindDevicesSheet } from "@/components/mind-v2/mind-devices-sheet"
import { MindHardwareDetail } from "@/components/mind-v2/mind-hardware-detail"
import { isNoteProcessing, type NoteStatus } from "@/lib/note-status"

export type { NoteStatus }

export interface Note {
  id: number
  title: string
  type: "hardware" | "phone" | "text"
  date: string
  duration?: string
  preview: string
  /** Rich HTML body for `type: "text"`; list row uses plain `preview` */
  bodyHtml?: string
  status: NoteStatus
  source?: string
  /** Multimodal badge, e.g. highlight count */
  highlightCount?: number
  /** Local folder; color comes from folder definition */
  folderId?: string | null
  /** Swipe-right archive / save to library (demo: hide from list) */
  archived?: boolean
  /** Optional second line under title (e.g. Imported) */
  listSubtitle?: string
  /** Show failed-processing state on the row */
  processingFailed?: boolean
}

export const mockNotes: Note[] = [
  {
    id: 100,
    title: "Dream_It_Possible-05-12 15:49:55",
    type: "hardware",
    date: "May 12 · 3:49 PM",
    duration: "3 min",
    preview: "",
    status: "analyzed",
    source: "Mind Recorder",
    listSubtitle: "Imported",
    processingFailed: true,
  },
  {
    id: 101,
    title: "Dialogue as intelligence: Mind, AI, and the future of human cognition",
    type: "hardware",
    date: "Apr 23 · 4:13 PM",
    duration: "16 min",
    preview: "",
    status: "analyzed",
    source: "Mind Recorder",
  },
  {
    id: 3,
    title: "Welcome to Mind",
    type: "hardware",
    date: "Apr 20 · 10:02 AM",
    duration: "3 min",
    preview: "",
    status: "analyzed",
    source: "Mind Recorder",
    highlightCount: 1,
  },
  {
    id: 4,
    title: "How to use Mind?",
    type: "hardware",
    date: "Apr 19 · 2:18 PM",
    duration: "4 min",
    preview: "",
    status: "analyzed",
    source: "Mind Recorder",
    highlightCount: 2,
  },
  {
    id: 102,
    title: "Field memo — product sync",
    type: "hardware",
    date: "May 5 · 9:12 AM",
    duration: "8 min",
    preview: "",
    status: "analyzed",
    source: "Mind Recorder",
    listSubtitle: "Imported",
    processingFailed: true,
  },
  {
    id: 103,
    title: "2026-05-13 14:49:42",
    type: "hardware",
    date: "May 13 · 2:49 PM",
    duration: "0:54",
    preview: "",
    status: "synced",
    source: "Mind Recorder",
    listSubtitle: "Imported",
  },
  {
    id: 2,
    title: "User interview notes",
    type: "hardware",
    date: "Today 10:15 AM",
    duration: "45 min",
    preview: "",
    status: "synced",
    source: "Mind Recorder",
  },
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
    id: 5,
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
    id: 6,
    title: "Technical design notes",
    type: "phone",
    date: "Yesterday 11:00 AM",
    duration: "42 min",
    preview: "RAG architecture: vector retrieval and reranking…",
    status: "transferred",
    source: "Phone mic",
  },
  {
    id: 7,
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

function isRecordingNote(note: Note) {
  return note.type === "hardware" || note.type === "phone"
}

function RecorderGlyph({
  className,
  batteryPercent,
}: {
  className?: string
  /** 0–100: left-edge level strip; omit when disconnected / unknown */
  batteryPercent?: number | null
}) {
  const pct =
    batteryPercent != null && Number.isFinite(batteryPercent)
      ? Math.round(Math.max(0, Math.min(100, batteryPercent)))
      : null

  return (
    <span
      className={cn(
        "inline-flex h-[26px] min-w-[17px] overflow-hidden rounded-[5px] border-[2px] border-current",
        pct != null ? "w-[21px]" : "w-[17px]",
        className
      )}
      aria-hidden
    >
      {pct != null ? (
        <span className="flex w-[3px] shrink-0 flex-col justify-end border-r border-sky-200/40 bg-sky-100/35 py-[3px] pl-[2px] dark:border-sky-500/25 dark:bg-sky-950/40">
          <span
            className="w-[2px] max-h-full min-h-[2px] rounded-[1px] bg-gradient-to-t from-mind/75 to-mind shadow-[0_0_6px_rgba(56,189,248,0.5)]"
            style={{ height: `${pct}%` }}
          />
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col items-center justify-end pb-[5px] pt-[3px]">
        <span className="h-2 w-2 rounded-full bg-current opacity-80" />
      </span>
    </span>
  )
}

/** Mic well with the same soft bloom as the bottom nav active tab */
function NotesRecordGlowIcon({
  className,
  wellClassName = "h-10 w-10",
  iconClassName = "h-6 w-6",
}: {
  className?: string
  wellClassName?: string
  iconClassName?: string
}) {
  return (
    <div className={cn("relative flex items-center justify-center rounded-2xl", wellClassName, className)}>
      <span className={mx.navBloomOuter} aria-hidden />
      <span className={mx.navBloomInner} aria-hidden />
      <Mic className={cn("relative z-[1]", iconClassName, mx.navIconGlow)} strokeWidth={2.1} aria-hidden />
    </div>
  )
}

function NoteCardSkeleton() {
  return (
    <div className="animate-pulse py-4" aria-hidden>
      <div className="h-4 w-[72%] max-w-md rounded bg-zinc-200/85" />
      <div className="mt-2.5 h-3 w-[42%] rounded bg-zinc-100/90" />
      <div className="mt-2.5 h-3 w-28 rounded bg-zinc-100/80" />
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
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 flex w-20 items-center justify-center bg-zinc-700 text-white"
        style={{ opacity: dx > 0 ? Math.min(1, dx / 72) : 0 }}
      >
        <Library className="h-5 w-5" strokeWidth={1.65} />
      </div>
      <div
        className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-red-600 text-white"
        style={{ opacity: dx < 0 ? Math.min(1, -dx / 72) : 0 }}
      >
        <Trash2 className="h-5 w-5" strokeWidth={1.65} />
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
        className="relative z-10 w-full cursor-pointer select-none bg-white text-left active:bg-zinc-50/70"
        style={{ transform: `translateX(${dx}px)`, transition: dragging.current ? "none" : "transform 0.2s ease-out" }}
      >
        <div className="py-4">
          {note.listSubtitle ? (
            <p className="mb-1 text-[11px] leading-tight text-zinc-400">{note.listSubtitle}</p>
          ) : null}
          <h3
            className={cn(
              "line-clamp-2 text-[16px] font-semibold leading-snug tracking-tight",
              note.processingFailed ? "text-zinc-400" : "text-zinc-900"
            )}
          >
            {note.title}
          </h3>
          {!isRecordingNote(note) ? (
            <p className="mt-1 line-clamp-1 text-[13px] leading-relaxed text-zinc-500">{note.preview}</p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[13px] tabular-nums text-zinc-400">
            <span>{note.date}</span>
            {note.duration ? (
              <>
                <span className="text-zinc-300" aria-hidden>
                  |
                </span>
                <span>{note.duration}</span>
              </>
            ) : null}
            {note.processingFailed ? (
              <span className="ml-auto inline-flex items-center gap-0.5 text-[12px] font-medium text-red-500">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                Processing failed
              </span>
            ) : null}
          </div>
          {folder && FolderIcon ? (
            <div className="mt-2 flex items-center gap-1.5 text-[12px] text-zinc-500">
              <FolderIcon className="h-4 w-4 shrink-0" style={{ color: folder.color }} strokeWidth={2} aria-hidden />
              {note.highlightCount != null && note.highlightCount > 0 ? (
                <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  {note.highlightCount}
                </span>
              ) : null}
            </div>
          ) : note.highlightCount != null && note.highlightCount > 0 ? (
            <div className="mt-2 text-[12px] text-zinc-500">{note.highlightCount} highlights</div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function NoteThumbnailSkeleton() {
  return (
    <div
      className="flex min-h-[100px] flex-col rounded-xl border border-stone-200/70 bg-white dark:bg-zinc-950 p-2.5 animate-pulse"
      aria-hidden
    >
      <div className="flex gap-2">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-stone-200/90" />
        <div className="min-w-0 flex-1 space-y-2 pt-0.5">
          <div className="h-3 w-full rounded bg-stone-200/80" />
          <div className="h-3 w-4/5 rounded bg-stone-200/80" />
          <div className="h-2.5 w-1/2 rounded bg-stone-100" />
        </div>
      </div>
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

  if (isNoteProcessing(note)) {
    return <NoteThumbnailSkeleton />
  }

  const TypeIcon = note.type === "hardware" ? Mic : note.type === "phone" ? Smartphone : FileText
  const recording = isRecordingNote(note)

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group flex min-h-[100px] flex-col rounded-xl border bg-white p-2.5 text-left shadow-sm transition-all active:scale-[0.98]",
        trashView
          ? "border-zinc-200/80 opacity-90 hover:border-zinc-300"
          : "border-stone-200/80 hover:border-stone-200 hover:shadow-md"
      )}
    >
      <div className="flex min-h-0 flex-1 gap-2">
        <div
          className={cn(
            "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            trashView ? "bg-zinc-100 dark:bg-zinc-800/80" : "bg-stone-100 dark:bg-zinc-800/80"
          )}
        >
          <TypeIcon
            className={cn("h-4 w-4", trashView ? "text-zinc-600" : "text-zinc-600 dark:text-zinc-300")}
            strokeWidth={1.85}
            aria-hidden
          />
          {folder ? (
            <span
              className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-white dark:ring-zinc-900"
              style={{ backgroundColor: folder.color }}
              title={folder.name}
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-zinc-900 dark:text-zinc-100">{note.title}</p>
          {recording ? (
            <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-zinc-500 dark:text-zinc-400">
              {note.date}
              {note.duration ? ` · ${note.duration}` : ""}
              {note.source ? ` · ${note.source}` : ""}
            </p>
          ) : (
            <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-zinc-500 dark:text-zinc-400">{note.preview}</p>
          )}
        </div>
      </div>
      {note.highlightCount != null && note.highlightCount > 0 ? (
        <div className="mt-1.5 flex justify-end border-t border-stone-100/80 pt-1.5 dark:border-zinc-800">
          <span className="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-[8px] font-semibold text-mind dark:bg-stone-500 dark:text-mind/18">
            {note.highlightCount} highlights
          </span>
        </div>
      ) : null}
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
  activeAccountId: _activeAccountId,
  notes,
  folders,
  onNotesChange,
  onNoteClick,
  onStartRecording,
}: NotesTabProps) {
  const [showDeviceSheet, setShowDeviceSheet] = useState(false)
  const [showRecordOptions, setShowRecordOptions] = useState(false)
  const [showHardwareDetail, setShowHardwareDetail] = useState(false)
  const [isDeviceConnected, setIsDeviceConnected] = useState(true)
  const [deviceBatteryPercent, setDeviceBatteryPercent] = useState<number | null>(55)
  /** Filter: all / phone / device / trash; mutually exclusive with folder pick */
  const [fileScope, setFileScope] = useState<"all" | "phone" | "device" | "trash">("all")
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [showFilterSortSheet, setShowFilterSortSheet] = useState(false)
  const [notesViewMode, setNotesViewMode] = useState<"list" | "thumbnails">("list")

  const inListScope = (_n: Note) => true
  const nonArchived = notes.filter((n) => !n.archived)
  const archivedCount = notes.filter((n) => n.archived).length
  const phoneCount = nonArchived.filter((n) => n.type === "phone").length
  const deviceCount = nonArchived.filter((n) => n.type === "hardware").length

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

  const openDevicePrimary = () => {
    if (isDeviceConnected) setShowHardwareDetail(true)
    else setShowDeviceSheet(true)
  }

  return (
    <div className={cn("relative flex h-full flex-col", mx.shellCanvas)}>
      <div className={cn("border-b bg-white/95 backdrop-blur-sm", mx.shellHairline)}>
        <div className="flex items-center justify-between gap-2 px-4 pb-1 pt-2.5">
          <div className="flex min-w-0 items-center gap-0.5">
            <button
              type="button"
              onClick={openDevicePrimary}
              className="relative flex shrink-0 items-center justify-center rounded-lg p-1 text-zinc-900 transition-colors hover:bg-zinc-100/80 active:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800/70"
              aria-label={
                isDeviceConnected && deviceBatteryPercent != null
                  ? `Device status, battery ${deviceBatteryPercent} percent`
                  : isDeviceConnected
                    ? "Device status"
                    : "Connect device"
              }
              title={
                isDeviceConnected && deviceBatteryPercent != null
                  ? `Battery ${deviceBatteryPercent}% (demo)`
                  : undefined
              }
            >
              <RecorderGlyph
                batteryPercent={isDeviceConnected ? deviceBatteryPercent : null}
                className={cn(
                  isDeviceConnected ? mx.navIconGlow : "text-zinc-500 dark:text-zinc-400"
                )}
              />
            </button>
            <button
              type="button"
              onClick={() => setShowDeviceSheet(true)}
              className="flex shrink-0 items-center rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:bg-zinc-800/70"
              aria-label="Device menu"
            >
              <ChevronDown className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() =>
                toast.message("Smart search", {
                  description: "Search across all captures (demo).",
                })
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-zinc-100/70 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
              aria-label="Smart search"
            >
              <SmartSearchIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
            </button>
          </div>
        </div>
        <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-0.5">
          <button
            type="button"
            onClick={() => setShowFilterSortSheet(true)}
            className="flex min-w-0 items-center gap-1 py-1 text-left"
            aria-label="Filter and sort"
          >
            <span className="truncate text-[26px] font-bold leading-none tracking-tight text-zinc-900 dark:text-zinc-50">
              All files
            </span>
            <ChevronDown className="h-5 w-5 shrink-0 translate-y-px text-zinc-400" strokeWidth={2} />
          </button>
          {notesViewMode === "thumbnails" ? (
            <p className="shrink-0 pt-2 text-[11px] font-medium text-zinc-400">Thumbnails</p>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-y-contain px-0 pb-28 pt-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          <div className="grid grid-cols-3 gap-2 px-4 pb-2 pt-3">
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
          <div className="divide-y divide-zinc-100/90 px-4 dark:divide-zinc-800/80">
            {filteredNotes.map((note) =>
              isNoteProcessing(note) ? (
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
        <div className={cn("flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full", mx.navGlassShell, mx.navEase, "hover:scale-105 active:scale-95")}>
          <NotesRecordGlowIcon wellClassName="h-11 w-11" iconClassName="h-7 w-7" />
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
                  "flex w-full items-center gap-3 rounded-xl border border-stone-200/85 py-3.5 pl-4 pr-3 text-left",
                  mx.navGlassShell,
                  mx.navEase,
                  "hover:scale-[1.01] active:scale-[0.99]"
                )}
              >
                <NotesRecordGlowIcon className="shrink-0" wellClassName="h-10 w-10" iconClassName="h-5 w-5" />
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">Start recording</div>
                  <div className="text-[12px] text-zinc-500 dark:text-zinc-400">Phone mic or linked Mind Recorder</div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300 dark:text-zinc-500" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRecordOptions(false)
                  setShowDeviceSheet(true)
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-stone-200/85 bg-white py-3.5 pl-4 pr-3 text-left hover:bg-stone-50"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    isDeviceConnected ? "bg-mind" : "bg-zinc-300 dark:bg-zinc-600"
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

                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">View</p>
                <div className="mb-3 grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNotesViewMode("list")
                      setShowFilterSortSheet(false)
                      toast.success("List view", { description: "Comfortable rows with previews." })
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors",
                      notesViewMode === "list"
                        ? "border-zinc-400 bg-stone-100 dark:border-zinc-500 dark:bg-zinc-800"
                        : "border-stone-200/70 bg-stone-50/70 hover:bg-stone-100/85 dark:border-zinc-700/60 dark:bg-zinc-800/35 dark:hover:bg-zinc-800/55"
                    )}
                  >
                    <LayoutList className="h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-zinc-400" strokeWidth={2} aria-hidden />
                    <div className="min-w-0">
                      <span className="block text-[12px] font-medium leading-tight text-zinc-900 dark:text-zinc-100">List</span>
                      <span className="block text-[10px] leading-snug text-zinc-500">Rows + excerpt</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNotesViewMode("thumbnails")
                      setShowFilterSortSheet(false)
                      toast.success("Thumbnail view", { description: "Dense grid for quick scanning." })
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors",
                      notesViewMode === "thumbnails"
                        ? "border-zinc-400 bg-stone-100 dark:border-zinc-500 dark:bg-zinc-800"
                        : "border-stone-200/70 bg-stone-50/70 hover:bg-stone-100/85 dark:border-zinc-700/60 dark:bg-zinc-800/35 dark:hover:bg-zinc-800/55"
                    )}
                  >
                    <LayoutGrid className="h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-zinc-400" strokeWidth={2} aria-hidden />
                    <div className="min-w-0">
                      <span className="block text-[12px] font-medium leading-tight text-zinc-900 dark:text-zinc-100">Thumbnails</span>
                      <span className="block text-[10px] leading-snug text-zinc-500">Dense grid</span>
                    </div>
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
                      className="flex w-full items-center gap-3 rounded-xl py-3.5 pl-1 pr-2 text-left hover:bg-stone-50"
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
                      <div key={f.id} className="flex items-center gap-2 rounded-xl py-2 pl-1 pr-1 hover:bg-stone-50">
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
              </div>
            </div>
          </div>
        </div>
      )}

      <MindDevicesSheet
        open={showDeviceSheet}
        onClose={() => setShowDeviceSheet(false)}
        isDeviceConnected={isDeviceConnected}
        onSetDeviceConnected={(c) => {
          setIsDeviceConnected(c)
          setDeviceBatteryPercent(c ? 55 : null)
        }}
        onConnectedDeviceOpen={() => setShowHardwareDetail(true)}
      />

      <MindHardwareDetail
        open={showHardwareDetail}
        onBack={() => setShowHardwareDetail(false)}
        batteryPercent={deviceBatteryPercent ?? 55}
        onDisconnect={() => {
          setIsDeviceConnected(false)
          setDeviceBatteryPercent(null)
        }}
      />
    </div>
  )
}
