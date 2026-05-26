"use client"

import { cn } from "@/lib/utils"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import {
  MINDAR_FACTORY_ITEMS,
  MINDAR_FACTORY_RAIL_CARD_WIDTH,
  MINDAR_FACTORY_RAIL_CARD_WIDTH_COMPACT,
  MindarFactoryCard,
} from "@/components/mind-v2/mindar-factory-card"

export type FactoryRailItem = {
  id: FactoryModalKind
  label: string
}

export const CHAT_FACTORY_RAIL_ITEMS: FactoryRailItem[] = MINDAR_FACTORY_ITEMS.map((item) => ({
  id: item.id,
  label: item.label,
}))

export type MindChatFactoryRailProps = {
  onSelect: (id: FactoryRailItem["id"]) => void
  selectedId?: FactoryModalKind | null
  className?: string
  /** Shorter chips for tight footers (e.g. KB article detail) */
  density?: "default" | "compact"
  /**
   * `grid` — agent home under composer: names visible, 3×2 even grid aligned to input width.
   * `scroll` — horizontal chips in chat footers.
   */
  layout?: "grid" | "scroll"
  /** `pill` — chip above composer; `inline` — inside composer toolbar (web) */
  railStyle?: "card" | "pill" | "inline"
}

export function resolveFactoryRailSelection(id: FactoryRailItem["id"]): FactoryModalKind {
  return id
}

const RAIL_ICON_BY_ID = Object.fromEntries(MINDAR_FACTORY_ITEMS.map((item) => [item.id, item.icon])) as Record<
  FactoryRailItem["id"],
  (typeof MINDAR_FACTORY_ITEMS)[number]["icon"]
>

export function MindChatFactoryRail({
  onSelect,
  selectedId = null,
  className,
  density = "default",
  layout = "scroll",
  railStyle = "card",
}: MindChatFactoryRailProps) {
  const compact = density === "compact"
  const isGrid = layout === "grid"
  const isPill = !isGrid && railStyle === "pill"
  const isInline = !isGrid && railStyle === "inline"

  const cards = CHAT_FACTORY_RAIL_ITEMS.map((item) => {
    const Icon = RAIL_ICON_BY_ID[item.id]
    return (
      <MindarFactoryCard
        key={item.id}
        variant="rail"
        railLayout={isGrid ? "grid" : "scroll"}
        railStyle={railStyle}
        density={density}
        kind={item.id}
        label={item.label}
        icon={Icon}
        selected={selectedId === item.id}
        onClick={() => onSelect(item.id)}
        className={
          isGrid
            ? "w-full"
            : isPill || isInline
              ? "shrink-0"
              : compact
                ? MINDAR_FACTORY_RAIL_CARD_WIDTH_COMPACT
                : MINDAR_FACTORY_RAIL_CARD_WIDTH
        }
      />
    )
  })

  return (
    <div className={cn("relative w-full", isGrid || isInline ? "" : "-mx-1", className)}>
      <div
        className={cn(
          isGrid
            ? "grid w-full grid-cols-3 items-stretch gap-2 sm:gap-2.5"
            : cn(
                "scrollbar-hide flex overflow-x-auto",
                isInline ? "gap-0.5 py-0" : "px-0.5",
                isPill ? "gap-1.5 pb-0.5 pt-0" : isInline ? "" : compact ? "gap-1 pb-1 pt-0" : "gap-1.5 pb-1.5 pt-0.5"
              )
        )}
        role="toolbar"
        aria-label="Content factory"
      >
        {cards}
      </div>
    </div>
  )
}
