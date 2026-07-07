"use client"

import { cn } from "@/lib/utils"
import { Copy, Library, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react"

export type MessageFeedback = "up" | "down" | null

export type MindChatMessageActionsProps = {
  onRegenerate: () => void
  onSaveToLibrary?: () => void
  onCopy: () => void
  onThumbsUp: () => void
  onThumbsDown: () => void
  className?: string
  feedback?: MessageFeedback
  /** @deprecated Locale is fixed to English in the demo UI. */
  locale?: "zh-CN" | "en-US"
  /** @deprecated All chats use the same icon row. */
  variant?: "default" | "library"
  /** @deprecated Use onSaveToLibrary. */
  onShare?: () => void
  onEdit?: () => void
  onMore?: () => void
}

export function MindChatMessageActions({
  onRegenerate,
  onSaveToLibrary,
  onCopy,
  onThumbsUp,
  onThumbsDown,
  className,
  feedback = null,
}: MindChatMessageActionsProps) {
  return (
    <div className={cn("mt-2 flex items-center gap-0.5", className)}>
      <IconAction icon={Copy} label="Copy" onClick={onCopy} />
      <IconAction icon={ThumbsUp} label="Helpful" onClick={onThumbsUp} active={feedback === "up"} />
      <IconAction icon={ThumbsDown} label="Not helpful" onClick={onThumbsDown} active={feedback === "down"} />
      {onSaveToLibrary ? <IconAction icon={Library} label="Add to library" onClick={onSaveToLibrary} /> : null}
      <IconAction icon={RefreshCw} label="Regenerate" onClick={onRegenerate} />
    </div>
  )
}

function IconAction({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: typeof ThumbsUp
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-stone-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
        active === true &&
          (label === "Helpful"
            ? "bg-mind/5 text-mind dark:bg-mind/50 dark:text-mind/28"
            : "bg-stone-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200")
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
    </button>
  )
}
