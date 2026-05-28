"use client"

import { cn } from "@/lib/utils"
import { Copy, Library, Pencil, RefreshCw, Share2, ThumbsDown, ThumbsUp } from "lucide-react"

export type MessageFeedback = "up" | "down" | null

export type MindChatMessageActionsProps = {
  onRegenerate: () => void
  onSaveToLibrary?: () => void
  onShare: () => void
  onCopy: () => void
  onThumbsUp: () => void
  onThumbsDown: () => void
  onEdit?: () => void
  className?: string
  /** Library-grounded chat emphasizes save-to-library. */
  variant?: "default" | "library"
  feedback?: MessageFeedback
  /** @deprecated Locale is fixed to English in the demo UI. */
  locale?: "zh-CN" | "en-US"
}

export function MindChatMessageActions({
  onRegenerate,
  onSaveToLibrary,
  onShare,
  onCopy,
  onThumbsUp,
  onThumbsDown,
  onEdit,
  className,
  variant = "default",
  feedback = null,
}: MindChatMessageActionsProps) {
  const saveLabel = variant === "library" ? "To library" : "Add to library"

  return (
    <div
      className={cn(
        "mt-2 flex w-full flex-wrap items-center gap-0.5 border-t border-stone-100/90 pt-2 dark:border-zinc-800",
        className
      )}
    >
      {variant === "default" && onSaveToLibrary ? (
        <ActionChip icon={Library} label={saveLabel} onClick={onSaveToLibrary} />
      ) : null}
      <IconAction
        icon={ThumbsUp}
        label="Helpful"
        onClick={onThumbsUp}
        active={feedback === "up"}
      />
      <IconAction
        icon={ThumbsDown}
        label="Not helpful"
        onClick={onThumbsDown}
        active={feedback === "down"}
      />
      <IconAction icon={Copy} label="Copy" onClick={onCopy} />
      {variant === "library" && onSaveToLibrary ? (
        <ActionChip icon={Library} label={saveLabel} onClick={onSaveToLibrary} />
      ) : null}
      <IconAction icon={Share2} label="Share" onClick={onShare} />
      {variant === "default" && onEdit ? (
        <IconAction icon={Pencil} label="Edit" onClick={onEdit} />
      ) : null}
      {variant === "default" ? (
        <ActionChip
          icon={RefreshCw}
          label="Regenerate"
          onClick={onRegenerate}
          className="ml-auto"
        />
      ) : (
        <IconAction
          icon={RefreshCw}
          label="Regenerate"
          onClick={onRegenerate}
          className="ml-auto"
        />
      )}
    </div>
  )
}

function IconAction({
  icon: Icon,
  label,
  onClick,
  active,
  className,
}: {
  icon: typeof ThumbsUp
  label: string
  onClick: () => void
  active?: boolean
  className?: string
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
            : "bg-stone-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"),
        className
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
    </button>
  )
}

function ActionChip({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon: typeof RefreshCw
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-2.5 py-1.5 text-[12px] font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200 dark:hover:bg-zinc-800",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
      {label}
    </button>
  )
}
