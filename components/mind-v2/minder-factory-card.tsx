"use client"

import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import type { FactoryModalKind, FactoryOptionSurface } from "@/components/mind-v2/content-factory-modals"
import {
  BarChart3,
  FileText,
  HelpCircle,
  Layers,
  Presentation,
  Sparkles,
  Volume2,
  type LucideIcon,
} from "lucide-react"

/** Fixed footprint for every Minder content-factory card surface */
export const MINDER_FACTORY_CARD_HEIGHT = "h-[5rem]"

export const MINDER_FACTORY_GRID_CLASS = "grid grid-cols-3 gap-2 [&>*]:h-[5rem]"

export const MINDER_FACTORY_RAIL_CARD_WIDTH = "w-[5.25rem] shrink-0"

export const MINDER_FACTORY_RAIL_CARD_HEIGHT = "h-[3.75rem]"

export const MINDER_FACTORY_ITEMS: {
  id: FactoryModalKind
  label: string
  icon: LucideIcon
}[] = [
  { id: "report", label: "Report", icon: FileText },
  { id: "audio", label: "Audio", icon: Volume2 },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "quiz", label: "Quiz", icon: HelpCircle },
  { id: "slides", label: "Slides", icon: Presentation },
  { id: "infographic", label: "Infographic", icon: BarChart3 },
]

export type MinderFactoryCardKind = FactoryModalKind

export function MinderFactoryCard({
  kind,
  label,
  icon: Icon,
  onClick,
  variant = "grid",
  surface = "flat",
  className,
}: {
  kind: MinderFactoryCardKind
  label: string
  icon: LucideIcon
  onClick: () => void
  /** `rail` — compact chips in horizontal factory scrollers */
  variant?: "grid" | "rail"
  /** `filled` — tinted cards (Knowledge Studio); `flat` — border-only (Agent, chat rails) */
  surface?: FactoryOptionSurface
  className?: string
}) {
  const isRail = variant === "rail"
  const filled = surface === "filled" && !isRail
  const tone = mx.factoryTone[kind]
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full flex-col items-center justify-center overflow-hidden text-center",
        isRail
          ? cn(
              "gap-1 rounded-xl border border-stone-200/90 bg-transparent p-1.5 shadow-none",
              "dark:border-zinc-700/90",
              "hover:border-stone-300 dark:hover:border-zinc-600",
              "active:scale-[0.98]"
            )
          : filled
            ? cn(
                "gap-1.5 rounded-2xl border p-2.5",
                "border-sky-200/90 bg-gradient-to-br from-sky-100 via-sky-50 to-cyan-100",
                "shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_6px_20px_-12px_rgba(56,189,248,0.12)]",
                "dark:border-sky-800/55 dark:from-sky-950 dark:via-sky-900 dark:to-cyan-950",
                "dark:shadow-[0_1px_0_rgba(56,189,248,0.08)_inset,0_8px_24px_-14px_rgba(0,0,0,0.4)]",
                "hover:-translate-y-0.5 hover:border-mind/35 hover:from-sky-50 hover:via-sky-100 hover:to-cyan-50",
                "hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_28px_-14px_rgba(56,189,248,0.2)]",
                "dark:hover:border-mind/40 dark:hover:from-sky-900 dark:hover:via-sky-950 dark:hover:to-cyan-950",
                "active:translate-y-0 active:scale-[0.98]"
              )
            : cn(
                "gap-1.5 rounded-2xl border border-stone-200/90 bg-transparent p-2.5 shadow-none",
                "dark:border-zinc-700/90",
                "hover:border-stone-300 dark:hover:border-zinc-600",
                "active:scale-[0.98]"
              ),
        isRail ? MINDER_FACTORY_RAIL_CARD_HEIGHT : MINDER_FACTORY_CARD_HEIGHT,
        mx.navEase,
        className
      )}
    >
      {filled ? (
        <>
          <span
            className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_58%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.2)_0%,rgba(56,189,248,0)_58%)]"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-0 rounded-2xl bg-mind/[0.06] transition-colors group-hover:bg-mind/[0.1] dark:bg-mind/10 dark:group-hover:bg-mind/15"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.28)_0%,transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle,rgba(56,189,248,0.2)_0%,transparent_70%)]"
            aria-hidden
          />
        </>
      ) : null}
      <div
        className={cn(
          "relative z-[1] flex shrink-0 items-center justify-center",
          isRail ? "h-7 w-7 rounded-lg" : "h-9 w-9 rounded-xl",
          filled ? tone.well : tone.icon,
          filled ? "bg-white/75 ring-1 ring-white/70 dark:bg-zinc-900/50 dark:ring-sky-900/40" : undefined
        )}
      >
        {filled ? (
          <span
            className={cn(
              mx.navBloomOuter,
              "-inset-2 scale-75 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            )}
            aria-hidden
          />
        ) : null}
        <Icon
          className={cn(
            "relative z-[1]",
            isRail ? "h-3.5 w-3.5" : "h-[18px] w-[18px]",
            filled && tone.icon
          )}
          strokeWidth={1.85}
          aria-hidden
        />
      </div>
      <span
        className={cn(
          "relative z-[1] max-w-full px-0.5 font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50",
          isRail ? "line-clamp-2 break-words text-[10px]" : "line-clamp-2 break-words text-[12px]"
        )}
      >
        {label}
      </span>
      {filled ? (
        <Sparkles
          className={cn(
            "pointer-events-none absolute right-2 top-2 z-[1] h-3 w-3 opacity-0 transition-all duration-300",
            tone.sparkle,
            "group-hover:opacity-100"
          )}
          strokeWidth={2}
          aria-hidden
        />
      ) : null}
    </button>
  )
}
