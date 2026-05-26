"use client"

import { History, MessageSquarePlus } from "lucide-react"
import { cn } from "@/lib/utils"
export type MindChatHeaderActionsProps = {
  onNewChat: () => void
  onOpenHistory: () => void
  className?: string
  /** Slightly tighter hit targets for dense headers */
  size?: "default" | "compact"
  /** Knowledge Ask uses neutral chrome; Agent chat keeps mind accent on new chat */
  newChatAccent?: boolean
}

const btnBase =
  "flex shrink-0 items-center justify-center rounded-full text-zinc-800 transition-colors hover:bg-stone-200/70 active:bg-stone-200 dark:text-zinc-100 dark:hover:bg-zinc-800/80 dark:active:bg-zinc-800"

export function MindChatHeaderActions({
  onNewChat,
  onOpenHistory,
  className,
  size = "default",
  newChatAccent = true,
}: MindChatHeaderActionsProps) {
  const dim = size === "compact" ? "h-9 w-9" : "h-10 w-10"
  const icon = size === "compact" ? "h-[18px] w-[18px]" : "h-5 w-5"
  return (
    <div className={cn("flex shrink-0 items-center gap-0.5", className)}>
      <button
        type="button"
        className={cn(
          btnBase,
          dim,
          newChatAccent
            ? cn(
                "bg-mind/10 text-mind ring-1 ring-mind/20 hover:bg-mind/15 hover:text-mind active:bg-mind/20",
                "dark:bg-mind/15 dark:text-mind dark:ring-mind/30 dark:hover:bg-mind/20",
                "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              )
            : "text-zinc-600 hover:bg-stone-200/70 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
        )}
        aria-label="New chat"
        title="New chat"
        onClick={onNewChat}
      >
        <MessageSquarePlus className={icon} strokeWidth={2} aria-hidden />
      </button>
      <button type="button" className={cn(btnBase, dim)} aria-label="Q&A history" onClick={onOpenHistory}>
        <History className={icon} strokeWidth={1.75} />
      </button>
    </div>
  )
}
