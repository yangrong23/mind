"use client"

import type { ReactNode } from "react"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"

export type KnowledgeDetailWebShellProps = {
  title: string
  description?: string
  embedded?: boolean
  onBack: () => void
  /** When false, search stays in Sources panel only */
  showHeaderSearch?: boolean
  onSearch?: () => void
  headerActions?: ReactNode
  sources: ReactNode
  center: ReactNode
  studio: ReactNode
  overlays?: ReactNode
}

const panelClass = cn(
  "flex flex-col overflow-hidden rounded-2xl bg-white/90",
  web.panelShadow,
  "ring-1 ring-black/[0.04]"
)

/** NotebookLM 工作区 — 淡化边框 */
export function KnowledgeDetailWebShell({
  title,
  description,
  embedded,
  onBack,
  showHeaderSearch = false,
  onSearch,
  headerActions,
  sources,
  center,
  studio,
  overlays,
}: KnowledgeDetailWebShellProps) {
  return (
    <div className={cn("relative flex h-full min-h-0 flex-col", web.canvas)}>
      <div className="relative z-10 flex shrink-0 items-center gap-2 px-4 py-3">
        {!embedded ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 items-center gap-1 rounded-lg px-2 text-[13px] font-medium text-zinc-600 hover:bg-white/80"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold text-zinc-700">{title}</h1>
          {description ? <p className="truncate text-[12px] text-zinc-500">{description}</p> : null}
        </div>
        {showHeaderSearch && onSearch ? (
          <button
            type="button"
            onClick={onSearch}
            className="rounded-lg p-2 text-zinc-500 hover:bg-white/80"
            aria-label="Search"
          >
            <SmartSearchIcon className="h-4 w-4" />
          </button>
        ) : null}
        {headerActions}
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 gap-2.5 px-3 pb-0">
        <aside className={cn(panelClass, "w-[min(260px,24vw)] min-w-[200px] shrink-0")} aria-label="Sources">
          {sources}
        </aside>
        <section className={cn(panelClass, "min-w-0 flex-1")} aria-label="Dialogue">
          {center}
        </section>
        <aside
          className={cn(panelClass, "w-[min(340px,30vw)] min-w-[280px] shrink-0")}
          aria-label="Studio"
        >
          {studio}
        </aside>
      </div>
      {overlays}
    </div>
  )
}

export function WebPanelHeader({
  title,
  trailing,
  className,
}: {
  title: string
  trailing?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-2 px-3.5 py-2.5",
        className
      )}
    >
      <h2 className="text-[13px] font-semibold text-zinc-600">{title}</h2>
      {trailing}
    </div>
  )
}

export function KnowledgeGraphPreview({ compact }: { compact?: boolean }) {
  const size = compact ? "w-full max-w-[180px] aspect-square" : "w-64 h-64"
  return (
    <div className={cn("relative mx-auto", size)}>
      <div className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-teal-400 text-[11px] font-semibold text-white">
        Core
      </div>
      {[
        { x: 0, y: -48, label: "A", color: "bg-violet-300" },
        { x: 44, y: -26, label: "B", color: "bg-sky-300" },
        { x: 44, y: 26, label: "C", color: "bg-teal-300" },
        { x: 0, y: 48, label: "D", color: "bg-fuchsia-300" },
        { x: -44, y: 26, label: "E", color: "bg-indigo-300" },
        { x: -44, y: -26, label: "F", color: "bg-cyan-300" },
      ].map((node, i) => (
        <div
          key={i}
          className={cn(
            "absolute flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-medium text-white/90",
            node.color
          )}
          style={{
            left: `calc(50% + ${node.x}px - 18px)`,
            top: `calc(50% + ${node.y}px - 18px)`,
          }}
        >
          {node.label}
        </div>
      ))}
    </div>
  )
}
