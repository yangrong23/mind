"use client"

import { cn } from "@/lib/utils"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import {
  MINDER_FACTORY_ITEMS,
  MINDER_FACTORY_RAIL_CARD_WIDTH,
  MINDER_FACTORY_RAIL_CARD_WIDTH_COMPACT,
  MinderFactoryCard,
} from "@/components/mind-v2/minder-factory-card"

export type FactoryRailItem = {
  id: FactoryModalKind
  label: string
}

export const CHAT_FACTORY_RAIL_ITEMS: FactoryRailItem[] = MINDER_FACTORY_ITEMS.map((item) => ({
  id: item.id,
  label: item.label,
}))

export type MindChatFactoryRailProps = {
  onSelect: (id: FactoryRailItem["id"]) => void
  selectedId?: FactoryModalKind | null
  className?: string
  /** Shorter chips for tight footers; `tight` = GenFlow-style pills above composer in thread */
  density?: "default" | "compact" | "tight"
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

const RAIL_ICON_BY_ID = Object.fromEntries(MINDER_FACTORY_ITEMS.map((item) => [item.id, item.icon])) as Record<
  FactoryRailItem["id"],
  (typeof MINDER_FACTORY_ITEMS)[number]["icon"]
>

export function MindChatFactoryRail({
  onSelect,
  selectedId = null,
  className,
  density = "default",
  layout = "scroll",
  railStyle = "card",
  items = CHAT_FACTORY_RAIL_ITEMS,
}: MindChatFactoryRailProps & { items?: FactoryRailItem[] }) {
  const compact = density === "compact" || density === "tight"
  const tight = density === "tight"
  const isGrid = layout === "grid"
  const isPill = !isGrid && railStyle === "pill"
  const isInline = !isGrid && railStyle === "inline"

  const cards = items.map((item) => {
    const Icon = RAIL_ICON_BY_ID[item.id]
    return (
      <MinderFactoryCard
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
                ? MINDER_FACTORY_RAIL_CARD_WIDTH_COMPACT
                : MINDER_FACTORY_RAIL_CARD_WIDTH
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
                isPill
                  ? tight
                    ? "gap-1.5 pb-0.5 pt-0"
                    : "gap-1.5 pb-1 pt-0"
                  : isInline
                    ? ""
                    : compact
                      ? "gap-1 pb-1 pt-0"
                      : "gap-1.5 pb-1.5 pt-0.5"
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
