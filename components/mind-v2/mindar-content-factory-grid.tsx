"use client"

import { cn } from "@/lib/utils"
import type { FactoryModalKind, FactoryOptionSurface } from "@/components/mind-v2/content-factory-modals"
import {
  MINDAR_FACTORY_GRID_CLASS,
  MINDAR_FACTORY_GRID_CLASS_KB,
  MINDAR_FACTORY_ITEMS,
  MindarFactoryCard,
} from "@/components/mind-v2/mindar-factory-card"

export type MindarContentFactoryGridProps = {
  librarySummary: string
  onSelect: (kind: FactoryModalKind) => void
  className?: string
  surface?: FactoryOptionSurface
  /** `kb` — 2 columns × 3 rows (Knowledge Studio); `agent` — 3 columns × 2 rows */
  layout?: "agent" | "kb"
}

export function MindarContentFactoryGrid({
  librarySummary,
  onSelect,
  className,
  surface = "flat",
  layout = "agent",
}: MindarContentFactoryGridProps) {
  return (
    <div className={cn("mt-4 w-full", className)}>
      {librarySummary ? (
        <p
          className="mb-2 truncate px-0.5 text-right text-[10px] font-medium tabular-nums text-zinc-400 dark:text-zinc-500"
          title={librarySummary}
        >
          {librarySummary}
        </p>
      ) : null}
      <div className={cn(layout === "kb" ? MINDAR_FACTORY_GRID_CLASS_KB : MINDAR_FACTORY_GRID_CLASS, "pb-0.5")}>
        {MINDAR_FACTORY_ITEMS.map((item) => (
          <div key={item.id} className="min-h-0">
            <MindarFactoryCard
              kind={item.id}
              label={item.label}
              icon={item.icon}
              onClick={() => onSelect(item.id)}
              surface={surface}
              gridLayout={layout}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
