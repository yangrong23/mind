"use client"

import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"

export function PersonalKbUploadBanner({
  libraryName,
  onUpload,
  className,
}: {
  libraryName: string
  onUpload: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "mx-4 mb-1 rounded-2xl border border-mind/20 bg-gradient-to-br from-mind/[0.08] via-white to-white px-4 py-3.5",
        "shadow-[0_4px_20px_-8px_rgba(15,23,42,0.08)] dark:border-mind/25 dark:from-mind/12 dark:via-zinc-950 dark:to-zinc-950",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mind/12 text-mind">
          <Upload className="h-5 w-5" strokeWidth={1.85} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">Add your first sources</p>
          <p className="mt-0.5 text-[13px] leading-snug text-zinc-600 dark:text-zinc-400">
            Upload PDFs, Word docs, audio, or links to <span className="font-medium text-zinc-700 dark:text-zinc-300">{libraryName}</span>
            . Mindar uses them for grounded Q&amp;A, AI view, and Studio outputs.
          </p>
          <button
            type="button"
            onClick={onUpload}
            className={cn(
              "mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-white",
              mx.brandCta,
              mx.brandFocusRing
            )}
          >
            <Upload className="h-4 w-4" strokeWidth={2} aria-hidden />
            Upload files
          </button>
        </div>
      </div>
    </div>
  )
}
