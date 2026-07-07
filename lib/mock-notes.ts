import type { Note } from "@/lib/note-types"

function formatRecordingListTitle(d = new Date()) {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const h = String(d.getHours()).padStart(2, "0")
  const mi = String(d.getMinutes()).padStart(2, "0")
  const s = String(d.getSeconds()).padStart(2, "0")
  return `${y}-${mo}-${day} ${h}:${mi}:${s}`
}

export function createRecordingNote(id: number, startedAt = new Date()): Note {
  const timeStr = startedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  return {
    id,
    title: formatRecordingListTitle(startedAt),
    type: "hardware",
    date: timeStr,
    listSubtitle: timeStr,
    preview: "",
    status: "recording",
    source: "Mindar Recorder",
  }
}

/** Demo row: in-progress capture visible at top of All files (Plaud-style). */
export const DEMO_ACTIVE_RECORDING_NOTE = createRecordingNote(
  2000,
  new Date(2026, 4, 19, 15, 10, 41)
)

export const mockNotes: Note[] = [
  DEMO_ACTIVE_RECORDING_NOTE,
  {
    id: 100,
    title: "Dream_It_Possible-05-12 15:49:55",
    type: "hardware",
    date: "May 12 · 3:49 PM",
    duration: "3 min",
    preview: "",
    status: "analyzed",
    source: "Mindar Recorder",
    listSubtitle: "Imported",
    processingFailed: true,
  },
  {
    id: 101,
    title: "Dialogue as intelligence: Mind, AI, and the future of human cognition",
    type: "hardware",
    date: "Apr 23 · 4:13 PM",
    duration: "16 min",
    preview: "",
    status: "analyzed",
    source: "Mindar Recorder",
  },
  {
    id: 3,
    title: "Welcome to Mindar",
    type: "hardware",
    date: "Apr 20 · 10:02 AM",
    duration: "3 min",
    preview: "",
    status: "analyzed",
    source: "Mindar Recorder",
    highlightCount: 1,
  },
  {
    id: 4,
    title: "How to use Mindar?",
    type: "hardware",
    date: "Apr 19 · 2:18 PM",
    duration: "4 min",
    preview: "",
    status: "analyzed",
    source: "Mindar Recorder",
    highlightCount: 2,
  },
  {
    id: 102,
    title: "Field memo — product sync",
    type: "hardware",
    date: "May 5 · 9:12 AM",
    duration: "8 min",
    preview: "",
    status: "analyzed",
    source: "Mindar Recorder",
    listSubtitle: "Imported",
    processingFailed: true,
  },
  {
    id: 103,
    title: "2026-05-13 14:49:42",
    type: "hardware",
    date: "May 13 · 2:49 PM",
    duration: "0:54",
    preview: "",
    status: "synced",
    source: "Mindar Recorder",
    listSubtitle: "Imported",
  },
  {
    id: 2,
    title: "User interview notes",
    type: "hardware",
    date: "Today 10:15 AM",
    duration: "45 min",
    preview: "",
    status: "synced",
    source: "Mindar Recorder",
  },
  {
    id: 1,
    title: "Product requirements sync",
    type: "hardware",
    date: "Today 2:32 PM",
    duration: "23 min",
    preview: "Discussed the next release, including knowledge graph visualization…",
    status: "analyzed",
    source: "Mindar Recorder",
    highlightCount: 3,
  },
  {
    id: 5,
    title: "Podcast — AI product design",
    type: "phone",
    date: "Yesterday 4:20 PM",
    duration: "1h 12m",
    preview: "Principles of AI product design and UX tradeoffs…",
    status: "analyzed",
    source: "Phone mic",
    highlightCount: 5,
  },
  {
    id: 6,
    title: "Technical design notes",
    type: "phone",
    date: "Yesterday 11:00 AM",
    duration: "42 min",
    preview: "RAG architecture: vector retrieval and reranking…",
    status: "transferred",
    source: "Phone mic",
  },
  {
    id: 7,
    title: "Customer call recording",
    type: "hardware",
    date: "May 6",
    duration: "18 min",
    preview: "Project timeline and next-phase planning…",
    status: "analyzed",
    source: "Mindar Recorder",
    highlightCount: 1,
  },
  {
    id: 8,
    title: "Workshop takeaways",
    type: "text",
    date: "May 5",
    preview: "Key decisions, owners, and follow-ups from the product workshop…",
    bodyHtml:
      "<p><strong>Decisions</strong></p><ul><li>Ship grounded Ask in Q2</li><li>Graph view stays library-scoped</li></ul>",
    status: "analyzed",
    source: "Rich text",
  },
]
