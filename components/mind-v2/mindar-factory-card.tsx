"use client"

import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import type { FactoryModalKind, FactoryOptionSurface } from "@/components/mind-v2/content-factory-modals"
import {
  FACTORY_CARD_INNER_FILL,
  FACTORY_CARD_RADIUS,
  FACTORY_CARD_SHAPE,
  FACTORY_CARD_SHAPE_HOVER,
  FACTORY_ICON_RADIUS,
} from "@/components/mind-v2/factory-card-shape"
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

/** @deprecated Use FACTORY_CARD_SHAPE */
export const MINDAR_FACTORY_CARD_EDGE = FACTORY_CARD_SHAPE

export const MINDAR_FACTORY_CARD_HEIGHT = "min-h-[5rem] h-auto"

export const MINDAR_FACTORY_CARD_HEIGHT_KB = "min-h-[5.25rem] h-auto w-full"

export const MINDAR_FACTORY_GRID_CLASS = "grid grid-cols-3 gap-2.5 items-stretch"

export const MINDAR_FACTORY_GRID_CLASS_KB = "grid grid-cols-2 gap-2.5 items-stretch"

export const MINDAR_FACTORY_RAIL_CARD_WIDTH = "w-[5.25rem] shrink-0"

export const MINDAR_FACTORY_RAIL_CARD_HEIGHT = "h-[4.25rem]"

export const MINDAR_FACTORY_RAIL_CARD_HEIGHT_GRID = "min-h-[4.75rem] h-full"

export const MINDAR_FACTORY_RAIL_CARD_WIDTH_COMPACT = "w-[4.5rem] shrink-0"

export const MINDAR_FACTORY_RAIL_CARD_HEIGHT_COMPACT = "h-[2.75rem]"

export const MINDAR_FACTORY_ITEMS: {
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

export type MindarFactoryCardKind = FactoryModalKind

export function MindarFactoryCard({
  kind,
  label,
  icon: Icon,
  onClick,
  variant = "grid",
  railLayout = "scroll",
  railStyle = "card",
  surface = "flat",
  gridLayout = "agent",
  density = "default",
  selected = false,
  className,
}: {
  kind: MindarFactoryCardKind
  label: string
  icon: LucideIcon
  onClick: () => void
  selected?: boolean
  variant?: "grid" | "rail"
  /** Rail under agent composer (`grid`) vs horizontal scroll in chat footer */
  railLayout?: "scroll" | "grid"
  /** `pill` — bordered chip; `inline` — flat icon + label inside composer toolbar (web) */
  railStyle?: "card" | "pill" | "inline"
  surface?: FactoryOptionSurface
  gridLayout?: "agent" | "kb"
  density?: "default" | "compact"
  className?: string
}) {
  const isRail = variant === "rail"
  const railGrid = isRail && railLayout === "grid"
  const railPill = isRail && railLayout === "scroll" && railStyle === "pill"
  const railInline = isRail && railLayout === "scroll" && railStyle === "inline"
  const railCompact = isRail && density === "compact" && !railGrid && !railPill && !railInline
  const isKbGrid = gridLayout === "kb" && !isRail
  const filled = surface === "filled" && !isRail
  const tone = filled ? mx.kbFactoryTone[kind] : mx.factoryTone[kind]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        FACTORY_CARD_SHAPE,
        FACTORY_CARD_RADIUS,
        FACTORY_CARD_SHAPE_HOVER,
        filled && "bg-transparent dark:bg-transparent",
        filled && tone.filledShadow,
        filled && tone.filledShadowHover,
        "group relative flex h-full w-full overflow-hidden active:scale-[0.99]",
        isKbGrid
          ? "min-h-[5.25rem] flex-col items-center justify-center gap-2.5 py-3.5 px-3 text-center"
          : "flex-col items-center justify-center gap-2 px-2.5 py-3 text-center",
        railPill &&
          cn(
            "h-auto min-h-0 w-auto shrink-0 flex-row items-center justify-start gap-1 rounded-xl border border-stone-200/90 py-1.5 pl-2 pr-2.5 text-left",
            "bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900/90",
            selected && "border-mind/40 ring-2 ring-mind/30 ring-offset-1 ring-offset-white dark:ring-offset-zinc-950"
          ),
        railInline &&
          cn(
            "h-auto min-h-0 w-auto shrink-0 flex-row items-center gap-0.5 rounded-lg px-2 py-1.5 text-left",
            "text-zinc-600 hover:bg-stone-100/90 dark:text-zinc-300 dark:hover:bg-zinc-800/80",
            selected && "bg-stone-100/95 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
          ),
        isRail &&
          !railPill &&
          !railInline &&
          cn(
            railGrid
              ? cn(MINDAR_FACTORY_RAIL_CARD_HEIGHT_GRID, "gap-1.5 px-2 py-2 text-center")
              : railCompact
                ? "min-h-[2.75rem] gap-1 px-2 py-1.5 text-center"
                : "min-h-[4.25rem] gap-1.5 px-2 py-2 text-center",
            "bg-white/70 dark:bg-zinc-900/50",
            selected && "ring-2 ring-mind/50 ring-offset-1 ring-offset-white dark:ring-offset-zinc-950"
          ),
        !filled && !isRail && "bg-white/55 dark:bg-zinc-900/45",
        isRail && !railGrid && !railPill && !railInline
          ? railCompact
            ? MINDAR_FACTORY_RAIL_CARD_WIDTH_COMPACT
            : MINDAR_FACTORY_RAIL_CARD_WIDTH
          : "",
        isRail && !railGrid && !railPill && !railInline
          ? railCompact
            ? MINDAR_FACTORY_RAIL_CARD_HEIGHT_COMPACT
            : MINDAR_FACTORY_RAIL_CARD_HEIGHT
          : "",
        !isRail && (isKbGrid ? MINDAR_FACTORY_CARD_HEIGHT_KB : MINDAR_FACTORY_CARD_HEIGHT),
        mx.navEase,
        className
      )}
    >
      {filled ? (
        <span
          className={cn(
            FACTORY_CARD_INNER_FILL,
            "z-0 transition-colors duration-300",
            tone.filledShell,
            tone.filledShellHover
          )}
          aria-hidden
        />
      ) : null}
      {railInline ? (
        <Icon
          className={cn("relative z-[1] h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400", filled && tone.icon)}
          strokeWidth={1.85}
          aria-hidden
        />
      ) : (
        <div
          className={cn(
            "relative z-[1] flex shrink-0 items-center justify-center",
            isRail
              ? railPill
                ? cn(FACTORY_ICON_RADIUS, "h-6 w-6 shrink-0")
                : railGrid
                  ? cn(FACTORY_ICON_RADIUS, "h-9 w-9")
                  : railCompact
                    ? cn(FACTORY_ICON_RADIUS, "h-8 w-8")
                    : cn(FACTORY_ICON_RADIUS, "h-10 w-10")
              : cn(FACTORY_ICON_RADIUS, isKbGrid ? "h-11 w-11" : "h-10 w-10"),
            filled
              ? cn(tone.well, "bg-white/70 ring-1 ring-white/90 dark:bg-zinc-900/70", tone.filledIconRing)
              : tone.icon
          )}
        >
          <Icon
            className={cn(
              "relative z-[1]",
              isRail
                ? railPill
                  ? "h-3.5 w-3.5"
                  : railGrid
                    ? "h-5 w-5"
                    : railCompact
                      ? "h-3.5 w-3.5"
                      : "h-5 w-5"
                : isKbGrid
                  ? "h-5 w-5"
                  : "h-[18px] w-[18px]",
              filled && tone.icon
            )}
            strokeWidth={1.85}
            aria-hidden
          />
        </div>
      )}
      <span
        className={cn(
          "relative z-[1] max-w-full px-1 font-semibold leading-snug tracking-tight text-zinc-700 dark:text-zinc-200",
          isRail
            ? railPill
              ? "whitespace-nowrap px-0 text-[12px]"
              : railInline
                ? "whitespace-nowrap px-0 text-[13px] font-medium"
              : railGrid
                ? "line-clamp-2 whitespace-normal break-words text-[12px] leading-tight"
                : railCompact
                  ? "line-clamp-2 text-[9px]"
                  : "line-clamp-2 text-[10px]"
            : isKbGrid
              ? "whitespace-normal break-words text-[13px]"
              : "line-clamp-2 break-words text-[12px]"
        )}
      >
        {label}
      </span>
      {filled ? (
        <Sparkles
          className={cn(
            "pointer-events-none absolute right-2.5 top-2.5 z-[1] h-3 w-3 opacity-0 transition-opacity duration-300 group-hover:opacity-80",
            tone.sparkle
          )}
          strokeWidth={2}
          aria-hidden
        />
      ) : null}
    </button>
  )
}
