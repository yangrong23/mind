"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { ChevronRight } from "lucide-react"
import {
  formatPlazaSubscriber,
  getFeaturedPlazaRows,
  plazaRowToKnowledgeBase,
  type PlazaLibraryRow,
} from "@/lib/mock-plaza-libraries"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import { LibraryCover } from "@/components/mind-v2/library-cover"

const DISMISS_KEY = "mind-library-plaza-promo-dismissed"

function PromoCard({
  row,
  onPick,
}: {
  row: PlazaLibraryRow
  onPick: (kb: KnowledgeBase) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(plazaRowToKnowledgeBase(row))}
      className="group w-[96px] shrink-0 snap-start text-left sm:w-[104px]"
    >
      <div
        className={cn(
          "relative aspect-[3/4] overflow-hidden rounded-xl ring-1 ring-black/[0.05]",
          mx.pressableChip,
          "dark:ring-white/[0.08]"
        )}
      >
        <LibraryCover
          name={row.title}
          coverVariant={row.coverVariant}
          showMiniUi={false}
          className="h-full w-full"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-2">
          <p className="line-clamp-2 text-[10px] font-medium leading-[1.25] text-white">{row.title}</p>
          <p className="mt-0.5 text-[9px] tabular-nums text-white/65">
            {formatPlazaSubscriber(row.subscriberCount)}
          </p>
        </div>
      </div>
      <p className="mt-1.5 line-clamp-1 text-[11px] text-zinc-400">{row.authorHandle}</p>
    </button>
  )
}

export function LibraryPlazaPromoStrip({
  onOpenPlaza,
  onPickLibrary,
  className,
}: {
  onOpenPlaza: () => void
  onPickLibrary: (kb: KnowledgeBase) => void
  className?: string
}) {
  const [dismissed, setDismissed] = useState(true)
  const rows = getFeaturedPlazaRows(5)

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1")
    } catch {
      setDismissed(false)
    }
  }, [])

  if (dismissed || rows.length === 0) return null

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1")
    } catch {
      /* noop */
    }
    setDismissed(true)
  }

  return (
    <section className={cn("relative mt-6 pb-2", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onOpenPlaza}
          className="inline-flex min-w-0 items-center gap-0.5 text-left"
        >
          <h3 className={cn("text-[13px] font-semibold tracking-tight", mx.shellInk)}>From Plaza</h3>
          <ChevronRight className={cn("h-4 w-4 shrink-0", mx.shellIcon)} strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          onClick={dismiss}
          className={cn(
            "shrink-0 rounded-full px-2 py-1 text-[12px] font-medium transition-colors",
            mx.shellMuted,
            "hover:bg-stone-100/90 hover:text-zinc-600 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-300"
          )}
        >
          Not now
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
        {rows.map((row) => (
          <PromoCard key={row.kbId} row={row} onPick={onPickLibrary} />
        ))}
      </div>
    </section>
  )
}
