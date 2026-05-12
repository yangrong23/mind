"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { getMindAccount, accountSpaceLabel, type MindAccountId } from "@/lib/mind-accounts"
import { mx } from "@/lib/medrix-design-tokens"
import {
  Search, Mic,
  Bluetooth, X,
  Battery, HardDrive, RefreshCw, Wifi, Smartphone,
  Library, Trash2,
} from "lucide-react"

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
}

const mockNotes: Note[] = [
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
  onOpen: () => void
  onArchive?: () => void
  onDelete?: () => void
}

function SwipeableMemoCard({ note, onOpen, onArchive, onDelete }: SwipeableMemoCardProps) {
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
          <div className="flex items-center gap-2 text-[13px] text-gray-500">
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
        </div>
      </div>
    </div>
  )
}

interface NotesTabProps {
  activeAccountId: MindAccountId
  onNoteClick: (note: Note) => void
  onStartRecording: () => void
}

export function NotesTab({ activeAccountId, onNoteClick, onStartRecording }: NotesTabProps) {
  const activeAccount = getMindAccount(activeAccountId)
  const [showDeviceSheet, setShowDeviceSheet] = useState(false)
  const [isDeviceConnected, setIsDeviceConnected] = useState(true)
  const [filterType, setFilterType] = useState<"all" | "hardware" | "phone">("all")
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [notes, setNotes] = useState(mockNotes)

  const filteredNotes =
    filterType === "all" ? notes : notes.filter((n) => n.type === filterType)

  return (
    <div className="relative flex h-full flex-col bg-[#ebebe8]">
      <div className="border-b border-gray-300/90 bg-white">
        <div className="flex items-center justify-between px-5 py-3">
          <button type="button" onClick={() => setShowDeviceSheet(true)} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                isDeviceConnected ? "bg-sky-600" : "bg-gray-400"
              )}
            >
              <Bluetooth className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
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
            </div>
          </button>

          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-200">
            <Search className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-2 pt-5">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900">Notes</h1>
          <button
            type="button"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="relative flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-white"
          >
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="16" y2="12" />
              <line x1="4" y1="18" x2="12" y2="18" />
            </svg>
            {filterType !== "all" && (
              <span className="font-medium text-gray-900">
                {filterType === "hardware" ? "Hardware" : "Phone"}
              </span>
            )}
          </button>
        </div>

        {showFilterMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
            <div className="absolute right-5 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
              {[
                { id: "all", label: "All" },
                { id: "hardware", label: "Hardware" },
                { id: "phone", label: "Phone" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setFilterType(item.id as typeof filterType)
                    setShowFilterMenu(false)
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-gray-100",
                    filterType === item.id ? "font-medium text-gray-900" : "text-gray-700"
                  )}
                >
                  {item.label}
                  {filterType === item.id && (
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

      <div className="flex-1 overflow-y-auto px-4 pb-28 pt-2">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="max-w-[280px] text-[17px] leading-relaxed text-gray-700">
              Put on your Medrix Mind and capture your first spark in the real world.
            </p>
            <button
              type="button"
              onClick={onStartRecording}
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
                  onOpen={() => onNoteClick(note)}
                  onArchive={() => {}}
                  onDelete={() => setNotes((prev) => prev.filter((n) => n.id !== note.id))}
                />
              )
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onStartRecording}
        className="absolute bottom-7 right-6 z-30 flex items-center justify-center"
        aria-label="Start recording"
      >
        <div className="flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full bg-gradient-to-br from-zinc-400 via-zinc-500 to-stone-600 text-white shadow-[0_10px_28px_-6px_rgba(63,63,70,0.35)] ring-[3px] ring-white/95 transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-95">
          <Mic className="h-7 w-7" strokeWidth={2.25} />
        </div>
      </button>

      {showDeviceSheet && (
        <div className="absolute inset-0 z-50">
          <div className="absolute inset-0 bg-zinc-900/25" onClick={() => setShowDeviceSheet(false)} />
          <div className="absolute bottom-0 left-0 right-0 animate-in slide-in-from-bottom rounded-t-3xl bg-white duration-300">
            <div className="flex justify-center pb-2 pt-3">
              <div className="h-1 w-10 rounded-full bg-gray-400" />
            </div>
            <div className="flex items-center justify-between px-5 pb-4">
              <h3 className="text-lg font-semibold text-gray-900">Devices</h3>
              <button
                type="button"
                onClick={() => setShowDeviceSheet(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-200"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="px-5 pb-4">
              <div
                className={cn(
                  "rounded-2xl border-2 p-4 transition-all",
                  isDeviceConnected
                    ? "border-stone-300/80 bg-gradient-to-br from-stone-100 to-stone-50"
                    : "border-gray-300 bg-gray-100"
                )}
              >
                <div className="mb-4 flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl",
                      isDeviceConnected ? "bg-gradient-to-br from-sky-600 to-sky-800" : "bg-gray-400"
                    )}
                  >
                    <Bluetooth className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-semibold text-gray-900">Mind Recorder</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          isDeviceConnected ? "bg-zinc-700 text-white" : "bg-gray-300 text-gray-700"
                        )}
                      >
                        {isDeviceConnected ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">SN: MR-2024-001234</span>
                  </div>
                </div>

                {isDeviceConnected && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white/80 p-3 text-center">
                      <Battery className={cn("mx-auto mb-1 h-5 w-5", mx.navActiveIcon)} />
                      <div className="text-lg font-semibold text-gray-900">85%</div>
                      <div className="text-xs text-gray-600">Battery</div>
                    </div>
                    <div className="rounded-xl bg-white/80 p-3 text-center">
                      <HardDrive className={cn("mx-auto mb-1 h-5 w-5", mx.navActiveIcon)} />
                      <div className="text-lg font-semibold text-gray-900">2.3G</div>
                      <div className="text-xs text-gray-600">Free</div>
                    </div>
                    <div className="rounded-xl bg-white/80 p-3 text-center">
                      <Wifi className={cn("mx-auto mb-1 h-5 w-5", mx.navActiveIcon)} />
                      <div className="text-lg font-semibold text-gray-900">v2.1</div>
                      <div className="text-xs text-gray-600">Firmware</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 px-5 pb-6">
              {isDeviceConnected ? (
                <>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-500 py-3 font-medium text-white hover:bg-zinc-600"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Sync now
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeviceConnected(false)}
                    className="w-full rounded-xl bg-gray-200 py-3 font-medium text-gray-700 hover:bg-gray-300"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsDeviceConnected(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-500 py-3 font-medium text-white hover:bg-zinc-600"
                >
                  <Bluetooth className="h-5 w-5" />
                  Search & connect
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
