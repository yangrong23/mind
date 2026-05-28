"use client"

import { useEffect } from "react"
import { MessageCircle, X } from "lucide-react"
import { PlazaDiscoverThumbnail } from "@/components/mind-v2/plaza-discover-thumbnail"
import { formatPlazaContent, formatPlazaSubscriber } from "@/lib/mock-plaza-libraries"
import type { PlazaLibraryRow } from "@/lib/mock-plaza-libraries"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"

/** Plaza card preview — library info + chat / browse (no agent intro). */
export function WebPlazaLibraryPreviewModal({
  row,
  open,
  onClose,
  onStartChat,
  onBrowseLibrary,
  chatDisabled,
  chatDisabledReason,
}: {
  row: PlazaLibraryRow | null
  open: boolean
  onClose: () => void
  onStartChat: () => void
  onBrowseLibrary: () => void
  chatDisabled?: boolean
  chatDisabledReason?: string
}) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open || !row) return null

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-8">
      <button
        type="button"
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plaza-library-preview-title"
        className={cn(
          "relative z-10 flex max-h-[min(88vh,640px)] w-full max-w-[480px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/[0.06]",
          "dark:bg-zinc-950 dark:ring-white/10"
        )}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-stone-100 px-5 py-4 dark:border-zinc-800">
          <p className="text-[13px] font-medium text-zinc-500">Public library</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-stone-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </header>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 py-6">
          <div className="flex gap-4">
            <PlazaDiscoverThumbnail row={row} size="featured" />
            <div className="min-w-0 flex-1">
              <h2
                id="plaza-library-preview-title"
                className="text-[18px] font-semibold leading-snug text-zinc-900"
              >
                {row.title}
              </h2>
              <p className="mt-1 text-[12px] text-zinc-500">{row.authorHandle}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-600">{row.description}</p>
              <p className="mt-3 text-[12px] text-zinc-400">
                {formatPlazaSubscriber(row.subscriberCount)} · {formatPlazaContent(row.contentCount)}
              </p>
            </div>
          </div>
        </div>

        <footer className="shrink-0 space-y-2 border-t border-stone-100 bg-stone-50/40 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <button
            type="button"
            disabled={chatDisabled}
            title={chatDisabled ? chatDisabledReason : undefined}
            onClick={onStartChat}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold text-white transition-colors",
              chatDisabled ? "cursor-not-allowed bg-zinc-200 text-zinc-500" : web.kbPrimaryBtn
            )}
          >
            <MessageCircle className="h-5 w-5" strokeWidth={2} aria-hidden />
            Chat
          </button>
          <button
            type="button"
            onClick={onBrowseLibrary}
            className="w-full rounded-xl border border-stone-200/90 bg-white py-3 text-[14px] font-semibold text-zinc-700 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Browse library
          </button>
          {chatDisabled && chatDisabledReason ? (
            <p className="text-center text-[12px] leading-relaxed text-zinc-500">{chatDisabledReason}</p>
          ) : null}
        </footer>
      </div>
    </div>
  )
}
