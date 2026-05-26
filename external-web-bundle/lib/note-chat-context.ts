import type { Note } from "@/lib/note-types"

/** Launch mobile note-grounded AI chat from Note detail or rich-text editor. */
export type NoteChatLaunchContext = {
  /** Note to restore when leaving chat (detail or rich-text editor). */
  returnNote: Note
  noteId: number
  noteTitle: string
  notePreview?: string
  noteType: Note["type"]
  initialPrompt?: string
}

export function noteChatEntryHint(ctx: Pick<NoteChatLaunchContext, "noteTitle" | "noteType">) {
  if (ctx.noteType === "text") {
    return `Answers are grounded on your rich note “${ctx.noteTitle}”.`
  }
  return `Answers are grounded on “${ctx.noteTitle}” — transcript, summary, and highlights from this capture.`
}
