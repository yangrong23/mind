"use client"

import { cn } from "@/lib/utils"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import {
  MINDER_FACTORY_ITEMS,
  MINDER_FACTORY_RAIL_CARD_WIDTH,
  MinderFactoryCard,
} from "@/components/mind-v2/minder-factory-card"

export type FactoryRailItem = {
  id: FactoryModalKind
  label: string
}

export const CHAT_FACTORY_RAIL_ITEMS: FactoryRailItem[] = MINDER_FACTORY_ITEMS.map((item) => ({
  id: item.id,
  label: item.label === "Audio" ? "Audio overview" : item.label,
}))

export type MindChatFactoryRailProps = {
  onSelect: (id: FactoryRailItem["id"]) => void
  className?: string
}

export function resolveFactoryRailSelection(id: FactoryRailItem["id"]): FactoryModalKind {
  return id
}

const RAIL_ICON_BY_ID = Object.fromEntries(MINDER_FACTORY_ITEMS.map((item) => [item.id, item.icon])) as Record<
  FactoryRailItem["id"],
  (typeof MINDER_FACTORY_ITEMS)[number]["icon"]
>

export function MindChatFactoryRail({ onSelect, className }: MindChatFactoryRailProps) {
  return (
    <div className={cn("relative -mx-1", className)}>
      <div
        className="scrollbar-hide flex gap-1.5 overflow-x-auto px-1 pb-1.5 pt-0.5"
        role="toolbar"
        aria-label="Content factory"
      >
        {CHAT_FACTORY_RAIL_ITEMS.map((item) => {
          const Icon = RAIL_ICON_BY_ID[item.id]
          return (
            <MinderFactoryCard
              key={item.id}
              variant="rail"
              kind={item.id}
              label={item.label}
              icon={Icon}
              onClick={() => onSelect(item.id)}
              className={MINDER_FACTORY_RAIL_CARD_WIDTH}
            />
          )
        })}
      </div>
    </div>
  )
}
