"use client"

import { cn } from "@/lib/utils"
import {
  Copy,
  Library,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react"

export type MessageFeedback = "up" | "down" | null

export type MindChatMessageActionsProps = {
  onRegenerate: () => void
  onSaveToLibrary: () => void
  onShare: () => void
  onCopy: () => void
  onThumbsUp: () => void
  onThumbsDown: () => void
  onEdit?: () => void
  onMore?: () => void
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
  onMore,
  className,
  variant = "default",
  feedback = null,
}: MindChatMessageActionsProps) {
  return (
    <div
      className={cn(
        "mt-2 flex flex-col gap-2 border-t border-stone-100/90 pt-2 dark:border-zinc-800",
        className
      )}
    >
      {variant === "library" ? (
        <button
          type="button"
          onClick={onSaveToLibrary}
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-stone-200/90 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-600 shadow-sm transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Library className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
          Save to notes
        </button>
      ) : null}

      <div className="flex flex-wrap items-center gap-0.5">
        {variant === "default" ? (
          <ActionChip icon={RefreshCw} label="Regenerate" onClick={onRegenerate} />
        ) : null}
        {variant === "default" ? (
          <ActionChip icon={Library} label="Add to library" onClick={onSaveToLibrary} />
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
        {variant === "library" ? (
          <IconAction icon={RefreshCw} label="Regenerate" onClick={onRegenerate} />
        ) : null}
        <IconAction icon={Share2} label="Share" onClick={onShare} />
        {variant === "default" && onEdit ? (
          <IconAction icon={Pencil} label="Edit" onClick={onEdit} />
        ) : null}
        <button
          type="button"
          aria-label="More"
          onClick={onMore ?? onCopy}
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-stone-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
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

function ActionChip({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof RefreshCw
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-2.5 py-1.5 text-[12px] font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
      {label}
    </button>
  )
}
