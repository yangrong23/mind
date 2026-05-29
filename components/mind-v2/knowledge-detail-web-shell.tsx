"use client"

import type { ReactNode, RefObject } from "react"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"

export type KnowledgeDetailWebShellProps = {
  title: string
  description?: string
  embedded?: boolean
  onBack: () => void
  showHeaderSearch?: boolean
  onSearch?: () => void
  headerActions?: ReactNode
  /** Left — files (sources & outputs) */
  left: ReactNode
  /** Center — document reader or AI view */
  middle: ReactNode
  /** Right — persistent Mindar chat */
  right: ReactNode
  overlays?: ReactNode
  /** @deprecated Use left/middle/right */
  sources?: ReactNode
  center?: ReactNode
  studio?: ReactNode
  layout?: "notebook" | "subscribed" | "workspace"
  studioRef?: RefObject<HTMLDivElement | null>
  studioHighlight?: boolean
}

const panelClass = cn(web.kbPanel, "flex flex-col overflow-hidden")

const colLeft = "w-[min(280px,26vw)] min-w-[220px] shrink-0"
const colMiddle = "min-w-0 flex-1"
const colRight = "w-[min(380px,34vw)] min-w-[300px] shrink-0"

/** KB workspace — files | reader / AI view | chat (same grid for public & private). */
export function KnowledgeDetailWebShell({
  title,
  description,
  embedded,
  onBack,
  showHeaderSearch = false,
  onSearch,
  headerActions,
  left,
  middle,
  right,
  overlays,
  sources,
  center,
  studio,
}: KnowledgeDetailWebShellProps) {
  const leftPanel = left ?? sources
  const middlePanel = middle ?? center
  const rightPanel = right ?? (studio != null ? center : null) ?? center

  return (
    <div className={cn("relative flex h-full min-h-0 flex-col", web.canvas)}>
      <div className="relative z-10 flex shrink-0 items-center gap-2 border-b border-black/[0.04] px-4 py-3">
        {!embedded ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 shrink-0 items-center gap-1 rounded-lg px-2 text-[13px] font-medium text-zinc-600 hover:bg-white/80"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold text-zinc-800">{title}</h1>
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

      <div className="relative z-10 flex min-h-0 flex-1 gap-2.5 overflow-x-auto px-3 pb-0">
        <aside className={cn(panelClass, colLeft)} aria-label="Files">
          {leftPanel}
        </aside>
        <section className={cn(panelClass, colMiddle)} aria-label="Content">
          {middlePanel}
        </section>
        <aside className={cn(panelClass, colRight)} aria-label="Mindar chat">
          {rightPanel}
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
        "grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-black/[0.05] px-3.5 py-2.5",
        className
      )}
    >
      <h2 className="truncate text-[13px] font-semibold text-zinc-600">{title}</h2>
      {trailing ? <div className="flex items-center justify-end">{trailing}</div> : null}
    </div>
  )
}

export function KnowledgeGraphPreview({ compact }: { compact?: boolean }) {
  const size = compact ? "w-full max-w-[180px] aspect-square" : "w-64 h-64"
  return (
    <div className={cn("relative mx-auto", size)}>
      <div className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-teal-400 text-[11px] font-semibold text-white shadow-sm shadow-sky-300/40">
        Core
      </div>
      {[
        { x: 0, y: -48, label: "A", color: "bg-sky-300" },
        { x: 44, y: -26, label: "B", color: "bg-sky-300" },
        { x: 44, y: 26, label: "C", color: "bg-teal-300" },
        { x: 0, y: 48, label: "D", color: "bg-fuchsia-300" },
        { x: -44, y: 26, label: "E", color: "bg-blue-300" },
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
