"use client"

import { FilePlus, History } from "lucide-react"
import { cn } from "@/lib/utils"

export type MindChatHeaderActionsProps = {
  onNewChat: () => void
  onOpenHistory: () => void
  className?: string
  /** Slightly tighter hit targets for dense headers */
  size?: "default" | "compact"
}

const btnBase =
  "flex shrink-0 items-center justify-center rounded-full text-zinc-800 transition-colors hover:bg-stone-200/70 active:bg-stone-200 dark:text-zinc-100 dark:hover:bg-zinc-800/80 dark:active:bg-zinc-800"

export function MindChatHeaderActions({
  onNewChat,
  onOpenHistory,
  className,
  size = "default",
}: MindChatHeaderActionsProps) {
  const dim = size === "compact" ? "h-9 w-9" : "h-10 w-10"
  const icon = size === "compact" ? "h-[18px] w-[18px]" : "h-5 w-5"
  return (
    <div className={cn("flex shrink-0 items-center gap-0.5", className)}>
      <button type="button" className={cn(btnBase, dim)} aria-label="New chat" onClick={onNewChat}>
        <FilePlus className={icon} strokeWidth={1.75} />
      </button>
      <button type="button" className={cn(btnBase, dim)} aria-label="Q&A history" onClick={onOpenHistory}>
        <History className={icon} strokeWidth={1.75} />
      </button>
    </div>
  )
}
