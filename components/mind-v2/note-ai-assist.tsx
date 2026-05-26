"use client"

import { cn } from "@/lib/utils"
import { AgentChat, MINDAR_COPILOT_AGENT } from "@/components/mind-v2/agent-tab"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"
import { noteChatEntryHint, type NoteChatLaunchContext } from "@/lib/note-chat-context"

export function NoteAiAssistBubble({
  onClick,
  className,
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "pointer-events-auto absolute right-3 top-1/2 z-40 flex h-[3.25rem] w-[3.25rem] -translate-y-1/2 items-center justify-center rounded-full",
        "bg-white shadow-[0_8px_28px_-6px_rgba(15,23,42,0.18),0_4px_16px_-8px_rgba(56,189,248,0.35)]",
        "ring-1 ring-stone-200/90 transition-transform active:scale-95",
        "dark:bg-zinc-900 dark:ring-zinc-700",
        className
      )}
      aria-label="Ask Mindar about this note"
    >
      <MindarLogo height={28} className="max-w-[4.5rem]" />
    </button>
  )
}

export function NoteAiChatOverlay({
  open,
  onClose,
  context,
  requireAuthThen,
  onNavigateToKnowledge,
}: {
  open: boolean
  onClose: () => void
  context?: NoteChatLaunchContext | null
  requireAuthThen?: (run: () => void) => void
  onNavigateToKnowledge?: () => void
}) {
  if (!open) return null

  return (
    <div className="absolute inset-0 z-[80] flex flex-col bg-white dark:bg-zinc-950">
      <AgentChat
        requireAuthThen={requireAuthThen}
        agent={MINDAR_COPILOT_AGENT}
        onBack={onClose}
        entryHint={context ? noteChatEntryHint(context) : "Ask about this note—grounded on what you captured."}
        noteContext={
          context
            ? { noteTitle: context.noteTitle, notePreview: context.notePreview }
            : undefined
        }
        initialPrompt={context?.initialPrompt}
        onNavigateToKnowledge={onNavigateToKnowledge}
      />
    </div>
  )
}
