"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Camera, ChevronDown, Flag, Pencil } from "lucide-react"
import { toast } from "sonner"

export type RecordingCaptureEntry =
  | { id: string; kind: "mark"; atSec: number; body: string }
  | { id: string; kind: "text"; atSec: number; body: string }
  | { id: string; kind: "photo"; atSec: number; body: string }

export type ActiveRecordingViewProps = {
  title?: string
  initialEntries?: RecordingCaptureEntry[]
  onEnd: (payload: { durationSec: number; entries: RecordingCaptureEntry[] }) => void
  /** Save draft marks when minimizing back to the list */
  onPersist?: (payload: { durationSec: number; entries: RecordingCaptureEntry[] }) => void
  onClose: () => void
}

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

function formatStamp(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

let entryId = 0
function nextEntryId() {
  entryId += 1
  return `cap-${entryId}`
}

export function ActiveRecordingView({
  title,
  initialEntries = [],
  onEnd,
  onPersist,
  onClose,
}: ActiveRecordingViewProps) {
  const [paused, setPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [entries, setEntries] = useState<RecordingCaptureEntry[]>(initialEntries)
  const [textDraft, setTextDraft] = useState("")
  const [showTextInput, setShowTextInput] = useState(false)
  const [headerCollapsed, setHeaderCollapsed] = useState(false)

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setDuration((d) => d + 1), 1000)
    return () => clearInterval(t)
  }, [paused])

  const addMark = () => {
    setEntries((prev) => [
      ...prev,
      {
        id: nextEntryId(),
        kind: "mark",
        atSec: duration,
        body: "Marked — available after transcription",
      },
    ])
    toast.message("Marked", { description: formatStamp(duration) })
  }

  const submitText = () => {
    const body = textDraft.trim()
    if (!body) return
    setEntries((prev) => [...prev, { id: nextEntryId(), kind: "text", atSec: duration, body }])
    setTextDraft("")
    setShowTextInput(false)
  }

  const addPhoto = () => {
    setEntries((prev) => [
      ...prev,
      {
        id: nextEntryId(),
        kind: "photo",
        atSec: duration,
        body: "Photo attached (demo)",
      },
    ])
    toast.message("Photo captured", { description: "Saved to this recording (demo)." })
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white dark:bg-zinc-950">
      <header className="shrink-0 border-b border-stone-100 px-4 pb-2 pt-2 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="min-w-[3.5rem] text-left text-[15px] font-medium text-zinc-800 dark:text-zinc-200"
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            onClick={() => setHeaderCollapsed((c) => !c)}
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5"
            aria-expanded={!headerCollapsed}
          >
            <ChevronDown
              className={cn("h-4 w-4 text-zinc-400 transition-transform", headerCollapsed && "-rotate-180")}
              strokeWidth={2}
            />
            <span className="flex items-center gap-1.5 tabular-nums text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  paused ? "bg-zinc-300" : "bg-red-500 animate-pulse"
                )}
                aria-hidden
              />
              {formatClock(duration)}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onEnd({ durationSec: duration, entries })}
            className="min-w-[3.5rem] text-right text-[15px] font-medium text-zinc-800 dark:text-zinc-200"
          >
            End
          </button>
        </div>
        {!headerCollapsed && title ? (
          <p className="mt-1 truncate text-center text-[11px] text-zinc-400">{title}</p>
        ) : null}
        <p className="mt-2 text-center text-[11px] text-zinc-400">AI-generated content is for reference only</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {entries.length === 0 ? (
          <p className="text-[14px] leading-relaxed text-zinc-400">Add a mark, note, or photo during capture.</p>
        ) : (
          <ul className="space-y-5">
            {entries.map((entry) => (
              <li key={entry.id} className="flex gap-2">
                <Flag className="mt-1 h-3.5 w-3.5 shrink-0 text-zinc-300" strokeWidth={2} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="tabular-nums text-[12px] text-zinc-400">{formatStamp(entry.atSec)}</p>
                  {entry.kind === "photo" ? (
                    <div className="mt-2 flex h-24 w-32 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-[11px] text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
                      Photo
                    </div>
                  ) : null}
                  <p
                    className={cn(
                      "mt-0.5 break-words text-[15px] leading-snug",
                      entry.kind === "mark" ? "text-zinc-500" : "font-medium text-zinc-900 dark:text-zinc-100"
                    )}
                  >
                    {entry.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showTextInput ? (
        <div className="shrink-0 border-t border-stone-100 bg-stone-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/80">
          <textarea
            value={textDraft}
            onChange={(e) => setTextDraft(e.target.value)}
            rows={3}
            placeholder="Type a note for this moment…"
            className="w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-2 text-[14px] text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            autoFocus
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowTextInput(false)
                setTextDraft("")
              }}
              className="rounded-full px-3 py-1.5 text-[13px] font-medium text-zinc-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitText}
              className="rounded-full bg-zinc-900 px-4 py-1.5 text-[13px] font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Add
            </button>
          </div>
        </div>
      ) : null}

      <footer className="shrink-0 border-t border-stone-100 px-6 pb-8 pt-4 dark:border-zinc-800">
        <div className="flex items-end justify-center gap-10">
          <button type="button" onClick={() => setShowTextInput(true)} className="flex flex-col items-center gap-2">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-stone-300 bg-white dark:border-zinc-600 dark:bg-zinc-900">
              <Pencil className="h-5 w-5 text-zinc-700 dark:text-zinc-300" strokeWidth={1.75} />
            </span>
            <span className="text-[12px] text-zinc-500">Note</span>
          </button>
          <button type="button" onClick={addPhoto} className="flex flex-col items-center gap-2">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-stone-300 bg-white dark:border-zinc-600 dark:bg-zinc-900">
              <Camera className="h-5 w-5 text-zinc-700 dark:text-zinc-300" strokeWidth={1.75} />
            </span>
            <span className="text-[12px] text-zinc-500">Photo</span>
          </button>
          <button type="button" onClick={addMark} className="flex flex-col items-center gap-2">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-stone-300 bg-white dark:border-zinc-600 dark:bg-zinc-900">
              <Flag className="h-5 w-5 text-zinc-700 dark:text-zinc-300" strokeWidth={1.75} />
            </span>
            <span className="text-[12px] text-zinc-500">Mark</span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            onPersist?.({ durationSec: duration, entries })
            onClose()
          }}
          className="mt-4 w-full text-center text-[12px] text-zinc-400 underline-offset-2 hover:underline"
        >
          Minimize
        </button>
      </footer>
    </div>
  )
}
