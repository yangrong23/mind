/** Note processing lifecycle (aligned with device sync + manual generate). */
export type NoteStatus = "pending" | "synced" | "analyzed" | "transferred"

/** Upload or device transfer still running — list may show a skeleton. */
export function isNoteProcessing(note: { status: NoteStatus }) {
  return note.status === "pending"
}

/** Audio is on device; transcript / summary not generated — user taps Generate in detail. */
export function isNoteAwaitingGenerate(note: { status: NoteStatus }) {
  return note.status === "synced"
}

export function isNoteContentReady(note: { status: NoteStatus }) {
  return note.status === "analyzed" || note.status === "transferred"
}
