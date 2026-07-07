"use client"

import { cn } from "@/lib/utils"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import { MINDER_FACTORY_ITEMS } from "@/components/mind-v2/minder-factory-card"

export function MindChatFactoryMenu({
  onSelect,
  selectedId,
  className,
}: {
  onSelect: (kind: FactoryModalKind) => void
  selectedId?: FactoryModalKind | null
  className?: string
}) {
  return (
    <div
      role="menu"
      aria-label="Content factory"
      className={cn(
        "w-[11.5rem] overflow-hidden rounded-xl border border-stone-200/90 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900",
        className
      )}
    >
      {MINDER_FACTORY_ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium text-zinc-700 transition-colors hover:bg-stone-50 dark:text-zinc-200 dark:hover:bg-zinc-800",
              selectedId === item.id && "bg-sky-50/80 text-mind dark:bg-sky-950/40"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
