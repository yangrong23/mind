"use client"

import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import {
  ChevronDown,
  FileUp,
  FileText,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type NotesImportSourceId =
  | "markdown"
  | "notion"
  | "evernote"
  | "obsidian"
  | "apple-notes"
  | "google-keep"
  | "onenote"
  | "roam"
  | "bear"
  | "simplenote"

type ImportSource = {
  id: NotesImportSourceId
  label: string
  /** Short brand mark for the tile */
  mark: string
  markClass: string
  blurb: string
}

const OVERSEAS_SOURCES: ImportSource[] = [
  {
    id: "notion",
    label: "Notion",
    mark: "N",
    markClass: "bg-zinc-900 text-white",
    blurb: "Export workspace as Markdown or HTML",
  },
  {
    id: "evernote",
    label: "Evernote",
    mark: "🐘",
    markClass: "bg-[#00A82D] text-white text-sm",
    blurb: ".enex export or legacy notebook",
  },
  {
    id: "obsidian",
    label: "Obsidian",
    mark: "◆",
    markClass: "bg-violet-600 text-white",
    blurb: "Vault folder or .md files",
  },
  {
    id: "apple-notes",
    label: "Apple Notes",
    mark: "📝",
    markClass: "bg-amber-400 text-zinc-900 text-sm",
    blurb: "Export from Notes app (demo)",
  },
  {
    id: "google-keep",
    label: "Google Keep",
    mark: "K",
    markClass: "bg-amber-500 text-white",
    blurb: "Google Takeout export",
  },
  {
    id: "onenote",
    label: "OneNote",
    mark: "1",
    markClass: "bg-[#7719AA] text-white",
    blurb: "Section export as .docx / PDF",
  },
  {
    id: "roam",
    label: "Roam / Logseq",
    mark: "∞",
    markClass: "bg-sky-600 text-white",
    blurb: "JSON or Markdown graph export",
  },
  {
    id: "bear",
    label: "Bear",
    mark: "B",
    markClass: "bg-red-500 text-white",
    blurb: "Bear archive (.bear2backup)",
  },
  {
    id: "simplenote",
    label: "Simplenote",
    mark: "S",
    markClass: "bg-zinc-700 text-white",
    blurb: "JSON export from Automattic",
  },
]

export function WebNotesImportDialog({
  open,
  onClose,
  onImportFiles,
  onImportFromSource,
}: {
  open: boolean
  onClose: () => void
  onImportFiles: (files: FileList) => void
  onImportFromSource: (sourceId: NotesImportSourceId) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [sourcesOpen, setSourcesOpen] = useState(true)
  const [dragOver, setDragOver] = useState(false)

  const pickFiles = useCallback(() => {
    inputRef.current?.click()
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="notes-import-title"
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/[0.08]"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-black/[0.06] px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mind/10 text-mind">
            <FileText className="h-4.5 w-4.5 h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </span>
          <h2 id="notes-import-title" className="min-w-0 flex-1 text-[17px] font-semibold text-zinc-900">
            Import notes
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-stone-100 hover:text-zinc-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".md,.markdown,.txt,.html,.htm,text/markdown,text/plain,text/html"
            className="sr-only"
            onChange={(e) => {
              const files = e.target.files
              e.target.value = ""
              if (files?.length) {
                onImportFiles(files)
                onClose()
              }
            }}
          />

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              if (e.dataTransfer.files?.length) {
                onImportFiles(e.dataTransfer.files)
                onClose()
              }
            }}
            className={cn(
              "flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              dragOver
                ? "border-mind/50 bg-mind/5"
                : "border-stone-200 bg-stone-50/80 hover:border-stone-300"
            )}
          >
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/[0.06]">
              <FileUp className="h-7 w-7 text-zinc-500" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="text-[15px] font-semibold text-zinc-800">Markdown & text files</p>
            <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-zinc-500">
              Up to 100 files per batch, 10 MB each.{" "}
              <button
                type="button"
                onClick={pickFiles}
                className="font-semibold text-mind hover:underline"
              >
                Choose files
              </button>
            </p>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={() => setSourcesOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-2 py-2 text-left"
              aria-expanded={sourcesOpen}
            >
              <span className="text-[14px] font-semibold text-zinc-800">Import from other apps</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-zinc-400 transition-transform",
                  !sourcesOpen && "-rotate-90"
                )}
                strokeWidth={2.25}
                aria-hidden
              />
            </button>

            {sourcesOpen ? (
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-3">
                {OVERSEAS_SOURCES.map((src) => (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => {
                      onImportFromSource(src.id)
                      onClose()
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border border-stone-200/90 bg-white px-2 py-3 text-center transition-colors",
                      "hover:border-mind/30 hover:bg-mind/[0.04]"
                    )}
                    title={src.blurb}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-[15px] font-bold",
                        src.markClass
                      )}
                    >
                      {src.mark}
                    </span>
                    <span className="text-[12px] font-semibold leading-tight text-zinc-800">
                      {src.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            <p className="mt-3 text-[11px] leading-relaxed text-zinc-400">
              Connectors are demo — export from your app, then upload Markdown or use file import above.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
