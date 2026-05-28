"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import {
  BarChart3,
  Check,
  FolderInput,
  Layers,
  HelpCircle,
  Monitor,
  MoreVertical,
  Network,
  Play,
  Volume2,
  type LucideIcon,
} from "lucide-react"

/** NotebookLM-style pastel icon wells per Studio output kind. */
export type StudioOutputVisual = {
  Icon: LucideIcon
  well: string
  icon: string
  showPlay?: boolean
}

export function studioOutputVisual(kind: FactoryModalKind): StudioOutputVisual {
  switch (kind) {
    case "report":
      return {
        Icon: Network,
        well: "bg-stone-200/55 ring-1 ring-stone-200/70 dark:bg-zinc-700/45 dark:ring-zinc-600/35",
        icon: "text-zinc-600 dark:text-zinc-300",
      }
    case "slides":
      return {
        Icon: Monitor,
        well: "bg-stone-200/60 ring-1 ring-stone-200/75 dark:bg-zinc-700/48 dark:ring-zinc-600/35",
        icon: "text-zinc-600 dark:text-zinc-300",
      }
    case "infographic":
      return {
        Icon: BarChart3,
        well: "bg-slate-200/55 ring-1 ring-slate-200/70 dark:bg-zinc-700/45 dark:ring-zinc-600/35",
        icon: "text-zinc-600 dark:text-zinc-300",
      }
    case "audio":
      return {
        Icon: Volume2,
        well: "bg-slate-200/50 ring-1 ring-slate-200/65 dark:bg-zinc-700/45 dark:ring-zinc-600/35",
        icon: "text-zinc-600 dark:text-zinc-300",
        showPlay: true,
      }
    case "flashcards":
      return {
        Icon: Layers,
        well: "bg-zinc-200/50 ring-1 ring-zinc-200/65 dark:bg-zinc-700/45 dark:ring-zinc-600/35",
        icon: "text-zinc-600 dark:text-zinc-300",
      }
    case "quiz":
      return {
        Icon: HelpCircle,
        well: "bg-neutral-200/50 ring-1 ring-neutral-200/65 dark:bg-zinc-700/45 dark:ring-zinc-600/35",
        icon: "text-zinc-600 dark:text-zinc-300",
      }
    default:
      return {
        Icon: Network,
        well: "bg-stone-200/55 ring-1 ring-stone-200/70 dark:bg-zinc-700/45 dark:ring-zinc-600/35",
        icon: "text-zinc-600 dark:text-zinc-300",
      }
  }
}

export function StudioOutputKindIcon({
  kind,
  size = "md",
  className,
}: {
  kind: FactoryModalKind
  size?: "sm" | "md"
  className?: string
}) {
  const visual = studioOutputVisual(kind)
  const Icon = visual.Icon
  const box = size === "sm" ? "h-9 w-9 rounded-lg" : "h-10 w-10 rounded-xl"
  const iconDim = size === "sm" ? "h-[18px] w-[18px]" : "h-5 w-5"

  return (
    <div
      className={cn("relative flex shrink-0 items-center justify-center", box, visual.well, className)}
      aria-hidden
    >
      <Icon className={cn(iconDim, visual.icon)} strokeWidth={1.85} />
    </div>
  )
}

export function StudioOutputListRow({
  kind,
  title,
  meta,
  subtitle,
  onClick,
  onMenuClick,
  onPlayClick,
  trailing,
  className,
}: {
  kind: FactoryModalKind
  title: string
  meta?: string
  subtitle?: string
  onClick?: () => void
  onMenuClick?: () => void
  onPlayClick?: () => void
  trailing?: ReactNode
  className?: string
}) {
  const visual = studioOutputVisual(kind)
  const hasNestedActions = Boolean(onMenuClick || onPlayClick)

  return (
    <div
      role={onClick && !hasNestedActions ? "button" : undefined}
      tabIndex={onClick && !hasNestedActions ? 0 : undefined}
      onClick={hasNestedActions ? undefined : onClick}
      onKeyDown={
        onClick && !hasNestedActions
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors",
        onClick && "cursor-pointer hover:bg-zinc-900/[0.04] active:bg-zinc-900/[0.06]",
        className
      )}
    >
      <StudioOutputKindIcon kind={kind} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium leading-snug text-zinc-900">{title}</p>
        {meta ? <p className="mt-0.5 truncate text-[12px] text-zinc-500">{meta}</p> : null}
        {subtitle ? <p className="mt-0.5 truncate text-[12px] text-zinc-400">{subtitle}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {trailing}
        {visual.showPlay && onPlayClick ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onPlayClick()
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-mind/10 text-mind transition-colors hover:bg-mind/15"
            aria-label="Play"
          >
            <Play className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
          </button>
        ) : null}
        {onMenuClick ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onMenuClick()
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 opacity-80 transition-colors hover:bg-zinc-900/[0.05] hover:text-zinc-600 group-hover:opacity-100"
            aria-label="More actions"
          >
            <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function StudioOutputArchiveRow({
  archived,
  archiveLabel,
  onArchive,
}: {
  archived: boolean
  archiveLabel: string
  onArchive: () => void
}) {
  if (archived) {
    return (
      <div className="flex items-center justify-end border-t border-black/[0.04] px-2 py-1.5">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500">
          <Check className="h-3 w-3 text-mind" strokeWidth={2.5} aria-hidden />
          In Hub
        </span>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-end border-t border-black/[0.04] px-2 py-1.5">
      <button
        type="button"
        onClick={onArchive}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-mind transition-colors hover:bg-mind/8"
      >
        <FolderInput className="h-3 w-3" strokeWidth={2} aria-hidden />
        {archiveLabel}
      </button>
    </div>
  )
}
