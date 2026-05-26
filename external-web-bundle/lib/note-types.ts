import type { NoteStatus } from "@/lib/note-status"

export type { NoteStatus }

export interface Note {
  id: number
  title: string
  type: "hardware" | "phone" | "text"
  date: string
  duration?: string
  preview: string
  /** Rich HTML body for `type: "text"`; list row uses plain `preview` */
  bodyHtml?: string
  status: NoteStatus
  source?: string
  /** Multimodal badge, e.g. highlight count */
  highlightCount?: number
  /** Local folder; color comes from folder definition */
  folderId?: string | null
  /** Swipe-right archive / save to library (demo: hide from list) */
  archived?: boolean
  /** Optional second line under title (e.g. Imported) */
  listSubtitle?: string
  /** Show failed-processing state on the row */
  processingFailed?: boolean
}
