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

/** Fixed footprint for Agent / 3-column factory grids */
export const MINDER_FACTORY_CARD_HEIGHT = "h-[5rem]"

/** Knowledge Studio — square-ish cards in 2 columns */
export const MINDER_FACTORY_CARD_HEIGHT_KB = "aspect-square w-full"

export const MINDER_FACTORY_GRID_CLASS = "grid grid-cols-3 gap-2 [&>*]:h-[5rem]"

/** Knowledge Studio — 6 items in 2 columns × 3 rows */
export const MINDER_FACTORY_GRID_CLASS_KB = "grid grid-cols-2 gap-3"

export const MINDER_FACTORY_RAIL_CARD_WIDTH = "w-[5.25rem] shrink-0"

export const MINDER_FACTORY_RAIL_CARD_HEIGHT = "h-[4.25rem]"

/** Knowledge article detail — shorter horizontal factory chips */
export const MINDER_FACTORY_RAIL_CARD_WIDTH_COMPACT = "w-[4.5rem] shrink-0"

export const MINDER_FACTORY_RAIL_CARD_HEIGHT_COMPACT = "h-[2.75rem]"

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
  gridLayout = "agent",
  density = "default",
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
  /** `kb` — taller square cards (Knowledge Studio 2-col grid) */
  gridLayout?: "agent" | "kb"
  /** `compact` — shorter rail chips (e.g. KB single-article view) */
  density?: "default" | "compact"
  className?: string
}) {
  const isRail = variant === "rail"
  const railCompact = isRail && density === "compact"
  const isKbGrid = gridLayout === "kb" && !isRail
  const filled = surface === "filled" && !isRail
  const tone = filled ? mx.kbFactoryTone[kind] : mx.factoryTone[kind]
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full flex-col items-center justify-center overflow-hidden text-center",
        isRail
          ? cn(
              railCompact ? "gap-0.5 rounded-lg p-1" : "gap-1 rounded-xl p-1.5",
              "border border-stone-200/90 bg-transparent shadow-none",
              "dark:border-zinc-700/90",
              "hover:border-stone-300 dark:hover:border-zinc-600",
              "active:scale-[0.98]"
            )
          : filled
            ? cn(
                isKbGrid ? "gap-2.5 rounded-2xl border p-3.5" : "gap-1.5 rounded-2xl border p-2.5",
                tone.filledShell,
                tone.filledShadow,
                "dark:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_8px_24px_-14px_rgba(0,0,0,0.4)]",
                tone.filledShellHover,
                tone.filledShadowHover,
                "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              )
            : cn(
                "gap-1.5 rounded-2xl border border-stone-200/90 bg-transparent p-2.5 shadow-none",
                "dark:border-zinc-700/90",
                "hover:border-stone-300 dark:hover:border-zinc-600",
                "active:scale-[0.98]"
              ),
        isRail
          ? railCompact
            ? MINDER_FACTORY_RAIL_CARD_HEIGHT_COMPACT
            : MINDER_FACTORY_RAIL_CARD_HEIGHT
          : isKbGrid
            ? MINDER_FACTORY_CARD_HEIGHT_KB
            : MINDER_FACTORY_CARD_HEIGHT,
        mx.navEase,
        className
      )}
    >
      {filled ? (
        <>
          {isKbGrid ? (
            <span
              className="pointer-events-none absolute inset-0 z-[0] rounded-2xl bg-stone-50/35 dark:bg-zinc-950/30"
              aria-hidden
            />
          ) : null}
          <span
            className={cn(
              "pointer-events-none absolute inset-0 rounded-2xl",
              isKbGrid
                ? "bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_58%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.06)_0%,rgba(56,189,248,0)_58%)]"
                : "bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0)_58%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.12)_0%,rgba(56,189,248,0)_58%)]"
            )}
            aria-hidden
          />
          <span
            className={cn(
              "pointer-events-none absolute inset-0 rounded-2xl transition-colors",
              tone.filledOverlay,
              tone.filledOverlayHover
            )}
            aria-hidden
          />
          <span
            className={cn(
              "pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100",
              tone.filledCornerGlow
            )}
            aria-hidden
          />
        </>
      ) : null}
      <div
        className={cn(
          "relative z-[1] flex shrink-0 items-center justify-center",
          isRail
            ? railCompact
              ? "h-5 w-5 rounded-md"
              : "h-9 w-9 rounded-lg"
            : isKbGrid
              ? "h-12 w-12 rounded-xl"
              : "h-9 w-9 rounded-xl",
          filled ? tone.well : tone.icon,
          filled
            ? cn(
                isKbGrid ? "bg-white/50 ring-1 dark:bg-zinc-900/60" : "bg-white/60 ring-1 dark:bg-zinc-900/55",
                tone.filledIconRing
              )
            : undefined
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
            isRail
              ? railCompact
                ? "h-3 w-3"
                : "h-5 w-5"
              : isKbGrid
                ? "h-[22px] w-[22px]"
                : "h-[18px] w-[18px]",
            filled && tone.icon
          )}
          strokeWidth={1.85}
          aria-hidden
        />
      </div>
      <span
        className={cn(
          "relative z-[1] max-w-full px-0.5 font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50",
          isRail
            ? railCompact
              ? "line-clamp-1 break-words text-[9px]"
              : "line-clamp-2 break-words text-[10px]"
            : isKbGrid
              ? "line-clamp-2 break-words text-[14px]"
              : "line-clamp-2 break-words text-[12px]"
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
