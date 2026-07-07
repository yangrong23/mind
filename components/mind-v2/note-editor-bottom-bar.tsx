"use client"

import { cn } from "@/lib/utils"
import { ALargeSmall, ChevronDown, Keyboard, ListChecks, Pencil, Sparkles } from "lucide-react"
import { MindAddButton } from "@/components/mind-v2/mind-add-button"

const toolBtn =
  "flex flex-1 items-center justify-center py-2.5 text-zinc-500 transition-colors hover:bg-stone-100/90 active:bg-stone-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800/80"

/** Pencil + sparkle — AI help writing (帮写). */
export function NoteAiWriteIcon({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-[22px] w-[22px] items-center justify-center", className)}>
      <Pencil className="h-[18px] w-[18px] -rotate-12" strokeWidth={1.65} aria-hidden />
      <Sparkles
        className="absolute -right-0.5 -top-1 h-2.5 w-2.5 text-zinc-500"
        strokeWidth={2.25}
        aria-hidden
      />
    </span>
  )
}

/** Pencil + sparkle — smart title generation. */
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

export type NoteEditorBottomBarProps = {
  onAiWrite?: () => void
  aiWriteActive?: boolean
  onFormat: () => void
  onList: () => void
  onInsert: () => void
  onDismissKeyboard?: () => void
  formatActive?: boolean
  className?: string
}

/** Mobile note editor — AI write + formatting tools + keyboard dismiss. */
export function NoteEditorBottomBar({
  onAiWrite,
  aiWriteActive = false,
  onFormat,
  onList,
  onInsert,
  onDismissKeyboard,
  formatActive = false,
  className,
}: NoteEditorBottomBarProps) {
  return (
    <div
      className={cn(
        "flex w-full items-stretch border-t border-stone-100/90 bg-white dark:border-zinc-800 dark:bg-zinc-950",
        className
      )}
      role="toolbar"
      aria-label="Note editor tools"
    >
      {onAiWrite ? (
        <button
          type="button"
          className={cn(
            toolBtn,
            aiWriteActive && "bg-mind/8 text-mind dark:bg-mind/12 dark:text-mind"
          )}
          aria-label="AI help writing"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onAiWrite}
        >
          <NoteAiWriteIcon />
        </button>
      ) : null}
      <button
        type="button"
        className={cn(toolBtn, formatActive && "bg-stone-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200")}
        aria-label="Text formatting"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onFormat}
      >
        <ALargeSmall className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />
      </button>
      <button
        type="button"
        className={toolBtn}
        aria-label="Checklist"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onList}
      >
        <ListChecks className="h-5 w-5" strokeWidth={1.65} aria-hidden />
      </button>
      <MindAddButton
        variant="toolbar"
        useCirclePlus
        aria-label="Insert"
        onClick={onInsert}
        className="mx-auto my-1"
      />
      {onDismissKeyboard ? (
        <button
          type="button"
          className={cn(toolBtn, "relative")}
          aria-label="Dismiss keyboard"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onDismissKeyboard}
        >
          <Keyboard className="h-[20px] w-[20px]" strokeWidth={1.5} aria-hidden />
          <ChevronDown className="absolute bottom-1.5 right-[calc(50%-11px)] h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
        </button>
      ) : null}
    </div>
  )
}
