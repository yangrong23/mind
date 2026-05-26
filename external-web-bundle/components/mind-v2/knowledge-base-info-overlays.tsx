"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { knowledgeBaseIconForTitle } from "@/components/mind-v2/knowledge-base-icon"
import { LibraryCover } from "@/components/mind-v2/library-cover"
import type { LibraryCoverVariant } from "@/lib/product-media"
export { TeamKbInfoOverlay } from "@/components/mind-v2/team-kb-info-overlay"

function rowClass() {
  return "flex w-full items-center justify-between gap-3 border-b border-zinc-100/95 px-4 py-3.5 text-left last:border-b-0 active:bg-zinc-50/80 dark:border-zinc-800 dark:active:bg-zinc-800/40"
}

export function PersonalKbInfoOverlay({
  open,
  onClose,
  name,
  description,
  coverVariant,
  colorClass,
}: {
  open: boolean
  onClose: () => void
  name: string
  description?: string
  coverVariant?: LibraryCoverVariant
  colorClass?: string
}) {
  if (!open) return null
  const KbIcon = knowledgeBaseIconForTitle(name, description)

  return (
    <div className="absolute inset-0 z-[70] flex min-h-0 flex-col bg-[#f2f2f3] dark:bg-zinc-950">
      <header className="flex shrink-0 items-center border-b border-zinc-200/80 bg-white px-1 py-2 dark:border-zinc-800 dark:bg-zinc-950">
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold text-zinc-900 dark:text-zinc-50">
          Library information
        </h1>
        <div className="h-10 w-10 shrink-0" aria-hidden />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <button
            type="button"
            className={rowClass()}
            onClick={() => toast.message("Name", { description: "Rename library (demo)." })}
          >
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Name</span>
            <span className="flex min-w-0 items-center gap-1 text-[14px] text-zinc-400">
              <span className="truncate">{name}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
          <button
            type="button"
            className={rowClass()}
            onClick={() => toast.message("Cover", { description: "Change cover preview (demo)." })}
          >
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Cover</span>
            <span className="flex items-center gap-2">
              {coverVariant ? (
                <div className="h-10 w-10 overflow-hidden rounded-lg ring-1 ring-black/[0.06]">
                  <LibraryCover name={name} coverVariant={coverVariant} showMiniUi={false} />
                </div>
              ) : (
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-black/[0.06]",
                    colorClass || "from-zinc-600 to-zinc-700"
                  )}
                >
                  <KbIcon className="h-5 w-5 text-white" strokeWidth={1.65} aria-hidden />
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            toast.message("Delete library", { description: "Would remove this library after confirmation (demo)." })
            onClose()
          }}
          className="mt-4 w-full rounded-2xl border border-zinc-200/80 bg-white py-3.5 text-center text-[15px] font-medium text-red-600 shadow-sm active:bg-red-50 dark:border-zinc-700 dark:bg-zinc-900 dark:active:bg-red-950/30"
        >
          Delete library
        </button>
      </div>
    </div>
  )
}


const SUBSCRIBED_FALLBACK_DETAIL =
  "This library is maintained by its publisher. Updates, sources, and availability follow their policies. You can browse and ask questions while subscribed; unsubscribing removes it from your list (demo)."

export function SubscribedKbInfoOverlay({
  open,
  onClose,
  name,
  description,
  coverVariant,
  colorClass,
  onUnsubscribe,
}: {
  open: boolean
  onClose: () => void
  name: string
  description?: string
  coverVariant?: LibraryCoverVariant
  colorClass?: string
  onUnsubscribe: () => void
}) {
  if (!open) return null
  const KbIcon = knowledgeBaseIconForTitle(name, description)
  const body = (description && description.trim()) || SUBSCRIBED_FALLBACK_DETAIL

  return (
    <div className="absolute inset-0 z-[70] flex min-h-0 flex-col bg-[#f2f2f3] dark:bg-zinc-950">
      <header className="flex shrink-0 items-center border-b border-zinc-200/80 bg-white px-1 py-2 dark:border-zinc-800 dark:bg-zinc-950">
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold text-zinc-900 dark:text-zinc-50">
          Library information
        </h1>
        <div className="h-10 w-10 shrink-0" aria-hidden />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <button
            type="button"
            className={rowClass()}
            onClick={() => toast.message("Name", { description: "Publisher-managed (demo)." })}
          >
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Name</span>
            <span className="flex min-w-0 items-center gap-1 text-[14px] text-zinc-400">
              <span className="truncate">{name}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
          <button
            type="button"
            className={rowClass()}
            onClick={() => toast.message("Cover", { description: "Publisher cover (demo)." })}
          >
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Cover</span>
            <span className="flex items-center gap-2">
              {coverVariant ? (
                <div className="h-10 w-10 overflow-hidden rounded-lg ring-1 ring-black/[0.06]">
                  <LibraryCover name={name} coverVariant={coverVariant} showMiniUi={false} />
                </div>
              ) : (
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-black/[0.06]",
                    colorClass || "from-zinc-600 to-zinc-700"
                  )}
                >
                  <KbIcon className="h-5 w-5 text-white" strokeWidth={1.65} aria-hidden />
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
          <div className="border-b border-zinc-100/95 px-4 py-3.5 last:border-b-0 dark:border-zinc-800">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 text-left active:opacity-80"
              onClick={() => toast.message("Description", { description: "Full text is shown below (demo)." })}
            >
              <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Description</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} aria-hidden />
            </button>
            <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">{body}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onUnsubscribe()
          }}
          className="mt-4 w-full rounded-2xl border border-zinc-200/80 bg-white py-3.5 text-center text-[15px] font-medium text-red-600 shadow-sm active:bg-red-50 dark:border-zinc-700 dark:bg-zinc-900 dark:active:bg-red-950/30"
        >
          Unsubscribe
        </button>
      </div>
    </div>
  )
}
