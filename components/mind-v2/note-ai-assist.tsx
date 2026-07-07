"use client"

import { cn } from "@/lib/utils"
import { AgentChat, MINDER_COPILOT_AGENT } from "@/components/mind-v2/agent-tab"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"
import { resolveAgentThreadKey } from "@/lib/agent-chat-threads"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
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
      <MindarLogo variant="inline" className="!h-6 !max-w-[72px]" />
    </button>
  )
}

export function NoteAiChatOverlay({
  open,
  onClose,
  context,
  requireAuthThen,
  onNavigateToKnowledge,
  variant = "text",
}: {
  open: boolean
  onClose: () => void
  context?: NoteChatLaunchContext | null
  requireAuthThen?: (run: () => void) => void
  onNavigateToKnowledge?: (factoryKind?: FactoryModalKind) => void
  /** `recording` = bottom sheet over note detail; `text` = full in-editor overlay */
  variant?: "text" | "recording"
}) {
  if (!open || !context) return null

  const threadScope = {
    type: "note" as const,
    noteId: context.noteId,
    noteTitle: context.noteTitle,
  }
  const threadId = resolveAgentThreadKey(threadScope)

  const chat = (
    <AgentChat
      embedded
      showModalClose
      noteChatStyle={variant}
      requireAuthThen={requireAuthThen}
      agent={MINDER_COPILOT_AGENT}
      threadId={threadId}
      threadScope={threadScope}
      onBack={onClose}
      entryHint={noteChatEntryHint(context)}
      noteContext={{
        noteTitle: context.noteTitle,
        notePreview: context.notePreview,
      }}
      initialPrompt={context.initialPrompt}
      onNavigateToKnowledge={onNavigateToKnowledge}
    />
  )

  if (variant === "recording") {
    return (
      <div
        className="absolute inset-0 z-[80] flex flex-col justify-end"
        role="dialog"
        aria-modal="true"
        aria-label="Ask Mindar about this recording"
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200"
          aria-label="Close"
          onClick={onClose}
        />
        <div
          className={cn(
            "relative flex min-h-[52%] max-h-[min(88dvh,720px)] flex-col overflow-hidden",
            "rounded-t-[20px] bg-white shadow-[0_-12px_48px_rgba(15,23,42,0.16)]",
            "animate-in slide-in-from-bottom duration-300 dark:bg-zinc-950 dark:shadow-[0_-12px_48px_rgba(0,0,0,0.45)]"
          )}
        >
          {chat}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "absolute inset-0 z-[80] flex flex-col overflow-hidden bg-white",
        "animate-in slide-in-from-bottom duration-300 dark:bg-zinc-950"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Mindar assistant"
    >
      {chat}
    </div>
  )
}
