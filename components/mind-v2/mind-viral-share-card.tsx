"use client"

import { Share2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import type { MindShareCardModel } from "@/lib/mind-share-payload"

export type MindViralShareCardProps = {
  card: MindShareCardModel
  displayName: string
  /** When set, the card is tappable and shows a share affordance */
  onShare?: () => void
  className?: string
}

export function MindViralShareCard({ card, displayName, onShare, className }: MindViralShareCardProps) {
  const Wrapper = onShare ? "button" : "div"
  const isInsight = card.variant === "insight" || card.variant === "timeline"

  return (
    <Wrapper
      type={onShare ? "button" : undefined}
      onClick={onShare}
      className={cn(
        "group relative w-full overflow-hidden rounded-[1.35rem] border border-stone-200/90 text-left shadow-[0_12px_40px_-16px_rgba(15,23,42,0.14),0_4px_16px_-8px_rgba(56,189,248,0.12)]",
        "transition-transform active:scale-[0.99]",
        mx.brandHero,
        onShare && "cursor-pointer",
        className
      )}
    >
      <span
        className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-mind/15 blur-2xl dark:bg-mind/20"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -bottom-14 -left-8 h-36 w-36 rounded-full bg-stone-100/80 blur-2xl dark:bg-zinc-800/60"
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mind/35 to-transparent",
          isInsight && "via-mind/45"
        )}
        aria-hidden
      />

      <div className="relative px-5 pb-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 ring-1 ring-mind/15 shadow-sm dark:bg-zinc-900/80 dark:ring-mind/25">
              <Sparkles className="h-4 w-4 text-mind" strokeWidth={2} aria-hidden />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-mind/90">{card.eyebrow}</span>
          </div>
          {onShare ? (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-mind ring-1 ring-stone-200/80 transition-colors group-hover:bg-mind/10 dark:bg-zinc-900/70 dark:ring-zinc-700">
              <Share2 className="h-4 w-4" strokeWidth={2} aria-hidden />
            </span>
          ) : null}
        </div>

        {card.hook ? (
          <p className="mt-4 text-[13px] font-medium leading-snug text-mind/90 dark:text-mind/80">{card.hook}</p>
        ) : null}

        <p className="mt-2 whitespace-pre-line text-[22px] font-bold leading-[1.18] tracking-tight text-zinc-900 dark:text-zinc-50">
          {card.headline}
        </p>

        {card.excerpt ? (
          <div className="mt-3.5 rounded-2xl border border-white/70 bg-white/60 p-3.5 backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-900/50">
            <p className="line-clamp-4 text-[13px] leading-[1.65] text-zinc-700 dark:text-zinc-300">{card.excerpt}</p>
          </div>
        ) : null}

        {card.bullets && card.bullets.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {card.bullets.slice(0, 3).map((item) => (
              <li key={item} className="flex gap-2 text-[12px] leading-snug text-zinc-600 dark:text-zinc-400">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-mind" aria-hidden />
                <span className="line-clamp-2">{item}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {card.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-white/75 px-2.5 py-1 text-[10px] font-semibold tabular-nums text-zinc-600 ring-1 ring-stone-200/70 dark:bg-zinc-900/60 dark:text-zinc-300 dark:ring-zinc-700"
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-200/80 pt-4 dark:border-zinc-800">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">{displayName}</p>
            <p className="text-[10px] text-zinc-500">{onShare ? "Tap to share" : "Shared from Mind"}</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-[9px] font-bold leading-tight tracking-wide text-white dark:bg-zinc-100 dark:text-zinc-900">
            Mind
          </div>
        </div>
      </div>
    </Wrapper>
  )
}
