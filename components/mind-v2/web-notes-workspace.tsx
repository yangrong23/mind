"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavListItem } from "@/components/mind-v2/web-nav-selection"
import { webNavMotion } from "@/components/mind-v2/web-nav-motion"
import { mockNotes } from "@/lib/mock-notes"
import type { Note } from "@/lib/note-types"
import { MindSaveToLibrarySheet } from "@/components/mind-v2/mind-save-to-library-sheet"
import { AgentChat, MINDAR_COPILOT_AGENT } from "@/components/mind-v2/agent-tab"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  BookmarkPlus,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Mic,
  Eraser,
  Highlighter,
  Italic,
  Library,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  Pin,
  Redo2,
  Search,
  Share2,
  Sparkles,
  Strikethrough,
  Type,
  Underline,
  Undo2,
  Wand2,
  X,
} from "lucide-react"
import { KbUploadFileIcon } from "@/components/mind-v2/kb-upload-file-icon"
import {
  WebNotesImportDialog,
  type NotesImportSourceId,
} from "@/components/mind-v2/web-notes-import-dialog"

type NoteGroupId = "today" | "week" | "month" | "older"
const NOTE_GROUPS: { id: NoteGroupId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Past 7 days" },
  { id: "month", label: "Past 30 days" },
  { id: "older", label: "Older" },
]

const WEB_DEMO_NOTE: Note = {
  id: 9001,
  title: "Q2 product note",
  type: "text",
  date: "Today",
  preview:
    "Product depth, technical depth, and how we sharpen judgment—grounded in what we ship and what we learn.",
  bodyHtml: `<p><strong>Product</strong> — Ship grounded Ask and Studio handoffs without leaving library context.</p>
<p><mark style="background-color:#fef08a;padding:0 2px;border-radius:2px">Technical</mark> — RAG pipeline, reranking, and eval harnesses that match production traffic.</p>
<p><strong>Cognition</strong> — Weekly reviews: what changed our mind, what we would bet on next.</p>
<ul><li>Align Q2 roadmap with library-first workflow</li><li>Prototype web notes + AI co-writing</li></ul>`,
  status: "analyzed",
  source: "Notes",
}

/** Web Notes — every item is a rich-text note (no voice/hardware split in this workspace). */
function toWebRichTextNote(note: Note): Note {
  if (note.type === "text" && note.bodyHtml?.trim()) {
    return { ...note, source: "Notes" }
  }
  const text = (note.preview || note.title || "").trim()
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
  return {
    ...note,
    type: "text",
    source: "Notes",
    status: note.status === "recording" ? "analyzed" : note.status,
    bodyHtml: note.bodyHtml?.trim() ? note.bodyHtml : escaped ? `<p>${escaped}</p>` : "<p><br></p>",
    preview: text.length > 96 ? `${text.slice(0, 96)}…` : text,
  }
}

function execFormat(command: "bold" | "italic" | "underline" | "strikeThrough") {
  try {
    document.execCommand(command, false)
  } catch {
    /* noop */
  }
}

function execDoc(cmd: string, value?: string) {
  try {
    document.execCommand(cmd, false, value)
  } catch {
    /* noop */
  }
}

function htmlBodyIsEmpty(html: string) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .trim()
  return text.length === 0
}

function previewFromHtml(html: string) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!text) return ""
  return text.length > 96 ? `${text.slice(0, 96)}…` : text
}

function noteGroupFor(note: Note): NoteGroupId {
  if (note.id === 9001 || note.date.toLowerCase().includes("today")) return "today"
  if (note.date.includes("Yesterday") || note.date.includes("May 12") || note.date.includes("May 6"))
    return "week"
  if (
    note.date.includes("May 5") ||
    note.date.includes("Apr") ||
    note.date.includes("Yesterday")
  )
    return "month"
  return "older"
}

function seedWebNotes(): Note[] {
  const fromMock = mockNotes
    .filter((n) => !n.archived)
    .map(toWebRichTextNote)
  const hasDemo = fromMock.some((n) => n.id === WEB_DEMO_NOTE.id)
  return hasDemo ? fromMock : [WEB_DEMO_NOTE, ...fromMock]
}

function NoteToolbarBtn({
  title,
  onClick,
  active,
  children,
}: {
  title: string
  onClick?: () => void
  active?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={cn(
        "rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-stone-100",
        active && "bg-stone-100 text-zinc-900"
      )}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function NoteToolbarDivider() {
  return <span className="mx-0.5 h-5 w-px shrink-0 bg-stone-200" aria-hidden />
}

function WebNoteShareDialog({
  open,
  onClose,
  title,
}: {
  open: boolean
  onClose: () => void
  title: string
}) {
  if (!open) return null

  const copyLink = async () => {
    const url = `https://mindar.app/notes/demo/${encodeURIComponent(title)}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied")
    } catch {
      toast.message("Copy link", { description: url })
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/35" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        className="relative z-10 w-full max-w-[380px] rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/[0.06]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-semibold text-zinc-800">Share note</h2>
            <p className="mt-1 text-[13px] text-zinc-500 line-clamp-2">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-stone-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={copyLink}
            className="flex w-full items-center gap-3 rounded-xl border border-stone-200/90 px-4 py-3 text-left text-[14px] font-medium text-zinc-700 hover:bg-stone-50"
          >
            <Share2 className="h-4 w-4 text-teal-600" />
            Copy link
          </button>
          <button
            type="button"
            onClick={() => toast.message("Invite collaborators", { description: "Demo — team sharing." })}
            className="flex w-full items-center gap-3 rounded-xl border border-stone-200/90 px-4 py-3 text-left text-[14px] font-medium text-zinc-700 hover:bg-stone-50"
          >
            <ChevronRight className="h-4 w-4 text-zinc-400" />
            Invite to view
          </button>
        </div>
      </div>
    </div>
  )
}

export function WebNotesWorkspace({
  requireAuthThen,
  initialSelectedNoteId,
  onNoteActivated,
}: {
  requireAuthThen?: (run: () => void) => void
  initialSelectedNoteId?: number
  onNoteActivated?: (note: Note) => void
}) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const [notes, setNotes] = useState<Note[]>(seedWebNotes)
  const [selectedId, setSelectedId] = useState<number>(() => initialSelectedNoteId ?? WEB_DEMO_NOTE.id)

  useEffect(() => {
    if (initialSelectedNoteId == null) return
    if (notes.some((n) => n.id === initialSelectedNoteId)) {
      setSelectedId(initialSelectedNoteId)
    }
  }, [initialSelectedNoteId, notes])

  function selectNote(note: Note) {
    setSelectedId(note.id)
    onNoteActivated?.(note)
  }
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [insertOpen, setInsertOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [listCollapsed, setListCollapsed] = useState(false)
  const [listSearchOpen, setListSearchOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [listQuery, setListQuery] = useState("")
  const [pinnedIds, setPinnedIds] = useState<Set<number>>(() => new Set([WEB_DEMO_NOTE.id]))
  const editorRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)
  const insertRef = useRef<HTMLDivElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const SOURCE_LABELS: Record<NotesImportSourceId, string> = {
    markdown: "Markdown files",
    notion: "Notion",
    evernote: "Evernote",
    obsidian: "Obsidian",
    "apple-notes": "Apple Notes",
    "google-keep": "Google Keep",
    onenote: "OneNote",
    roam: "Roam / Logseq",
    bear: "Bear",
    simplenote: "Simplenote",
  }

  const selected = notes.find((n) => n.id === selectedId) ?? notes[0]

  const [title, setTitle] = useState(selected?.title ?? "")
  const [bodyEmpty, setBodyEmpty] = useState(true)

  useEffect(() => {
    if (!selected) return
    setTitle(selected.title)
    const el = editorRef.current
    if (!el) return
    const raw = selected.bodyHtml?.trim() ?? ""
    const initial = raw
      ? raw.includes("<")
        ? raw
        : `<p>${raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`
      : selected.preview
        ? `<p>${selected.preview}</p>`
        : "<p><br></p>"
    el.innerHTML = initial
    setBodyEmpty(htmlBodyIsEmpty(initial))
  }, [selected?.id, selected?.bodyHtml, selected?.preview, selected?.title])

  useEffect(() => {
    if (!moreOpen && !insertOpen) return
    function onDoc(e: MouseEvent) {
      const t = e.target as Node
      if (moreOpen && !moreRef.current?.contains(t)) setMoreOpen(false)
      if (insertOpen && !insertRef.current?.contains(t)) setInsertOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [moreOpen, insertOpen])

  const selectedPinned = selected ? pinnedIds.has(selected.id) : false

  const focusEditor = () => editorRef.current?.focus()

  const filteredNotes = useMemo(() => {
    let list = notes
    const q = listQuery.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.preview.toLowerCase().includes(q) ||
        (n.bodyHtml?.toLowerCase().includes(q) ?? false)
    )
  }, [listQuery, notes])

  const grouped = useMemo(() => {
    const map = new Map<NoteGroupId, Note[]>()
    for (const g of NOTE_GROUPS) map.set(g.id, [])
    for (const note of filteredNotes) {
      map.get(noteGroupFor(note))!.push(note)
    }
    return NOTE_GROUPS.map((g) => ({ ...g, items: map.get(g.id)! })).filter((g) => g.items.length > 0)
  }, [filteredNotes])

  const readHtml = () => editorRef.current?.innerHTML?.trim() || "<p></p>"

  const persistTextNote = useCallback(() => {
    if (!selected) return
    const html = readHtml()
    const preview = previewFromHtml(html)
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selected.id
          ? {
              ...n,
              title: title.trim() || "Untitled note",
              preview,
              bodyHtml: html,
            }
          : n
      )
    )
  }, [selected, title])

  const syncBodyEmpty = useCallback(() => {
    setBodyEmpty(htmlBodyIsEmpty(readHtml()))
  }, [])

  function handleStartRecording() {
    runWithAuth(() => {
      const id = Date.now()
      const note: Note = {
        id,
        title: "New recording",
        type: "hardware",
        date: "Today",
        preview: "Recording in progress…",
        status: "recording",
        source: "Notes",
      }
      setNotes((prev) => [note, ...prev])
      selectNote(note)
      setListCollapsed(false)
      toast.message("Recording", { description: "Voice capture started (demo)." })
    })
  }

  function handleImportFiles(files: FileList) {
    const list = Array.from(files)
    if (list.length === 0) return
    list.forEach((file) => handleImportNote(file))
    if (list.length > 1) {
      toast.success(`Imported ${list.length} notes`)
    }
  }

  function handleImportFromSource(sourceId: NotesImportSourceId) {
    const label = SOURCE_LABELS[sourceId] ?? sourceId
    toast.message(`Import from ${label}`, {
      description:
        "Export from your app, then upload Markdown or .enex here. Full OAuth connectors coming soon (demo).",
    })
    if (sourceId === "markdown") {
      runWithAuth(() => importInputRef.current?.click())
    }
  }

  function handleNewNote() {
    runWithAuth(() => {
      const id = Date.now()
      const note: Note = {
        id,
        title: "Untitled note",
        type: "text",
        date: "Today",
        preview: "",
        bodyHtml: "<p><br></p>",
        status: "analyzed",
        source: "Notes",
      }
      setNotes((prev) => [note, ...prev])
      selectNote(note)
      setAiPanelOpen(false)
      setListCollapsed(false)
      toast.message("New note", { description: "Start writing in the editor." })
    })
  }

  function handleImportNote(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const raw = String(reader.result ?? "").trim()
      if (!raw) {
        toast.error("Import failed", { description: "The file is empty." })
        return
      }
      const baseName = file.name.replace(/\.[^.]+$/, "") || "Imported note"
      const html = raw.includes("<")
        ? raw
        : `<p>${raw
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n\n+/g, "</p><p>")
            .replace(/\n/g, "<br>")}</p>`
      const id = Date.now()
      const note: Note = {
        id,
        title: baseName,
        type: "text",
        date: "Today",
        preview: previewFromHtml(html),
        bodyHtml: html,
        status: "analyzed",
        source: "Notes",
      }
      setNotes((prev) => [note, ...prev])
      selectNote(note)
      setListCollapsed(false)
      toast.success("Imported", { description: file.name })
    }
    reader.onerror = () => toast.error("Import failed", { description: "Could not read the file." })
    reader.readAsText(file)
  }

  function toggleSelectedPin() {
    if (!selected) return
    setPinnedIds((prev) => {
      const next = new Set(prev)
      if (next.has(selected.id)) next.delete(selected.id)
      else next.add(selected.id)
      return next
    })
    toast.message(selectedPinned ? "Unpinned" : "Pinned", {
      description: selected.title || "Untitled note",
    })
  }

  function handleArchiveToLibrary(kb: KnowledgeBase) {
    setSaveOpen(false)
    toast.success(`Archived to “${kb.name}”`, {
      description: "Note saved as a Hub document in your library.",
    })
  }

  const charCount = useMemo(() => {
    const html = readHtml()
    return html
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, "")
      .length
  }, [title, bodyEmpty, selected?.id])

  return (
    <div className={cn("flex h-full min-h-0", web.canvas, webNavMotion.contentEnter)}>
      <input
        ref={importInputRef}
        type="file"
        accept=".txt,.md,.markdown,.html,.htm,text/plain,text/markdown,text/html"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ""
          if (file) runWithAuth(() => handleImportNote(file))
        }}
      />

      {/* Notes list */}
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col overflow-hidden border-r border-black/[0.05] bg-white/50 transition-[width] duration-200 ease-out",
          listCollapsed ? "w-0 border-r-0" : "w-[17.5rem]"
        )}
        aria-label="Notes list"
        aria-hidden={listCollapsed}
      >
        <div className="flex items-center gap-1 px-2 pt-3 pb-2">
          <button
            type="button"
            className={cn("rounded-lg p-2 text-zinc-500 hover:bg-white/90", webNavMotion.pressable)}
            aria-label="Collapse notes list"
            onClick={() => setListCollapsed(true)}
          >
            <PanelLeftClose className="h-4 w-4" strokeWidth={2} />
          </button>
          <h1 className="min-w-0 flex-1 text-[15px] font-semibold text-zinc-800">Notes</h1>
          <button
            type="button"
            className={cn(
              "rounded-lg p-2 text-zinc-500 hover:bg-white/90",
              webNavMotion.pressable,
              listSearchOpen && "bg-white/90 text-zinc-800"
            )}
            aria-label="Search notes"
            aria-pressed={listSearchOpen}
            onClick={() => setListSearchOpen((v) => !v)}
          >
            <Search className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="px-3 pb-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleStartRecording}
              className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-stone-200/90 bg-stone-50/60 text-[13px] font-medium text-zinc-700 hover:bg-stone-100/80"
              aria-label="Start recording"
            >
              <Mic className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.85} aria-hidden />
              Record
            </button>
            <button
              type="button"
              onClick={handleNewNote}
              className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-stone-200/90 bg-stone-50/60 text-[13px] font-medium text-zinc-700 hover:bg-stone-100/80"
              aria-label="New note"
            >
              <FileText className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.85} aria-hidden />
              New note
            </button>
          </div>
          <button
            type="button"
            onClick={() => runWithAuth(() => setImportDialogOpen(true))}
            className="mt-2 flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-300/90 bg-white text-[13px] font-semibold text-zinc-700 hover:border-mind/35 hover:bg-mind/[0.04] hover:text-mind"
            aria-label="Import notes"
          >
            <Download className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            Import notes
          </button>
        </div>

        {listSearchOpen ? (
          <div className="px-3 pb-2">
            <input
              type="search"
              value={listQuery}
              onChange={(e) => setListQuery(e.target.value)}
              placeholder="Search notes…"
              className={cn(web.kbInput, "text-[13px]")}
              autoFocus
            />
          </div>
        ) : null}

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          {grouped.map((group) => (
            <div key={group.id} className="mb-3">
              <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((note) => {
                  const active = note.id === selectedId
                  return (
                    <li key={note.id}>
                      <button
                        type="button"
                        onClick={() => {
                          persistTextNote()
                          selectNote(note)
                        }}
                        className={webNavListItem(active, {
                          className: "w-full px-3 py-2.5 text-left",
                        })}
                      >
                        <div className="flex items-center gap-2">
                          <p className="min-w-0 flex-1 truncate text-[14px] font-medium leading-snug">{note.title}</p>
                          {pinnedIds.has(note.id) ? (
                            <span className="shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                              Pinned
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 truncate text-[12px] text-zinc-500">
                          {note.date}
                          {note.preview ? ` · ${note.preview}` : " · No additional text"}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Editor */}
      <div className="relative flex min-w-0 flex-1 flex-col bg-transparent">
        <div className="flex shrink-0 flex-wrap items-center gap-0.5 border-b border-black/[0.04] bg-white/70 px-2 py-1.5 backdrop-blur-sm">
          {listCollapsed ? (
            <NoteToolbarBtn title="Show notes list" onClick={() => setListCollapsed(false)}>
              <PanelLeftOpen className="h-4 w-4" strokeWidth={2} />
            </NoteToolbarBtn>
          ) : null}

          {listCollapsed ? (
            <>
              <NoteToolbarBtn
                title="Search notes"
                active={listSearchOpen}
                onClick={() => {
                  setListCollapsed(false)
                  setListSearchOpen(true)
                }}
              >
                <Search className="h-4 w-4" strokeWidth={2} />
              </NoteToolbarBtn>
              <NoteToolbarDivider />
            </>
          ) : null}

          <NoteToolbarBtn
            title="Undo"
            onClick={() => {
              focusEditor()
              execDoc("undo")
            }}
          >
            <Undo2 className="h-4 w-4" strokeWidth={2} />
          </NoteToolbarBtn>
          <NoteToolbarBtn
            title="Redo"
            onClick={() => {
              focusEditor()
              execDoc("redo")
            }}
          >
            <Redo2 className="h-4 w-4" strokeWidth={2} />
          </NoteToolbarBtn>
          <NoteToolbarBtn title={selectedPinned ? "Unpin note" : "Pin note"} active={selectedPinned} onClick={toggleSelectedPin}>
            <Pin className="h-4 w-4" strokeWidth={2} />
          </NoteToolbarBtn>
          <NoteToolbarBtn
            title="Clear formatting"
            onClick={() => {
              focusEditor()
              execDoc("removeFormat")
              syncBodyEmpty()
            }}
          >
            <Eraser className="h-4 w-4" strokeWidth={2} />
          </NoteToolbarBtn>

          <NoteToolbarDivider />

          <div className="relative" ref={insertRef}>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[13px] font-medium text-zinc-700 hover:bg-stone-100"
              aria-expanded={insertOpen}
              onClick={() => setInsertOpen((v) => !v)}
            >
              <KbUploadFileIcon className="h-3.5 w-3.5" strokeWidth={2} />
              Insert
              <ChevronDown className="h-3 w-3 text-zinc-400" strokeWidth={2.5} />
            </button>
            {insertOpen ? (
              <div
                role="menu"
                className="absolute left-0 top-full z-30 mt-1 min-w-[10.5rem] rounded-xl border border-stone-200/90 bg-white py-1 shadow-lg"
              >
                {(
                  [
                    { label: "Bullet list", run: () => execDoc("insertUnorderedList") },
                    { label: "Numbered list", run: () => execDoc("insertOrderedList") },
                    { label: "Divider", run: () => execDoc("insertHorizontalRule") },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    className="flex w-full px-3 py-2 text-left text-[13px] text-zinc-700 hover:bg-stone-50"
                    onClick={() => {
                      setInsertOpen(false)
                      focusEditor()
                      item.run()
                      syncBodyEmpty()
                    }}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full px-3 py-2 text-left text-[13px] text-zinc-700 hover:bg-stone-50"
                  onClick={() => {
                    setInsertOpen(false)
                    runWithAuth(() => importInputRef.current?.click())
                  }}
                >
                  Import file
                </button>
              </div>
            ) : null}
          </div>

          <NoteToolbarDivider />

          {(
            [
              { cmd: "bold" as const, Icon: Bold, label: "Bold" },
              { cmd: "italic" as const, Icon: Italic, label: "Italic" },
              { cmd: "underline" as const, Icon: Underline, label: "Underline" },
              { cmd: "strikeThrough" as const, Icon: Strikethrough, label: "Strikethrough" },
            ] as const
          ).map(({ cmd, Icon, label }) => (
            <NoteToolbarBtn
              key={cmd}
              title={label}
              onClick={() => {
                focusEditor()
                execFormat(cmd)
                syncBodyEmpty()
              }}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
            </NoteToolbarBtn>
          ))}
          <NoteToolbarBtn
            title="Highlight"
            onClick={() => {
              focusEditor()
              execDoc("hiliteColor", "#fef08a")
              syncBodyEmpty()
            }}
          >
            <Highlighter className="h-4 w-4" strokeWidth={2} />
          </NoteToolbarBtn>
          <NoteToolbarBtn
            title="Text color"
            onClick={() => {
              focusEditor()
              execDoc("foreColor", "#18181b")
              syncBodyEmpty()
            }}
          >
            <Type className="h-4 w-4" strokeWidth={2} />
          </NoteToolbarBtn>

          <label className="sr-only" htmlFor="note-body-style">
            Body style
          </label>
          <select
            id="note-body-style"
            defaultValue="p"
            className="h-8 max-w-[5.5rem] rounded-md border border-stone-200/90 bg-white px-1.5 text-[12px] text-zinc-700"
            onChange={(e) => {
              focusEditor()
              execDoc("formatBlock", e.target.value)
              syncBodyEmpty()
            }}
          >
            <option value="p">Body</option>
            <option value="h2">Heading</option>
            <option value="h3">Subheading</option>
          </select>

          <NoteToolbarBtn
            title="Align left"
            onClick={() => {
              focusEditor()
              execDoc("justifyLeft")
            }}
          >
            <AlignLeft className="h-4 w-4" strokeWidth={2} />
          </NoteToolbarBtn>
          <NoteToolbarBtn
            title="Align center"
            onClick={() => {
              focusEditor()
              execDoc("justifyCenter")
            }}
          >
            <AlignCenter className="h-4 w-4" strokeWidth={2} />
          </NoteToolbarBtn>
          <NoteToolbarBtn
            title="Align right"
            onClick={() => {
              focusEditor()
              execDoc("justifyRight")
            }}
          >
            <AlignRight className="h-4 w-4" strokeWidth={2} />
          </NoteToolbarBtn>

          <div className="ml-auto flex items-center gap-0.5">
            <NoteToolbarBtn
              title="Add to knowledge base"
              onClick={() => runWithAuth(() => setSaveOpen(true))}
            >
              <span className="relative inline-flex">
                <Library className="h-4 w-4" strokeWidth={2} />
                <Sparkles className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 text-mind" strokeWidth={2.5} />
              </span>
            </NoteToolbarBtn>

            <div className="relative" ref={moreRef}>
              <NoteToolbarBtn title="More actions" onClick={() => setMoreOpen((v) => !v)}>
                <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
              </NoteToolbarBtn>
              {moreOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-30 mt-1 min-w-[200px] rounded-xl border border-stone-200/90 bg-white py-1 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-zinc-700 hover:bg-stone-50"
                    onClick={() => {
                      setMoreOpen(false)
                      setShareOpen(true)
                    }}
                  >
                    <Share2 className="h-4 w-4 text-zinc-500" />
                    Share
                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-zinc-400" />
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-zinc-700 hover:bg-stone-50"
                    onClick={() => {
                      setMoreOpen(false)
                      toast.message("Export PDF", { description: "Demo — export queued." })
                    }}
                  >
                    <Download className="h-4 w-4 text-zinc-500" />
                    Export PDF
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-zinc-700 hover:bg-stone-50"
                    onClick={() => {
                      setMoreOpen(false)
                      toast.message("Version history", { description: "Demo — snapshots coming soon." })
                    }}
                  >
                    <Clock className="h-4 w-4 text-zinc-500" />
                    Version history
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-zinc-700 hover:bg-stone-50"
                    onClick={() => {
                      setMoreOpen(false)
                      toggleSelectedPin()
                    }}
                  >
                    <BookmarkPlus className="h-4 w-4 text-zinc-500" />
                    Pin to quick access
                  </button>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => {
                if (aiPanelOpen) setAiPanelOpen(false)
                else runWithAuth(() => setAiPanelOpen(true))
              }}
              className={cn(
                "ml-1 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors",
                aiPanelOpen ? "bg-zinc-900" : "bg-zinc-900 hover:bg-zinc-800"
              )}
            >
              <Wand2 className="h-3.5 w-3.5" strokeWidth={2.25} />
              AI writing
            </button>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1">
          <div className="scrollbar-hide mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto px-10 py-8">
            <>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={persistTextNote}
                placeholder="Untitled note"
                className="w-full border-0 bg-transparent text-[28px] font-semibold text-zinc-800 placeholder:text-zinc-300 focus:outline-none"
              />
              <div className="relative mt-6 min-h-[320px]">
                {bodyEmpty ? (
                  <p className="pointer-events-none absolute left-0 top-0 text-[16px] text-zinc-300">
                    Type here…
                  </p>
                ) : null}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className={cn(
                    "min-h-[320px] w-full text-[16px] leading-[1.75] text-zinc-800 outline-none",
                    "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
                    "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
                    "[&_mark]:rounded-sm [&_p]:min-h-[1.4em]"
                  )}
                  onInput={() => {
                    syncBodyEmpty()
                  }}
                  onBlur={persistTextNote}
                  onPaste={(e) => {
                    e.preventDefault()
                    execDoc("insertText", e.clipboardData.getData("text/plain"))
                    syncBodyEmpty()
                  }}
                />
              </div>
            </>
          </div>

          <aside
            className="pointer-events-none absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 pr-1 lg:block"
            aria-hidden
          >
            <span className="rounded-l-lg bg-stone-100/90 px-1 py-6 text-[11px] font-medium tracking-[0.2em] text-zinc-400 [writing-mode:vertical-rl]">
              Outline
            </span>
          </aside>
        </div>

        <p className="shrink-0 px-6 py-2 text-right text-[12px] tabular-nums text-zinc-400">
          {charCount} characters
        </p>
      </div>

      {/* AI co-writing panel */}
      {aiPanelOpen ? (
        <aside
          className="flex h-full w-[min(26rem,38vw)] shrink-0 flex-col border-l border-stone-200/80 bg-white"
          aria-label="AI writing assistant"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-stone-100 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-teal-700/80">Notes</p>
              <span className="text-[15px] font-semibold text-zinc-800">AI writing</span>
            </div>
            <button
              type="button"
              onClick={() => setAiPanelOpen(false)}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-stone-100"
              aria-label="Close AI panel"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <AgentChat
              embedded
              suppressEmbeddedHeader
              agent={MINDAR_COPILOT_AGENT}
              requireAuthThen={requireAuthThen}
              onBack={() => setAiPanelOpen(false)}
              noteContext={{
                noteTitle: title.trim() || selected?.title || "Note",
                notePreview: previewFromHtml(readHtml()) || selected?.preview,
              }}
            />
          </div>
        </aside>
      ) : null}

      <WebNotesImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImportFiles={(files) => runWithAuth(() => handleImportFiles(files))}
        onImportFromSource={(id) => runWithAuth(() => handleImportFromSource(id))}
      />

      <WebNoteShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={title.trim() || selected?.title || "Note"}
      />

      {saveOpen ? (
        <div className="fixed inset-0 z-[110]">
          <MindSaveToLibrarySheet
            open
            onClose={() => setSaveOpen(false)}
            onSelect={handleArchiveToLibrary}
            title="Add to knowledge base"
            preview={title.trim() || selected?.title}
          />
        </div>
      ) : null}
    </div>
  )
}
