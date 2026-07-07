"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { type MindAccountId } from "@/lib/mind-accounts"
import { mx } from "@/lib/medrix-design-tokens"
import {
  Mic,
  ChevronDown,
  FileText,
  Check,
  X,
  AlertCircle,
  PenLine,
  Library,
  Trash2,
  LayoutGrid,
  FolderInput,
} from "lucide-react"
import { toast } from "sonner"
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"
import { MindDevicesSheet } from "@/components/mind-v2/mind-devices-sheet"
import { MindHardwareDetail } from "@/components/mind-v2/mind-hardware-detail"
import { NoteShareLibrarySheet } from "@/components/mind-v2/note-share-library-sheet"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import {
  isNoteInDevicePipeline,
  isNoteProcessing,
  isNoteRecording,
  isNoteSyncing,
  isNoteTransferring,
  noteStatusListLabel,
} from "@/lib/note-status"
import { DeviceTransferBanner } from "@/components/mind-v2/device-transfer-banner"
import { Cloud, Loader2 } from "lucide-react"
import type { Note, NoteStatus } from "@/lib/note-types"
import { TextNoteEditor } from "@/components/mind-v2/text-note-editor"
import { MemosSearchSheet } from "@/components/mind-v2/memos-search-sheet"
import {
  memoMatchesQuery,
  memoMatchesTimeSpan,
  memoSearchIsActive,
  sortMemos,
  type MemoSortMode,
  type MemoTimeSpan,
} from "@/lib/memo-list-filter"
import {
  createRecordingNote,
  DEMO_ACTIVE_RECORDING_NOTE,
  mockNotes,
} from "@/lib/mock-notes"
import type { NoteChatLaunchContext } from "@/lib/note-chat-context"

export type { Note, NoteStatus }
export { createRecordingNote, DEMO_ACTIVE_RECORDING_NOTE, mockNotes }

type MemoFilter = "all" | "recordings" | "notes"

const ARCHIVE_STRIP_PX = 92
const DELETE_STRIP_PX = 88
const SWIPE_SNAP_THRESHOLD = 40

function stripHtmlPreview(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function isRecordingMemo(note: Note) {
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

/** Mic well — default matches bottom-nav bloom; `fab` uses centered circular fill for Notes record button */
function NotesRecordGlowIcon({
  className,
  wellClassName = "h-10 w-10",
  iconClassName = "h-6 w-6",
  variant = "default",
}: {
  className?: string
  wellClassName?: string
  iconClassName?: string
  variant?: "default" | "fab"
}) {
  const isFab = variant === "fab"
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        isFab ? "size-full rounded-full" : "rounded-2xl",
        wellClassName,
        className
      )}
    >
      {isFab ? (
        <>
          <span
            className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-sky-200 via-sky-100 to-cyan-100 dark:from-sky-900 dark:via-sky-950 dark:to-cyan-950"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_36%,rgba(255,255,255,0.55)_0%,rgba(186,230,253,0.28)_38%,rgba(125,211,252,0)_62%)] dark:bg-[radial-gradient(circle_at_50%_36%,rgba(56,189,248,0.4)_0%,rgba(2,132,199,0.15)_42%,rgba(2,132,199,0)_62%)]"
            aria-hidden
          />
        </>
      ) : (
        <>
          <span className={mx.navBloomOuter} aria-hidden />
          <span className={mx.navBloomInner} aria-hidden />
        </>
      )}
      <Mic className={cn("relative z-[1]", iconClassName, mx.navIconGlow)} strokeWidth={2.1} aria-hidden />
    </div>
  )
}

/** Record + new note — twin elevated pills */
function NotesDualEntryBar({
  onRecord,
  onNewNote,
}: {
  onRecord: () => void
  onNewNote: () => void
}) {
  const pillClass = cn(
    "flex min-h-[46px] min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-4",
    "border border-stone-200/45 bg-white text-[14px] font-semibold tracking-tight text-zinc-900",
    "shadow-[0_10px_28px_-12px_rgba(15,23,42,0.1),0_2px_8px_-4px_rgba(15,23,42,0.04)]",
    mx.pressable,
    "dark:border-zinc-700/55 dark:bg-zinc-900 dark:text-zinc-100"
  )

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-5 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-4">
      <div
        className="pointer-events-auto mx-auto flex max-w-md items-stretch gap-2.5"
        role="group"
        aria-label="Create memo"
      >
        <button type="button" onClick={onRecord} className={pillClass} aria-label="Start recording">
          <Mic className="h-[18px] w-[18px] shrink-0 text-mind" strokeWidth={2.25} aria-hidden />
          <span className="truncate">Record</span>
        </button>
        <button type="button" onClick={onNewNote} className={pillClass} aria-label="New note">
          <PenLine className="h-[18px] w-[18px] shrink-0 text-mind" strokeWidth={2} aria-hidden />
          <span className="truncate">New note</span>
        </button>
      </div>
    </div>
  )
}

function NoteCardSkeleton() {
  return (
    <div className={cn("animate-pulse p-5", mx.memoCard)} aria-hidden>
      <div className="h-4 w-[72%] max-w-md rounded bg-zinc-200/85" />
      <div className="mt-2.5 h-3 w-[42%] rounded bg-zinc-100/90" />
      <div className="mt-2.5 h-3 w-28 rounded bg-zinc-100/80" />
    </div>
  )
}

function MemoStatusBadge({
  variant,
  compact = false,
}: {
  variant: "recording" | "transferring" | "syncing" | "failed"
  compact?: boolean
}) {
  const label =
    variant === "recording"
      ? "Recording"
      : variant === "transferring"
        ? "Transferring…"
        : variant === "syncing"
          ? "Waiting to sync…"
          : "Processing failed"

  const tone =
    variant === "failed"
      ? "border-red-500/20 bg-red-500/[0.08] text-red-600 dark:bg-red-500/10 dark:text-red-400"
      : variant === "recording"
        ? "border-red-500/20 bg-red-500/[0.08] text-red-600 dark:bg-red-500/10 dark:text-red-400"
        : "border-sky-500/20 bg-sky-500/[0.08] text-sky-700 dark:bg-sky-500/10 dark:text-sky-400"

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border font-medium",
        tone,
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]"
      )}
    >
      {variant === "recording" ? (
        <span className={cn("rounded-full bg-red-500 animate-pulse", compact ? "h-1 w-1" : "h-1.5 w-1.5")} aria-hidden />
      ) : variant === "transferring" ? (
        <Loader2 className={cn("shrink-0 animate-spin", compact ? "h-3 w-3" : "h-3.5 w-3.5")} strokeWidth={2.5} aria-hidden />
      ) : variant === "syncing" ? (
        <Cloud className={cn("shrink-0", compact ? "h-3 w-3" : "h-3.5 w-3.5")} strokeWidth={2} aria-hidden />
      ) : (
        <AlertCircle className={cn("shrink-0", compact ? "h-3 w-3" : "h-3.5 w-3.5")} strokeWidth={2} aria-hidden />
      )}
      {label}
    </span>
  )
}

function MemoCardMetaRow({
  note,
  status,
}: {
  note: Note
  status?: "recording" | "transferring" | "syncing" | "failed"
}) {
  const meta = [note.date, note.duration].filter(Boolean).join(" · ")
  const autoStatus = noteStatusListLabel(note.status)
  const badgeVariant =
    status ??
    (note.status === "transferring"
      ? "transferring"
      : note.status === "syncing" || note.status === "pending"
        ? "syncing"
        : undefined)

  return (
    <div className="mt-1.5 flex items-center justify-between gap-3 text-[13px] tabular-nums text-zinc-400">
      <span className="min-w-0 truncate">{meta || autoStatus || "\u00a0"}</span>
      {badgeVariant ? <MemoStatusBadge variant={badgeVariant} /> : null}
    </div>
  )
}

function RecordingMemoRow({
  note,
}: {
  note: Note
}) {
  return (
    <div
      className={cn(
        "w-full p-5 text-left",
        mx.memoCard
      )}
    >
      {note.listSubtitle ? (
        <p className="mb-1 text-[11px] leading-tight text-zinc-400">{note.listSubtitle}</p>
      ) : null}
      <h3 className="line-clamp-2 text-[16px] font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">
        {note.title}
      </h3>
      <MemoCardMetaRow note={note} status="recording" />
    </div>
  )
}

function SwipeableMemoCard({
  note,
  onOpen,
  onArchive,
  onDelete,
}: {
  note: Note
  onOpen: () => void
  onArchive?: () => void
  onDelete?: () => void
}) {
  const startX = useRef(0)
  const startDx = useRef(0)
  const [dx, setDx] = useState(0)
  const dragging = useRef(false)

  const snapClosed = () => setDx(0)
  const snapArchive = () => setDx(-ARCHIVE_STRIP_PX)
  const snapDelete = () => setDx(DELETE_STRIP_PX)

  const onStart = (clientX: number) => {
    startX.current = clientX
    startDx.current = dx
    dragging.current = true
  }
  const onMove = (clientX: number) => {
    if (!dragging.current) return
    const next = startDx.current + (clientX - startX.current)
    setDx(Math.max(-ARCHIVE_STRIP_PX, Math.min(DELETE_STRIP_PX, next)))
  }
  const onEnd = () => {
    dragging.current = false
    if (dx < -SWIPE_SNAP_THRESHOLD) {
      snapArchive()
      return
    }
    if (dx > SWIPE_SNAP_THRESHOLD) {
      snapDelete()
      return
    }
    snapClosed()
  }

  const archiveRevealed = dx <= -SWIPE_SNAP_THRESHOLD / 2
  const deleteRevealed = dx >= SWIPE_SNAP_THRESHOLD / 2
  const rowRevealed = archiveRevealed || deleteRevealed

  return (
    <div className={cn("relative overflow-hidden rounded-2xl", mx.memoCard)}>
      <button
        type="button"
        style={{ width: DELETE_STRIP_PX }}
        className={cn(
          "absolute inset-y-0 left-0 z-20 flex flex-col items-center justify-center gap-0.5 bg-red-600 text-white transition-opacity",
          deleteRevealed ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-label={`Delete ${note.title}`}
        onClick={(e) => {
          e.stopPropagation()
          onDelete?.()
          snapClosed()
        }}
      >
        <Trash2 className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="text-[11px] font-semibold">Delete</span>
      </button>

      <button
        type="button"
        style={{ width: ARCHIVE_STRIP_PX }}
        className={cn(
          "absolute inset-y-0 right-0 z-20 flex flex-col items-center justify-center gap-0.5 bg-zinc-600 text-white transition-opacity",
          archiveRevealed ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-label={`Save ${note.title} to library`}
        onClick={(e) => {
          e.stopPropagation()
          onArchive?.()
          snapClosed()
        }}
      >
        <Library className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="px-1 text-center text-[11px] font-semibold leading-tight">Library</span>
      </button>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && (rowRevealed ? snapClosed() : onOpen())}
        onClick={() => {
          if (rowRevealed) {
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
        className="relative z-10 w-full cursor-pointer select-none bg-white text-left dark:bg-zinc-950"
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging.current ? "none" : "transform 0.2s ease-out",
        }}
      >
        <MemoTextCard note={note} embedded />
      </div>
    </div>
  )
}

function MemoTextCard({
  note,
  embedded = false,
}: {
  note: Note
  embedded?: boolean
}) {
  return (
    <div className={cn("w-full p-5 text-left", !embedded && mx.memoCard)}>
      {note.listSubtitle ? (
        <p className="mb-1 text-[11px] leading-tight text-zinc-400">{note.listSubtitle}</p>
      ) : null}
      <h3
        className={cn(
          "line-clamp-2 text-[16px] font-semibold leading-snug tracking-tight",
          note.processingFailed ? "text-zinc-400" : "text-zinc-900 dark:text-zinc-50"
        )}
      >
        {note.title}
      </h3>
      <p className={cn("mt-1 line-clamp-1", mx.typeBodySecondary)}>{note.preview}</p>
      <MemoCardMetaRow note={note} status={note.processingFailed ? "failed" : undefined} />
      {note.highlightCount != null && note.highlightCount > 0 ? (
        <div className="mt-2 text-[12px] text-zinc-500">{note.highlightCount} highlights</div>
      ) : null}
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
  onOpen,
}: {
  note: Note
  onOpen: () => void
}) {
  if (isNoteProcessing(note) && !isNoteInDevicePipeline(note)) {
    return <NoteThumbnailSkeleton />
  }

  const TypeIcon = isRecordingMemo(note) ? Mic : FileText
  const inProgress =
    isNoteRecording(note) || isNoteTransferring(note) || isNoteSyncing(note) || note.status === "pending"

  if (inProgress) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex min-h-[100px] w-full flex-col p-2.5 text-left transition-all active:scale-[0.98]",
          mx.memoCard
        )}
      >
        <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-zinc-900 dark:text-zinc-100">{note.title}</p>
        {note.listSubtitle ? (
          <p className="mt-1 text-[10px] text-zinc-400">{note.listSubtitle}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="min-w-0 truncate text-[10px] tabular-nums text-zinc-400">
            {[note.date, note.duration].filter(Boolean).join(" · ")}
          </span>
          <MemoStatusBadge
            variant={
              isNoteTransferring(note)
                ? "transferring"
                : isNoteSyncing(note) || note.status === "pending"
                  ? "syncing"
                  : "recording"
            }
            compact
          />
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group flex min-h-[100px] flex-col p-2.5 text-left transition-all active:scale-[0.98]",
        mx.memoCard
      )}
    >
      <div className="flex min-h-0 flex-1 gap-2">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-zinc-800/80">
          <TypeIcon className="h-4 w-4 text-zinc-600 dark:text-zinc-300" strokeWidth={1.85} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "line-clamp-2 text-[11px] font-semibold leading-snug",
              note.processingFailed ? "text-zinc-400" : "text-zinc-900 dark:text-zinc-100"
            )}
          >
            {note.title}
          </p>
          {isRecordingMemo(note) ? (
            <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-zinc-500 dark:text-zinc-400">
              {[note.date, note.duration].filter(Boolean).join(" · ")}
            </p>
          ) : (
            <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-zinc-500 dark:text-zinc-400">{note.preview}</p>
          )}
        </div>
      </div>
      {note.processingFailed ? (
        <div className="mt-2 flex justify-end">
          <MemoStatusBadge variant="failed" compact />
        </div>
      ) : null}
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

function isMemoSelectable(note: Note) {
  if (isNoteProcessing(note) && !isNoteInDevicePipeline(note)) return false
  return true
}

function MemoSelectionCheckbox({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        "mt-5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
        selected ? "border-mind bg-mind text-white" : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900"
      )}
      aria-hidden
    >
      {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
    </span>
  )
}

function MemoListItem({
  note,
  selectionMode,
  selected,
  onToggleSelect,
  onOpen,
  onArchive,
  onDelete,
}: {
  note: Note
  selectionMode: boolean
  selected: boolean
  onToggleSelect: () => void
  onOpen: () => void
  onArchive?: () => void
  onDelete?: () => void
}) {
  const recordingInProgress =
    isRecordingMemo(note) &&
    (isNoteRecording(note) || isNoteTransferring(note) || isNoteSyncing(note))

  if (!selectionMode) {
    if (recordingInProgress) {
      return (
        <button
          type="button"
          onClick={onOpen}
          className="w-full text-left transition-transform active:scale-[0.99]"
        >
          <RecordingMemoRow note={note} />
        </button>
      )
    }
    return (
      <SwipeableMemoCard
        note={note}
        onOpen={onOpen}
        onArchive={onArchive}
        onDelete={onDelete}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={onToggleSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-3 text-left transition-colors",
        selected && "rounded-2xl ring-2 ring-mind/25 ring-offset-2 ring-offset-[var(--mind-page-bg)] dark:ring-offset-zinc-950"
      )}
    >
      <MemoSelectionCheckbox selected={selected} />
      <div className="min-w-0 flex-1">
        {recordingInProgress ? <RecordingMemoRow note={note} /> : <MemoTextCard note={note} />}
      </div>
    </button>
  )
}

function MemoLibraryPickBar({
  selectedCount,
  onMove,
}: {
  selectedCount: number
  onMove: () => void
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-5 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-4">
      <button
        type="button"
        disabled={selectedCount === 0}
        onClick={onMove}
        className={cn(
          "pointer-events-auto mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-semibold text-white shadow-lg transition-opacity",
          mx.brandCta,
          selectedCount === 0 && "cursor-not-allowed opacity-45"
        )}
      >
        <Library className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        Move to library{selectedCount > 0 ? ` (${selectedCount})` : ""}
      </button>
    </div>
  )
}

interface NotesTabProps {
  activeAccountId: MindAccountId
  notes: Note[]
  onNotesChange: (notes: Note[]) => void
  onNoteClick: (note: Note) => void
  onStartRecording: () => void
  onNoteChat?: (context: NoteChatLaunchContext) => void
  requireAuthThen?: (run: () => void) => void
  /** Restore rich-text editor after returning from note chat */
  resumeTextEditorNote?: Note | null
  onResumeTextEditorConsumed?: () => void
  isDeviceConnected: boolean
  deviceBatteryPercent: number | null
  onSetDeviceConnected: (connected: boolean) => void
}

export function NotesTab({
  activeAccountId: _activeAccountId,
  notes,
  onNotesChange,
  onNoteClick,
  onStartRecording,
  onNoteChat,
  requireAuthThen,
  resumeTextEditorNote,
  onResumeTextEditorConsumed,
  isDeviceConnected,
  deviceBatteryPercent,
  onSetDeviceConnected,
}: NotesTabProps) {
  const [showDeviceSheet, setShowDeviceSheet] = useState(false)
  const [textEditor, setTextEditor] = useState<null | "new" | Note>(null)
  const [showHardwareDetail, setShowHardwareDetail] = useState(false)
  const [libraryPickMode, setLibraryPickMode] = useState(false)
  const [selectedNoteIds, setSelectedNoteIds] = useState<number[]>([])
  const [librarySheetNoteIds, setLibrarySheetNoteIds] = useState<number[] | null>(null)

  useEffect(() => {
    if (!resumeTextEditorNote) return
    setTextEditor(resumeTextEditorNote)
    onResumeTextEditorConsumed?.()
  }, [resumeTextEditorNote, onResumeTextEditorConsumed])
  const [memoFilter, setMemoFilter] = useState<MemoFilter>("all")
  const [showFilterSortSheet, setShowFilterSortSheet] = useState(false)
  const [showSearchSheet, setShowSearchSheet] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchTimeSpan, setSearchTimeSpan] = useState<MemoTimeSpan>("all")
  const [searchSortMode, setSearchSortMode] = useState<MemoSortMode>("newest")

  const recordingCount = notes.filter((n) => isRecordingMemo(n)).length
  const textNoteCount = notes.filter((n) => n.type === "text").length

  const filteredNotes = useMemo(() => {
    const typeFiltered = notes.filter((n) => {
      if (memoFilter === "recordings") return isRecordingMemo(n)
      if (memoFilter === "notes") return n.type === "text"
      return true
    })
    const searched = typeFiltered.filter(
      (n) => memoMatchesQuery(n, searchQuery) && memoMatchesTimeSpan(n, searchTimeSpan)
    )
    return sortMemos(searched, searchSortMode)
  }, [notes, memoFilter, searchQuery, searchTimeSpan, searchSortMode])

  const searchActive = memoSearchIsActive(searchQuery, searchTimeSpan, searchSortMode)

  const selectableFilteredNotes = filteredNotes.filter(isMemoSelectable)
  const allSelectableSelected =
    selectableFilteredNotes.length > 0 &&
    selectableFilteredNotes.every((n) => selectedNoteIds.includes(n.id))

  const filterLabel =
    memoFilter === "recordings" ? "Recordings" : memoFilter === "notes" ? "Notes" : "All memos"

  const openDevicePrimary = () => {
    if (isDeviceConnected) setShowHardwareDetail(true)
    else setShowDeviceSheet(true)
  }

  const openNewRichTextNote = () => {
    setTextEditor("new")
  }

  const openNote = (note: Note) => {
    if (note.type === "text") {
      setTextEditor(note)
      return
    }
    onNoteClick(note)
  }

  const showDualEntry = textEditor === null && !libraryPickMode

  function exitLibraryPickMode() {
    setLibraryPickMode(false)
    setSelectedNoteIds([])
  }

  function enterLibraryPickMode() {
    const run = () => {
      if (selectableFilteredNotes.length === 0) {
        toast.message("Nothing to move", { description: "Wait for memos to finish processing first." })
        return
      }
      setLibraryPickMode(true)
      setSelectedNoteIds([])
    }
    if (requireAuthThen) requireAuthThen(run)
    else run()
  }

  function toggleNoteSelection(noteId: number) {
    setSelectedNoteIds((prev) =>
      prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [...prev, noteId]
    )
  }

  function toggleSelectAll() {
    if (allSelectableSelected) {
      setSelectedNoteIds([])
      return
    }
    setSelectedNoteIds(selectableFilteredNotes.map((n) => n.id))
  }

  function openLibrarySheetForSelection() {
    if (selectedNoteIds.length === 0) return
    setLibrarySheetNoteIds([...selectedNoteIds])
  }

  const handleStartRecord = () => {
    if (!isDeviceConnected) {
      toast.message("Connect your Mindar Recorder", {
        description: "Pair your recorder to start capturing.",
      })
      setShowDeviceSheet(true)
      return
    }
    onStartRecording()
  }

  function handleSaveNotesToLibrary(
    noteIds: number[],
    kbName: string,
    options: { removeFromMemos: boolean }
  ) {
    const count = noteIds.length
    if (options.removeFromMemos) {
      const removeSet = new Set(noteIds)
      onNotesChange(notes.filter((n) => !removeSet.has(n.id)))
    }
    toast.success(count === 1 ? `Saved to ${kbName}` : `Saved ${count} memos to ${kbName}`, {
      description: options.removeFromMemos
        ? count === 1
          ? "Removed from Memos — find it in Library."
          : "Removed from Memos — find them in Library."
        : count === 1
          ? "A copy is now in your library."
          : "Copies are now in your library.",
    })
    exitLibraryPickMode()
  }

  return (
    <div className={cn("relative flex h-full flex-col", mx.pageBg)}>
      <div className={mx.tabHeaderBar}>
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
          <button
            type="button"
            onClick={() => setShowSearchSheet(true)}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
              searchActive
                ? "bg-mind/10 text-mind ring-1 ring-mind/20"
                : "text-zinc-600 hover:bg-zinc-100/70 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
            )}
            aria-label="Search memos"
          >
            <SmartSearchIcon
              className={cn(
                "h-5 w-5",
                searchActive ? "text-mind" : "text-zinc-600 dark:text-zinc-300"
              )}
            />
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-0.5">
          {libraryPickMode ? (
            <>
              <button
                type="button"
                onClick={exitLibraryPickMode}
                className="shrink-0 text-[15px] font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Cancel
              </button>
              <p className="min-w-0 flex-1 truncate text-center text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
                {selectedNoteIds.length === 0
                  ? "Select memos"
                  : `${selectedNoteIds.length} selected`}
              </p>
              <button
                type="button"
                onClick={toggleSelectAll}
                disabled={selectableFilteredNotes.length === 0}
                className="shrink-0 text-[15px] font-semibold text-mind disabled:opacity-40"
              >
                {allSelectableSelected ? "Clear" : "All"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowFilterSortSheet(true)}
                className="flex min-w-0 flex-1 items-center gap-1 py-1 text-left"
                aria-label="Filter memos"
              >
                <span className="truncate text-[26px] font-bold leading-none tracking-tight text-zinc-900 dark:text-zinc-50">
                  {filterLabel}
                </span>
                <ChevronDown className="h-5 w-5 shrink-0 translate-y-px text-zinc-400" strokeWidth={2} />
              </button>
              {selectableFilteredNotes.length > 0 ? (
                <button
                  type="button"
                  onClick={enterLibraryPickMode}
                  className="rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-100/70 dark:text-zinc-400 dark:hover:bg-zinc-800/80"
                  aria-label="Move to library"
                >
                  <FolderInput className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto overscroll-y-contain px-0 pt-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          libraryPickMode
            ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))]"
            : showDualEntry
              ? "pb-[calc(4.75rem+env(safe-area-inset-bottom))]"
              : "pb-2"
        )}
      >
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="max-w-[280px] text-[17px] leading-relaxed text-zinc-700">
              {searchActive
                ? "No memos match your search. Try a wider time range or different sort."
                : "Put on your Mindar and capture your first spark in the real world."}
            </p>
            {searchActive ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("")
                  setSearchTimeSpan("all")
                  setSearchSortMode("newest")
                }}
                className={cn(
                  "mt-6 rounded-full px-6 py-3 text-[15px] font-semibold text-zinc-700 ring-1 ring-stone-200",
                  "dark:text-zinc-200 dark:ring-zinc-700"
                )}
              >
                Reset search
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartRecord}
                className={cn("mt-6 rounded-full px-6 py-3 text-[15px] font-semibold text-white shadow-sm", mx.brandCta)}
              >
                Start recording
              </button>
            )}
          </div>
        ) : (
          <div className="pb-2 pt-3">
            {filteredNotes.some((n) => isNoteTransferring(n)) ? (
              <DeviceTransferBanner
                onFastTransfer={() =>
                  toast.message("Fast transfer", { description: "Uses Wi‑Fi direct when available (demo)." })
                }
              />
            ) : null}
            <div className="space-y-4 px-5">
              {filteredNotes.map((note) => {
                if (!isMemoSelectable(note)) {
                  return <NoteCardSkeleton key={note.id} />
                }

                return (
                  <MemoListItem
                    key={note.id}
                    note={note}
                    selectionMode={libraryPickMode}
                    selected={selectedNoteIds.includes(note.id)}
                    onToggleSelect={() => toggleNoteSelection(note.id)}
                    onOpen={() => openNote(note)}
                    onArchive={() => setLibrarySheetNoteIds([note.id])}
                    onDelete={() => {
                      onNotesChange(notes.filter((n) => n.id !== note.id))
                      toast.message("Moved to trash", { description: "Demo — memo removed from list." })
                    }}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>

      {libraryPickMode ? (
        <MemoLibraryPickBar
          selectedCount={selectedNoteIds.length}
          onMove={openLibrarySheetForSelection}
        />
      ) : showDualEntry ? (
        <NotesDualEntryBar onRecord={handleStartRecord} onNewNote={openNewRichTextNote} />
      ) : null}

      {showSearchSheet ? (
        <MemosSearchSheet
          open={showSearchSheet}
          query={searchQuery}
          timeSpan={searchTimeSpan}
          sortMode={searchSortMode}
          resultCount={filteredNotes.length}
          onQueryChange={setSearchQuery}
          onTimeSpanChange={setSearchTimeSpan}
          onSortModeChange={setSearchSortMode}
          onClose={() => setShowSearchSheet(false)}
          onClear={() => {
            setSearchQuery("")
            setSearchTimeSpan("all")
            setSearchSortMode("newest")
          }}
        />
      ) : null}

      {showFilterSortSheet && (
        <div className="absolute inset-0 z-[45] flex flex-col justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close filters"
            onClick={() => setShowFilterSortSheet(false)}
          />
          <div className="relative max-h-[70vh] overflow-hidden rounded-t-[1.35rem] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-stone-100/80 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-[18px] font-bold text-zinc-900 dark:text-zinc-100">Filter</h2>
              <button
                type="button"
                onClick={() => setShowFilterSortSheet(false)}
                className="rounded-full p-2 text-zinc-500 hover:bg-stone-100/85 dark:hover:bg-zinc-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="space-y-0.5 px-5 pb-8 pt-2">
              {(
                [
                  { id: "all" as const, label: "All memos", count: notes.length },
                  { id: "recordings" as const, label: "Recordings", count: recordingCount },
                  { id: "notes" as const, label: "Notes", count: textNoteCount },
                ] as const
              ).map((row) => {
                const active = memoFilter === row.id
                const RowIcon =
                  row.id === "all" ? LayoutGrid : row.id === "recordings" ? Mic : PenLine
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => {
                      setMemoFilter(row.id)
                      setShowFilterSortSheet(false)
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl py-3.5 pl-1 pr-2 text-left transition-colors",
                      active
                        ? "bg-stone-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                        : "hover:bg-stone-50 dark:hover:bg-zinc-800/40"
                    )}
                  >
                    <RowIcon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        active ? "text-mind" : "text-zinc-400 dark:text-zinc-500"
                      )}
                      strokeWidth={1.85}
                      aria-hidden
                    />
                    <span className="flex-1 text-[15px]">
                      {row.label}{" "}
                      <span className="text-zinc-400">({row.count})</span>
                    </span>
                    {active ? <Check className="h-5 w-5 shrink-0 text-zinc-900 dark:text-zinc-100" strokeWidth={2.5} /> : null}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <MindDevicesSheet
        open={showDeviceSheet}
        onClose={() => setShowDeviceSheet(false)}
        isDeviceConnected={isDeviceConnected}
        onSetDeviceConnected={(c) => {
          onSetDeviceConnected(c)
        }}
        onConnectedDeviceOpen={() => setShowHardwareDetail(true)}
      />

      <MindHardwareDetail
        open={showHardwareDetail}
        onBack={() => setShowHardwareDetail(false)}
        batteryPercent={deviceBatteryPercent ?? 55}
        onDisconnect={() => {
          onSetDeviceConnected(false)
        }}
      />

      {textEditor !== null ? (
        <div className="absolute inset-0 z-[50] bg-white dark:bg-zinc-950">
          <TextNoteEditor
            key={textEditor === "new" ? "text-new" : `text-${textEditor.id}`}
            note={
              textEditor === "new"
                ? undefined
                : {
                    id: textEditor.id,
                    title: textEditor.title,
                    html: textEditor.bodyHtml ?? textEditor.preview,
                  }
            }
            onBack={() => setTextEditor(null)}
            requireAuthThen={requireAuthThen}
            draftReturnNote={
              textEditor === "new"
                ? {
                    id: 0,
                    title: "Untitled",
                    type: "text",
                    date: "Draft",
                    preview: "",
                    status: "analyzed",
                    source: "Rich text",
                  }
                : textEditor
            }
            onSave={({ title, html }) => {
              const preview = stripHtmlPreview(html) || "Empty note"
              if (textEditor === "new") {
                const nextId = notes.reduce((max, n) => Math.max(max, n.id), 0) + 1
                onNotesChange([
                  {
                    id: nextId,
                    title: title.trim() || "Untitled",
                    type: "text",
                    date: "Just now",
                    preview,
                    bodyHtml: html,
                    status: "analyzed",
                    source: "Rich text",
                  },
                  ...notes,
                ])
                toast.success("Note saved", { description: title.trim() || "Untitled" })
              } else {
                onNotesChange(
                  notes.map((n) =>
                    n.id === textEditor.id
                      ? { ...n, title: title.trim() || "Untitled", preview, bodyHtml: html }
                      : n
                  )
                )
                toast.success("Note updated")
              }
              setTextEditor(null)
            }}
            onSaveToLibrary={(kb, options) => {
              const noteId = textEditor === "new" ? 0 : textEditor.id
              if (noteId > 0) {
                handleSaveNotesToLibrary([noteId], kb.name, options)
                if (options.removeFromMemos) setTextEditor(null)
              } else {
                toast.success(`Saved to ${kb.name}`, {
                  description: "Save the note first to remove it from Memos.",
                })
              }
            }}
          />
        </div>
      ) : null}

      <NoteShareLibrarySheet
        open={librarySheetNoteIds != null}
        onClose={() => setLibrarySheetNoteIds(null)}
        noteTitle={
          librarySheetNoteIds?.length === 1
            ? notes.find((n) => n.id === librarySheetNoteIds[0])?.title ?? "Memo"
            : `${librarySheetNoteIds?.length ?? 0} memos`
        }
        selectionCount={librarySheetNoteIds?.length ?? 0}
        noteId={librarySheetNoteIds?.length === 1 ? librarySheetNoteIds[0] : undefined}
        onSaveToLibrary={(kb: KnowledgeBase, options) => {
          if (!librarySheetNoteIds?.length) return
          handleSaveNotesToLibrary(librarySheetNoteIds, kb.name, options)
          setLibrarySheetNoteIds(null)
        }}
      />
    </div>
  )
}
