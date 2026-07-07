"use client"

import { cn } from "@/lib/utils"
import type { FactoryModalKind, FactoryOptionSurface } from "@/components/mind-v2/content-factory-modals"
import {
  MINDER_FACTORY_GRID_CLASS,
  MINDER_FACTORY_GRID_CLASS_ICON,
  MINDER_FACTORY_GRID_CLASS_KB,
  MINDER_FACTORY_GRID_CLASS_KB_COMPACT,
  MINDER_FACTORY_ITEMS,
  MinderFactoryCard,
} from "@/components/mind-v2/minder-factory-card"

export type MinderContentFactoryGridProps = {
  librarySummary: string
  onSelect: (kind: FactoryModalKind) => void
  className?: string
  surface?: FactoryOptionSurface
  /** `kb` — Knowledge Studio; `agent` — 3 columns × 2 rows */
  layout?: "agent" | "kb"
  /** `compact` — smaller tiles on first visit; `icon` — icon-only row after outputs exist */
  density?: "default" | "compact" | "icon"
}

export function MinderContentFactoryGrid({
  librarySummary,
  onSelect,
  className,
  surface = "flat",
  layout = "agent",
  density = "default",
}: MinderContentFactoryGridProps) {
  const gridClass =
    layout === "kb"
      ? density === "icon"
        ? MINDER_FACTORY_GRID_CLASS_ICON
        : density === "compact"
          ? MINDER_FACTORY_GRID_CLASS_KB_COMPACT
          : MINDER_FACTORY_GRID_CLASS_KB
      : MINDER_FACTORY_GRID_CLASS
  const gridDensity = layout === "kb" && density !== "default" ? density : "default"

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
      <div className={cn(gridClass, "pb-0.5")}>
        {MINDER_FACTORY_ITEMS.map((item) => (
          <div key={item.id} className={cn("min-h-0", density === "icon" && "w-auto")}>
            <MinderFactoryCard
              kind={item.id}
              label={item.label}
              icon={item.icon}
              onClick={() => onSelect(item.id)}
              surface={surface}
              gridLayout={layout}
              gridDensity={gridDensity}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
