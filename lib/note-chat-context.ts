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
    return "Hi, I'm Mindar — ask me to read your notes, answer questions, or turn ideas into deliverables."
  }
  return "I'll answer from this recording's transcript, summary, and highlights."
}

export function buildNoteChatLaunchContext(
  note: Note,
  initialPrompt?: string
): NoteChatLaunchContext {
  return {
    returnNote: note,
    noteId: note.id,
    noteTitle: note.title,
    notePreview: note.preview,
    noteType: note.type,
    initialPrompt,
  }
}
