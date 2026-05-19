"use client"

import { cn } from "@/lib/utils"
import type { FactoryModalKind, FactoryOptionSurface } from "@/components/mind-v2/content-factory-modals"
import {
  MINDER_FACTORY_GRID_CLASS,
  MINDER_FACTORY_ITEMS,
  MinderFactoryCard,
} from "@/components/mind-v2/minder-factory-card"

export type MinderContentFactoryGridProps = {
  librarySummary: string
  onSelect: (kind: FactoryModalKind) => void
  className?: string
  surface?: FactoryOptionSurface
}

export function MinderContentFactoryGrid({
  librarySummary,
  onSelect,
  className,
  surface = "flat",
}: MinderContentFactoryGridProps) {
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
      <div className={MINDER_FACTORY_GRID_CLASS}>
        {MINDER_FACTORY_ITEMS.map((item) => (
          <MinderFactoryCard
            key={item.id}
            kind={item.id}
            label={item.label}
            icon={item.icon}
            onClick={() => onSelect(item.id)}
            surface={surface}
          />
        ))}
      </div>
    </div>
  )
}
