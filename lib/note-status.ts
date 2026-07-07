/** Note processing lifecycle (device sync → generate → analyzed). */
export type NoteStatus =
  | "pending"
  | "recording"
  | "transferring"
  | "syncing"
  | "synced"
  | "analyzed"
  | "transferred"

export function isNoteRecording(note: { status: NoteStatus }) {
  return note.status === "recording"
}

export function isNoteTransferring(note: { status: NoteStatus }) {
  return note.status === "transferring"
}

export function isNoteSyncing(note: { status: NoteStatus }) {
  return note.status === "syncing"
}

/** Upload or device transfer still running — list may show a skeleton or status row. */
export function isNoteProcessing(note: { status: NoteStatus }) {
  return note.status === "pending"
}

export function isNoteInDevicePipeline(note: { status: NoteStatus }) {
  return (
    note.status === "pending" ||
    note.status === "transferring" ||
    note.status === "syncing"
  )
}

/** Audio is on device; transcript / summary not generated yet. */
export function isNoteAwaitingGenerate(note: { status: NoteStatus }) {
  return note.status === "synced"
}

export function isNoteContentReady(note: { status: NoteStatus }) {
  return note.status === "analyzed" || note.status === "transferred"
}

export function noteStatusListLabel(status: NoteStatus): string | null {
  switch (status) {
    case "recording":
      return "Recording"
    case "transferring":
      return "Transferring…"
    case "syncing":
      return "Waiting to sync…"
    case "pending":
      return "Syncing…"
    default:
      return null
  }
}

export function noteStatusDetailBanner(status: NoteStatus): string | null {
  switch (status) {
    case "transferring":
      return "Transferring recording from Mindar Recorder to app…"
    case "syncing":
      return "Waiting to sync…"
    case "pending":
      return "Syncing…"
    default:
      return null
  }
}
