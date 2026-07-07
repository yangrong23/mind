"use client"

import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { MindarLogoImg } from "@/components/mind-v2/mindar-logo"
import { ShareCardTimelineMini } from "@/components/mind-v2/share-card-timeline-mini"
import type { MindShareCardModel } from "@/lib/mind-share-payload"
import type { ActivityTimelineDay } from "@/lib/mock-activity-timeline"

export type MindViralShareCardProps = {
  card: MindShareCardModel
  displayName: string
  /** Show full excerpt without clamping — for share preview sheet */
  fullPreview?: boolean
  /** Same diary data as Me home — keeps share timeline in sync */
  timelineDays?: ActivityTimelineDay[]
  className?: string
}

function showsTimelineMini(variant: MindShareCardModel["variant"]) {
  return variant === "stats" || variant === "timeline" || variant === "daily"
}

export function MindViralShareCard({
  card,
  displayName,
  fullPreview = false,
  timelineDays,
  className,
}: MindViralShareCardProps) {
  const withTimeline = showsTimelineMini(card.variant)
  const headline = card.headline?.trim()
  const hookIsHero = Boolean(card.hook?.trim()) && !headline

  return (
    <div
      className={cn(
        "relative w-full overflow-visible rounded-[1.25rem] border border-[#E9ECEF] bg-white",
        mx.elevatedShadow,
        "dark:border-zinc-700/90 dark:bg-zinc-900",
        className
      )}
    >
      <span
        className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-mind/10 blur-2xl dark:bg-mind/15"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mind/25 to-transparent"
        aria-hidden
      />

      <div className="relative px-5 pb-4 pt-4">
        <div className="flex items-center justify-between gap-3">
          <MindarLogoImg
            variant="inline"
            className={cn(hookIsHero ? "!h-[28px] !max-w-[160px]" : "!h-[20px] !max-w-[112px]")}
          />
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mind/90">
            {card.eyebrow}
          </span>
        </div>

        {card.hook ? (
          <p
            className={cn(
              "text-zinc-800 dark:text-zinc-200",
              hookIsHero
                ? "mt-4 text-[17px] font-semibold leading-[1.45] tracking-[-0.02em]"
                : "mt-3 text-[13px] font-medium leading-[1.5] text-zinc-700 dark:text-zinc-300",
              withTimeline && !hookIsHero && "max-w-[92%]"
            )}
          >
            {card.hook}
          </p>
        ) : null}

        {withTimeline ? (
          <div className={cn("overflow-visible", hookIsHero ? "mt-4" : "mt-3")}>
            <ShareCardTimelineMini days={timelineDays} />
          </div>
        ) : null}

        {headline ? (
          <p
            className={cn(
              "whitespace-pre-line text-[18px] font-semibold leading-[1.25] tracking-[-0.02em] text-zinc-900 dark:text-zinc-50",
              withTimeline ? "mt-3" : "mt-2.5"
            )}
          >
            {headline}
          </p>
        ) : null}

        {card.excerpt ? (
          <div className="mt-2.5 rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p
              className={cn(
                "text-[12px] leading-[1.6] text-zinc-600 dark:text-zinc-400",
                !fullPreview && "line-clamp-3"
              )}
            >
              {card.excerpt}
            </p>
          </div>
        ) : null}

        {card.bullets && card.bullets.length > 0 ? (
          <ul className="mt-2.5 space-y-1.5">
            {card.bullets.slice(0, fullPreview ? 6 : 3).map((item) => (
              <li key={item} className="flex gap-2 text-[12px] leading-snug text-zinc-600 dark:text-zinc-400">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-mind" aria-hidden />
                <span className={cn(!fullPreview && "line-clamp-2")}>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {card.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-stone-50 px-2.5 py-1 text-[10px] font-medium tabular-nums text-zinc-600 ring-1 ring-stone-200/70 dark:bg-zinc-900/60 dark:text-zinc-300 dark:ring-zinc-700"
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-stone-200/80 pt-3.5 dark:border-zinc-800">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">{displayName}</p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500">
              Shared from Mindar
            </p>
          </div>
          <MindarLogoImg
            variant="inline"
            className={cn(hookIsHero ? "!h-[20px] !max-w-[112px]" : "!h-[17px] !max-w-[96px]", "opacity-90")}
          />
        </div>
      </div>
    </div>
  )
}
