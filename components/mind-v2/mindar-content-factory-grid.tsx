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
  /** Tighter cards for the KB Studio column */
  studioCompact?: boolean
}

export function MindarContentFactoryGrid({
  librarySummary,
  onSelect,
  className,
  surface = "flat",
  layout = "agent",
  studioCompact = false,
}: MindarContentFactoryGridProps) {
  const isKb = layout === "kb"
  return (
    <div className={cn(isKb && studioCompact ? "mt-1.5 w-full" : "mt-4 w-full", className)}>
      {librarySummary ? (
        <p
          className={cn(
            "truncate px-0.5 text-right font-medium tabular-nums text-zinc-400 dark:text-zinc-500",
            isKb && studioCompact ? "mb-1 text-[8px]" : "mb-2 text-[10px]"
          )}
          title={librarySummary}
        >
          {librarySummary}
        </p>
      ) : null}
      <div
        className={cn(
          isKb
            ? studioCompact
              ? "grid grid-cols-3 gap-1 items-stretch"
              : MINDAR_FACTORY_GRID_CLASS_KB
            : MINDAR_FACTORY_GRID_CLASS,
          "pb-0.5"
        )}
      >
        {MINDAR_FACTORY_ITEMS.map((item) => (
          <div key={item.id} className="min-h-0">
            <MindarFactoryCard
              kind={item.id}
              label={item.label}
              icon={item.icon}
              onClick={() => onSelect(item.id)}
              surface={surface}
              gridLayout={layout}
              studioCompact={isKb && studioCompact}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
