"use client"

import { useMemo } from "react"
import { toast } from "sonner"
import { Copy, Share2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { combineMindShareText, type MindSharePayload } from "@/lib/mind-share-payload"
import { buildDemoActivityTimeline } from "@/lib/mock-activity-timeline"
import { copyShareText } from "@/lib/share-social"
import { SocialShareRow } from "@/components/mind-v2/social-share-row"
import { MindViralShareCard } from "@/components/mind-v2/mind-viral-share-card"

export type MindShareSheetProps = {
  open: boolean
  payload: MindSharePayload | null
  onClose: () => void
}

export function MindShareSheet({ open, payload, onClose }: MindShareSheetProps) {
  const timelineDays = useMemo(() => buildDemoActivityTimeline(), [])

  if (!open || !payload) return null

  const shareTitle = payload.title
  const shareBody = payload.body

  async function handleCopy() {
    const ok = await copyShareText(shareTitle, shareBody)
    toast.success(ok ? "Copied" : "Copy ready", {
      description: ok ? "Paste anywhere to share." : combineMindShareText(shareTitle, shareBody).slice(0, 120),
    })
    onClose()
  }

  function handleNativeShare() {
    const text = combineMindShareText(shareTitle, shareBody)
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator
        .share({ title: shareTitle, text })
        .then(() => onClose())
        .catch(() => toast.message("Share cancelled"))
      return
    }
    void handleCopy()
  }

  return (
    <div className="absolute inset-0 z-[75] flex flex-col justify-end">
      <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-label="Dismiss" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mind-share-sheet-title"
        className="relative max-h-[94vh] overflow-hidden rounded-t-[1.35rem] bg-white shadow-[0_-16px_48px_rgba(0,0,0,0.18)] animate-in slide-in-from-bottom duration-200 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-stone-300 dark:bg-zinc-600" />
        </div>

        <div className="flex shrink-0 items-center justify-between border-b border-stone-100/90 px-5 pb-3 dark:border-zinc-800">
          <div>
            <h3 id="mind-share-sheet-title" className="text-[17px] font-semibold text-zinc-900 dark:text-zinc-100">
              Share card
            </h3>
            <p className="mt-0.5 text-[13px] text-zinc-500">Preview the full card, then pick a channel</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-stone-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="max-h-[50vh] min-h-0 overflow-y-auto overscroll-y-contain px-5 py-4">
          <MindViralShareCard
            card={payload.card}
            displayName={payload.displayName}
            timelineDays={timelineDays}
            fullPreview
          />
        </div>

        <div className="shrink-0 border-t border-stone-100 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-zinc-800">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Share to</p>
          <SocialShareRow title={shareTitle} body={shareBody} />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border border-stone-200/90 py-3 text-[14px] font-semibold text-zinc-800",
                "hover:bg-stone-50 active:bg-stone-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              )}
            >
              <Copy className="h-4 w-4 text-zinc-500" strokeWidth={2} aria-hidden />
              Copy text
            </button>
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-[14px] font-semibold text-white hover:bg-zinc-800 active:bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              <Share2 className="h-4 w-4" strokeWidth={2} aria-hidden />
              More…
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
