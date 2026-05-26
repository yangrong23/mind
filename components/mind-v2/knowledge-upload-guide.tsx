"use client"

import { useCallback, useRef, useState } from "react"
import { ClipboardPaste, Cloud, Link2, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

const DEFAULT_MAX_ITEMS = 50

/** Shown in the drop zone — keep in sync with the file input `accept` list */
export const KNOWLEDGE_UPLOAD_ACCEPT =
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.rtf,.csv,.json,.mp3,.wav,.m4a,.aac,.ogg,.webm,image/*"

export const KNOWLEDGE_UPLOAD_TYPES_LABEL =
  "PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx), Excel (.xls, .xlsx), text (.txt, .md, .rtf, .csv), images (PNG, JPG, GIF, WebP), audio (MP3, WAV, M4A, AAC, OGG)"

const copy = {
  en: {
    dropTitle: "Or drag and drop files",
    dropHint: "PDF, images, documents, audio, etc.",
    uploadFile: "Upload files",
    website: "Website",
    cloudDrive: "Cloud drive",
    pastedText: "Pasted text",
    count: (n: number, max: number) => `${n}/${max}`,
  },
  zh: {
    dropTitle: "或拖放文件",
    dropHint: "PDF、图片、文档、音频，等等",
    uploadFile: "上传文件",
    website: "网站",
    cloudDrive: "云端硬盘",
    pastedText: "复制的文字",
    count: (n: number, max: number) => `${n}/${max}`,
  },
} as const

function GoogleDriveIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M8.4 2L2 14.5h5.2L13.6 2H8.4z" />
      <path fill="#FBBC04" d="M2 14.5l3.4 5.9h11.4L22 14.5H2z" />
      <path fill="#34A853" d="M13.6 2L8.4 14.5H22L16.8 2h-3.2z" />
      <path fill="#EA4335" d="M16.8 2L22 14.5l-3.4 5.9L13.6 2h3.2z" />
    </svg>
  )
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#FF0000"
        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 0 0 0 0 12c0 2 .2 5.9.6 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.4-.2.6-3.8.6-5.8 0-2-.2-5.9-.6-5.8z"
      />
      <path fill="#FFF" d="M9.75 15.02l6.35-3.52-6.35-3.52v7.04z" />
    </svg>
  )
}

export type KnowledgeUploadGuideProps = {
  locale?: "en" | "zh"
  itemCount: number
  maxItems?: number
  onFiles: (files: FileList) => void
  onWebsite: () => void
  onCloudDrive: () => void
  onPasteText: () => void
  className?: string
  /** Tighter layout for notebook Sources column */
  variant?: "default" | "compact"
  /** Hide pill actions — use with KnowledgeAddSourceMenu panel */
  hideActionPills?: boolean
}

export function KnowledgeUploadGuide({
  locale = "en",
  itemCount,
  maxItems = DEFAULT_MAX_ITEMS,
  onFiles,
  onWebsite,
  onCloudDrive,
  onPasteText,
  className,
  variant = "default",
  hideActionPills = false,
}: KnowledgeUploadGuideProps) {
  const t = copy[locale]
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const compact = variant === "compact"
  const ratio = Math.min(100, Math.round((itemCount / maxItems) * 100))
  const pillClass = cn(
    "inline-flex items-center gap-1.5 rounded-full border border-stone-200/90 bg-white font-medium text-zinc-700 shadow-sm transition-colors hover:border-stone-300 hover:bg-stone-50",
    compact ? "px-2.5 py-1.5 text-[12px]" : "px-3.5 py-2 text-[13px]"
  )
  const iconClass = cn("shrink-0 text-zinc-600", compact ? "h-3.5 w-3.5" : "h-4 w-4")

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files)
    },
    [onFiles]
  )

  return (
    <div className={cn("w-full", className)}>
      <div
        role="region"
        aria-label={t.dropTitle}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-2xl border-2 border-dashed transition-colors",
          compact ? "px-4 py-5" : "px-6 py-8 sm:px-8 sm:py-10",
          dragOver
            ? "border-teal-400/70 bg-teal-50/40"
            : "border-stone-200/90 bg-white/60 hover:border-stone-300/90"
        )}
      >
        <p
          className={cn(
            "text-center font-semibold text-zinc-800",
            compact ? "text-[15px]" : "text-[17px] sm:text-[18px]"
          )}
        >
          {t.dropTitle}
        </p>
        <p className={cn("mt-1.5 text-center text-zinc-500", compact ? "text-[12px]" : "text-[13px]")}>
          {t.dropHint}
        </p>

        {!hideActionPills ? (
          <div
            className={cn(
              "mt-5 flex flex-wrap items-center justify-center gap-2",
              compact ? "gap-1.5" : "gap-2.5 sm:mt-6"
            )}
          >
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={pillClass}
            >
              <Upload className={iconClass} strokeWidth={1.85} />
              {t.uploadFile}
            </button>
            <button type="button" onClick={onWebsite} className={pillClass}>
              <Link2 className={iconClass} strokeWidth={1.85} />
              {t.website}
              <YouTubeIcon className="h-4 w-4 shrink-0" />
            </button>
            <button type="button" onClick={onCloudDrive} className={pillClass}>
              <Cloud className={iconClass} strokeWidth={1.85} />
              {t.cloudDrive}
              <GoogleDriveIcon className="h-4 w-4 shrink-0" />
            </button>
            <button type="button" onClick={onPasteText} className={pillClass}>
              <ClipboardPaste className={iconClass} strokeWidth={1.85} />
              {t.pastedText}
            </button>
          </div>
        ) : null}

        <input
          ref={fileRef}
          type="file"
          multiple
          accept={KNOWLEDGE_UPLOAD_ACCEPT}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onFiles(e.target.files)
            e.target.value = ""
          }}
        />
      </div>

      <div className={cn("mt-4 flex items-center gap-3", compact && "mt-3")}>
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-stone-200/90">
          <div
            className="h-full rounded-full bg-sky-500 transition-[width] duration-300"
            style={{ width: `${ratio}%` }}
          />
        </div>
        <span className="shrink-0 text-[12px] font-medium tabular-nums text-zinc-500">
          {t.count(itemCount, maxItems)}
        </span>
      </div>
    </div>
  )
}
