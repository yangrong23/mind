"use client"

import { useEffect, useRef, useState } from "react"
import {
  ChevronRight,
  FileText,
  FolderInput,
  FolderPlus,
  Link2,
  Mic,
  Radio,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type KnowledgeAddSourceAction =
  | "local-file"
  | "local-folder"
  | "web-link"
  | "youtube-link"
  | "podcast-link"
  | "note-text"
  | "note-rich"
  | "recording"
  | "new-folder"

const LABELS = {
  zh: {
    localFile: "本地文件",
    localFolder: "本地文件夹",
    webLink: "网页链接",
    youtubeLink: "YouTube 视频",
    podcastLink: "播客链接",
    notes: "笔记",
    noteText: "文字笔记",
    noteRich: "富文本笔记",
    recording: "录音纪要",
    newFolder: "新建文件夹",
  },
  en: {
    localFile: "Local file",
    localFolder: "Local folder",
    webLink: "Web link",
    youtubeLink: "YouTube",
    podcastLink: "Podcast",
    notes: "Notes",
    noteText: "Text note",
    noteRich: "Rich note",
    recording: "Recording summary",
    newFolder: "New folder",
  },
} as const

type RowDef = {
  id: KnowledgeAddSourceAction | "notes"
  icon: typeof Upload
  labelKey: keyof (typeof LABELS)["zh"]
  hasSubmenu?: boolean
  separatorBefore?: boolean
}

const ROWS: RowDef[] = [
  { id: "local-file", icon: FileText, labelKey: "localFile" },
  { id: "local-folder", icon: FolderInput, labelKey: "localFolder" },
  { id: "web-link", icon: Link2, labelKey: "webLink" },
  { id: "youtube-link", icon: Link2, labelKey: "youtubeLink" },
  { id: "podcast-link", icon: Radio, labelKey: "podcastLink" },
  { id: "notes", icon: FileText, labelKey: "notes", hasSubmenu: true },
  { id: "recording", icon: Mic, labelKey: "recording" },
  { id: "new-folder", icon: FolderPlus, labelKey: "newFolder", separatorBefore: true },
]

export type KnowledgeAddSourceMenuProps = {
  locale?: "zh" | "en"
  onAction: (action: KnowledgeAddSourceAction) => void
  className?: string
  /** Floating dropdown anchored to parent */
  variant?: "dropdown" | "panel"
  open?: boolean
  onClose?: () => void
}

function MenuRows({
  locale,
  onAction,
  onRowClick,
}: {
  locale: "zh" | "en"
  onAction: (action: KnowledgeAddSourceAction) => void
  onRowClick?: () => void
}) {
  const t = LABELS[locale]
  const [notesOpen, setNotesOpen] = useState(false)

  return (
    <ul className="py-1" role="menu">
      {ROWS.map((row) => {
        const Icon = row.icon
        const isNotes = row.id === "notes"

        return (
          <li key={row.id} role="none" className={cn(row.separatorBefore && "border-t border-stone-100 mt-1 pt-1")}>
            <div className={cn(isNotes && "relative")}>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  if (isNotes) {
                    setNotesOpen((v) => !v)
                    return
                  }
                  onAction(row.id as KnowledgeAddSourceAction)
                  onRowClick?.()
                }}
                className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[14px] font-medium text-zinc-700 transition-colors hover:bg-stone-50 active:bg-stone-100/80"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-50 text-zinc-600 ring-1 ring-stone-100/90">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">{t[row.labelKey]}</span>
                {row.hasSubmenu ? (
                  <ChevronRight
                    className={cn("h-4 w-4 shrink-0 text-zinc-400 transition-transform", notesOpen && "rotate-90")}
                    aria-hidden
                  />
                ) : null}
              </button>

              {isNotes && notesOpen ? (
                <ul className="border-t border-stone-50 bg-stone-50/50 py-0.5" role="menu">
                  {(
                    [
                      { id: "note-text" as const, label: t.noteText },
                      { id: "note-rich" as const, label: t.noteRich },
                    ] as const
                  ).map((sub) => (
                    <li key={sub.id} role="none">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onAction(sub.id)
                          setNotesOpen(false)
                          onRowClick?.()
                        }}
                        className="flex w-full items-center gap-3 py-2 pl-[3.25rem] pr-3.5 text-left text-[13px] text-zinc-600 hover:bg-white/90"
                      >
                        {sub.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function KnowledgeAddSourceMenu({
  locale = "en",
  onAction,
  className,
  variant = "panel",
  open = true,
  onClose,
}: KnowledgeAddSourceMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (variant !== "dropdown" || !open) return
    function onDoc(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose?.()
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [variant, open, onClose])

  if (variant === "dropdown" && !open) return null

  const shell = (
    <div
      ref={panelRef}
      className={cn(
        "overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_12px_40px_-8px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.04]",
        variant === "dropdown" ? "w-[min(240px,90vw)]" : "w-full",
        className
      )}
      role="menu"
      aria-label={locale === "zh" ? "添加上传" : "Add sources"}
    >
      <MenuRows locale={locale} onAction={onAction} onRowClick={onClose} />
    </div>
  )

  if (variant === "dropdown") {
    return (
      <>
        <div className="fixed inset-0 z-40" aria-hidden onClick={onClose} />
        <div className="relative z-50">{shell}</div>
      </>
    )
  }

  return shell
}

/** Hidden inputs for file / folder picks — attach refs from parent */
export function useKnowledgeAddSourceInputs(handlers: {
  onFiles: (files: FileList) => void
  onFolder: (files: FileList) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const folderRef = useRef<HTMLInputElement>(null)

  const inputs = (
    <>
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.mp3,.wav,.m4a,image/*"
        onChange={(e) => {
          if (e.target.files?.length) handlers.onFiles(e.target.files)
          e.target.value = ""
        }}
      />
      <input
        ref={folderRef}
        type="file"
        multiple
        className="hidden"
        {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
        onChange={(e) => {
          if (e.target.files?.length) handlers.onFolder(e.target.files)
          e.target.value = ""
        }}
      />
    </>
  )

  const trigger = (action: KnowledgeAddSourceAction) => {
    if (action === "local-file") fileRef.current?.click()
    if (action === "local-folder") folderRef.current?.click()
  }

  return { inputs, trigger }
}
