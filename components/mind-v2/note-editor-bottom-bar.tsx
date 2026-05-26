"use client"

import { cn } from "@/lib/utils"
import { CirclePlus, ListChecks, Pencil, Sparkles } from "lucide-react"

const toolBtn =
  "flex flex-1 items-center justify-center py-3 text-zinc-600 transition-colors hover:bg-stone-100/90 active:bg-stone-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800/80"

/** Pencil + sparkle — smart title generation (title row). */
export function NoteSmartTitleIcon({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-5 w-5 items-center justify-center", className)}>
      <Pencil className="h-[18px] w-[18px]" strokeWidth={1.65} aria-hidden />
      <Sparkles
        className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 text-mind"
        strokeWidth={2.25}
        aria-hidden
      />
    </span>
  )
}

/** Bottom bar — pencil + sparkle + underline (AI writing assist). */
export function NoteSmartPenIcon({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-6 w-6 items-center justify-center", className)}>
      <Pencil
        className="h-[19px] w-[19px] -rotate-[18deg] translate-x-px -translate-y-px"
        strokeWidth={1.55}
        aria-hidden
      />
      <Sparkles
        className="absolute left-0 top-0 h-[10px] w-[10px] text-mind"
        strokeWidth={2.1}
        aria-hidden
      />
      <span
        className="absolute bottom-px left-1/2 h-[1.5px] w-[14px] -translate-x-1/2 rounded-full bg-current opacity-90"
        aria-hidden
      />
    </span>
  )
}

export type NoteEditorBottomBarProps = {
  onSmartWrite: () => void
  onFormat: () => void
  onList: () => void
  onInsert: () => void
  formatActive?: boolean
  smartActive?: boolean
  className?: string
}

/** Mobile note editor — four tools, equal width. */
export function NoteEditorBottomBar({
  onSmartWrite,
  onFormat,
  onList,
  onInsert,
  formatActive = false,
  smartActive = false,
  className,
}: NoteEditorBottomBarProps) {
  return (
    <div
      className={cn(
        "flex w-full items-stretch border-t border-stone-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950",
        className
      )}
      role="toolbar"
      aria-label="Note editor tools"
    >
      <button
        type="button"
        className={cn(toolBtn, smartActive && "bg-stone-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200")}
        aria-label="Smart writing assist"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onSmartWrite}
      >
        <NoteSmartPenIcon />
      </button>
      <button
        type="button"
        className={cn(toolBtn, formatActive && "bg-stone-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200")}
        aria-label="Text formatting"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onFormat}
      >
        <span className="text-[19px] font-medium leading-none tracking-tight" aria-hidden>
          Aa
        </span>
      </button>
      <button
        type="button"
        className={toolBtn}
        aria-label="Checklist and bullet list"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onList}
      >
        <ListChecks className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />
      </button>
      <button
        type="button"
        className={toolBtn}
        aria-label="Insert"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onInsert}
      >
        <CirclePlus className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  )
}
