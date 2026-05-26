"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavListItem } from "@/components/mind-v2/web-nav-selection"
import { webNavMotion } from "@/components/mind-v2/web-nav-motion"
import { mockNotes } from "@/lib/mock-notes"
import type { Note } from "@/lib/note-types"
import { MindSaveToLibrarySheet } from "@/components/mind-v2/mind-save-to-library-sheet"
import { AgentChat, MINDAR_COPILOT_AGENT } from "@/components/mind-v2/agent-tab"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import {
  Bold,
  BookmarkPlus,
  ChevronRight,
  Clock,
  Download,
  Eraser,
  Italic,
  Library,
  MoreHorizontal,
  PanelRightClose,
  Plus,
  Redo2,
  Search,
  Share2,
  Strikethrough,
  Underline,
  Undo2,
  Wand2,
  X,
} from "lucide-react"

type NoteGroupId = "today" | "week" | "month" | "older"
type MemoFilter = "all" | "pinned" | "drafts" | "rich"

const MEMO_FILTERS: { id: MemoFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pinned", label: "Pinned" },
  { id: "drafts", label: "Drafts" },
  { id: "rich", label: "Rich text" },
]

const NOTE_GROUPS: { id: NoteGroupId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Past 7 days" },
  { id: "month", label: "Past 30 days" },
  { id: "older", label: "Older" },
]

const WEB_DEMO_NOTE: Note = {
  id: 9001,
  title: "Q2 product memo",
  type: "text",
  date: "Today",
  preview:
    "Product depth, technical depth, and how we sharpen judgment—grounded in what we ship and what we learn.",
  bodyHtml: `<p><strong>Product</strong> — Ship grounded Ask and Studio handoffs without leaving library context.</p>
<p><mark style="background-color:#fef08a;padding:0 2px;border-radius:2px">Technical</mark> — RAG pipeline, reranking, and eval harnesses that match production traffic.</p>
<p><strong>Cognition</strong> — Weekly reviews: what changed our mind, what we would bet on next.</p>
<ul><li>Align Q2 roadmap with library-first workflow</li><li>Prototype web memos + AI co-writing</li></ul>`,
  status: "analyzed",
  source: "Rich text",
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
  const fromMock = mockNotes.filter((n) => !n.archived && n.status !== "recording")
  const hasDemo = fromMock.some((n) => n.id === WEB_DEMO_NOTE.id)
  return hasDemo ? fromMock : [WEB_DEMO_NOTE, ...fromMock]
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
    const url = `https://mindar.app/memos/demo/${encodeURIComponent(title)}`
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
            <h2 className="text-[17px] font-semibold text-zinc-800">Share memo</h2>
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
}: {
  requireAuthThen?: (run: () => void) => void
}) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const [notes, setNotes] = useState<Note[]>(seedWebNotes)
  const [selectedId, setSelectedId] = useState<number>(() => WEB_DEMO_NOTE.id)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [listQuery, setListQuery] = useState("")
  const [memoFilter, setMemoFilter] = useState<MemoFilter>("all")
  const [pinnedIds, setPinnedIds] = useState<Set<number>>(() => new Set([WEB_DEMO_NOTE.id]))
  const editorRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)

  const selected = notes.find((n) => n.id === selectedId) ?? notes[0]
  const isTextNote = selected?.type === "text"

  const [title, setTitle] = useState(selected?.title ?? "")
  const [bodyEmpty, setBodyEmpty] = useState(true)

  useEffect(() => {
    if (!selected) return
    setTitle(selected.title)
    const el = editorRef.current
    if (!el) return
    const raw = selected.type === "text" ? selected.bodyHtml?.trim() ?? "" : ""
    const initial = raw
      ? raw.includes("<")
        ? raw
        : `<p>${raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`
      : selected.preview
        ? `<p>${selected.preview}</p>`
        : "<p><br></p>"
    el.innerHTML = initial
    setBodyEmpty(htmlBodyIsEmpty(initial))
  }, [selected?.id, selected?.bodyHtml, selected?.preview, selected?.title, selected?.type])

  useEffect(() => {
    if (!moreOpen) return
    function onDoc(e: MouseEvent) {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [moreOpen])

  const filteredNotes = useMemo(() => {
    let list = notes
    if (memoFilter === "pinned") {
      list = list.filter((n) => pinnedIds.has(n.id))
    } else if (memoFilter === "drafts") {
      list = list.filter(
        (n) => !n.preview.trim() || n.title.toLowerCase().startsWith("untitled")
      )
    } else if (memoFilter === "rich") {
      list = list.filter((n) => n.type === "text")
    }

    const q = listQuery.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.preview.toLowerCase().includes(q) ||
        (n.bodyHtml?.toLowerCase().includes(q) ?? false)
    )
  }, [listQuery, memoFilter, notes, pinnedIds])

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
    if (!selected || selected.type !== "text") return
    const html = readHtml()
    const preview = previewFromHtml(html)
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selected.id
          ? {
              ...n,
              title: title.trim() || "Untitled memo",
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

  function handleNewNote() {
    runWithAuth(() => {
      const id = Date.now()
      const note: Note = {
        id,
        title: "Untitled memo",
        type: "text",
        date: "Today",
        preview: "",
        bodyHtml: "<p><br></p>",
        status: "analyzed",
        source: "Rich text",
      }
      setNotes((prev) => [note, ...prev])
      setSelectedId(id)
      setAiPanelOpen(false)
      toast.message("New memo", { description: "Start writing in the editor." })
    })
  }

  function handleArchiveToLibrary(kb: KnowledgeBase) {
    setSaveOpen(false)
    toast.success(`Archived to “${kb.name}”`, {
      description: "Memo saved as a Hub document in your library.",
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
      {/* Memos list */}
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col border-r border-white/60 bg-white/45 backdrop-blur-xl",
          web.secondaryWidth
        )}
        aria-label="Memos list"
      >
        <div className="flex items-center justify-between px-4 pt-5 pb-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-teal-700/70">Capture</p>
            <h1 className="text-[20px] font-semibold tracking-tight text-zinc-800">Memos</h1>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              className={cn("rounded-xl p-2 text-zinc-500 hover:bg-white/80", webNavMotion.pressable)}
              aria-label="Search memos"
              onClick={() => toast.message("Search", { description: "Use the filter field below." })}
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={cn(
                "rounded-xl bg-zinc-800 p-2 text-white shadow-sm hover:bg-zinc-700",
                webNavMotion.pressable
              )}
              aria-label="New memo"
              onClick={handleNewNote}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="px-4 pb-2 text-[12px] text-zinc-500">
          {notes.length} memos · {pinnedIds.size} pinned
        </p>

        <div
          className="flex gap-1.5 overflow-x-auto px-3 pb-2 [scrollbar-width:none]"
        >
          {MEMO_FILTERS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setMemoFilter(chip.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-[12px] font-medium transition-all",
                memoFilter === chip.id
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "bg-white/70 text-zinc-600 ring-1 ring-black/[0.04] hover:bg-white"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="px-3 pb-2">
          <input
            type="search"
            value={listQuery}
            onChange={(e) => setListQuery(e.target.value)}
            placeholder="Search memos…"
            className="w-full rounded-xl border-0 bg-white/90 px-3 py-2 text-[13px] text-zinc-700 shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.04] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-200/60"
          />
        </div>

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
                          setSelectedId(note.id)
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
                          {note.type === "text" ? (
                            <span className="shrink-0 rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700">
                              {note.source ?? "Text"}
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">
                              Voice
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[12px] text-zinc-500">
                          {note.date}
                          {note.preview ? ` · ${note.preview}` : ""}
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
      <div className="relative flex min-w-0 flex-1 flex-col bg-white/95 backdrop-blur-sm">
        <div className="flex shrink-0 items-center gap-1 border-b border-stone-100 px-3 py-2">
          <div className="flex items-center gap-0.5">
            {(
              [
                { cmd: "bold" as const, Icon: Bold, label: "Bold" },
                { cmd: "italic" as const, Icon: Italic, label: "Italic" },
                { cmd: "underline" as const, Icon: Underline, label: "Underline" },
                { cmd: "strikeThrough" as const, Icon: Strikethrough, label: "Strikethrough" },
              ] as const
            ).map(({ cmd, Icon, label }) => (
              <button
                key={cmd}
                type="button"
                title={label}
                disabled={!isTextNote}
                className="rounded-lg p-2 text-zinc-600 hover:bg-stone-100 disabled:opacity-40"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editorRef.current?.focus()
                  execFormat(cmd)
                  syncBodyEmpty()
                }}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </button>
            ))}
            <button
              type="button"
              title="Clear formatting"
              disabled={!isTextNote}
              className="rounded-lg p-2 text-zinc-600 hover:bg-stone-100 disabled:opacity-40"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                editorRef.current?.focus()
                execDoc("removeFormat")
                syncBodyEmpty()
              }}
            >
              <Eraser className="h-4 w-4" strokeWidth={2} />
            </button>
            <span className="mx-1 h-5 w-px bg-stone-200" />
            <button
              type="button"
              title="Undo"
              disabled={!isTextNote}
              className="rounded-lg p-2 text-zinc-600 hover:bg-stone-100 disabled:opacity-40"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                editorRef.current?.focus()
                execDoc("undo")
              }}
            >
              <Undo2 className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              title="Redo"
              disabled={!isTextNote}
              className="rounded-lg p-2 text-zinc-600 hover:bg-stone-100 disabled:opacity-40"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                editorRef.current?.focus()
                execDoc("redo")
              }}
            >
              <Redo2 className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-600 hover:bg-stone-100"
                aria-label="More actions"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((v) => !v)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
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
                      toast.success("Added to quick access")
                    }}
                  >
                    <BookmarkPlus className="h-4 w-4 text-zinc-500" />
                    Pin to quick access
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-zinc-700 hover:bg-stone-50"
                    onClick={() => {
                      setMoreOpen(false)
                      runWithAuth(() => setSaveOpen(true))
                    }}
                  >
                    <Library className="h-4 w-4 text-zinc-500" />
                    Archive to library
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
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors",
                aiPanelOpen
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              )}
            >
              <Wand2 className="h-3.5 w-3.5" strokeWidth={2.25} />
              AI writing
            </button>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1">
          <div className="scrollbar-hide mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto px-10 py-8">
            {!isTextNote ? (
              <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/80 px-6 py-10 text-center">
                <p className="text-[15px] font-medium text-zinc-700">{selected?.title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
                  This capture opens on mobile for playback and transcript. Create a text memo to edit on web.
                </p>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={persistTextNote}
                  placeholder="Untitled memo"
                  className="w-full border-0 bg-transparent text-[28px] font-semibold text-zinc-800 placeholder:text-zinc-300 focus:outline-none"
                />
                <div className="relative mt-6 min-h-[320px]">
                  {bodyEmpty ? (
                    <p className="pointer-events-none absolute left-0 top-0 text-[16px] text-zinc-300">
                      Start writing…
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
            )}
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

        <p className="shrink-0 border-t border-stone-100 px-6 py-2 text-right text-[12px] tabular-nums text-zinc-400">
          {charCount} characters
        </p>
      </div>

      {/* AI co-writing panel */}
      {aiPanelOpen ? (
        <aside
          className="flex h-full w-[min(22rem,34vw)] shrink-0 flex-col border-l border-stone-200/80 bg-white"
          aria-label="AI writing assistant"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-stone-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <MindarLogo height={28} />
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
              agent={MINDAR_COPILOT_AGENT}
              requireAuthThen={requireAuthThen}
              onBack={() => setAiPanelOpen(false)}
              entryHint={`Co-write “${title.trim() || selected?.title || "this memo"}”—grounded on your memo.`}
              noteContext={{
                noteTitle: title.trim() || selected?.title || "Memo",
                notePreview: previewFromHtml(readHtml()) || selected?.preview,
              }}
            />
          </div>
        </aside>
      ) : null}

      <WebNoteShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={title.trim() || selected?.title || "Memo"}
      />

      {saveOpen ? (
        <div className="fixed inset-0 z-[110]">
          <MindSaveToLibrarySheet
            open
            onClose={() => setSaveOpen(false)}
            onSelect={handleArchiveToLibrary}
            title="Archive to library"
            preview={title.trim() || selected?.title}
          />
        </div>
      ) : null}
    </div>
  )
}
