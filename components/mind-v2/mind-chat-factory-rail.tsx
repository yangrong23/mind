"use client"

import { cn } from "@/lib/utils"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import {
  FileText,
  Volume2,
  Layers,
  HelpCircle,
  Presentation,
  BarChart3,
  Network,
  type LucideIcon,
} from "lucide-react"

export type FactoryRailItem = {
  id: FactoryModalKind | "mindmap"
  label: string
  icon: LucideIcon
}

export const CHAT_FACTORY_RAIL_ITEMS: FactoryRailItem[] = [
  { id: "mindmap", label: "Mind map", icon: Network },
  { id: "report", label: "Report", icon: FileText },
  { id: "slides", label: "Slides", icon: Presentation },
  { id: "infographic", label: "Infographic", icon: BarChart3 },
  { id: "audio", label: "Audio overview", icon: Volume2 },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "quiz", label: "Quiz", icon: HelpCircle },
]

export type MindChatFactoryRailProps = {
  onSelect: (id: FactoryRailItem["id"]) => void
  className?: string
}

export function resolveFactoryRailSelection(
  id: FactoryRailItem["id"]
): { type: "modal"; kind: FactoryModalKind } | { type: "mindmap" } {
  if (id === "mindmap") return { type: "mindmap" }
  return { type: "modal", kind: id }
}

export function MindChatFactoryRail({ onSelect, className }: MindChatFactoryRailProps) {
  return (
    <div className={cn("relative -mx-1", className)}>
      <div
        className="scrollbar-hide flex gap-2 overflow-x-auto px-1 pb-2 pt-1"
        role="toolbar"
        aria-label="Content factory"
      >
        {CHAT_FACTORY_RAIL_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white px-3.5 py-2",
                "text-[13px] font-medium text-zinc-800 shadow-sm shadow-zinc-900/[0.03]",
                "transition-colors hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98]",
                "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <Icon className="h-4 w-4 shrink-0 text-zinc-600 dark:text-zinc-300" strokeWidth={1.75} aria-hidden />
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
