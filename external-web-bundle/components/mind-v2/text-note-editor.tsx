"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { NoteEditorBottomBar, NoteSmartTitleIcon } from "@/components/mind-v2/note-editor-bottom-bar"
import { NoteAiChatOverlay } from "@/components/mind-v2/note-ai-assist"
import type { Note } from "@/lib/note-types"
import type { NoteChatLaunchContext } from "@/lib/note-chat-context"
import {
  Bold,
  Camera,
  ChevronLeft,
  CirclePlus,
  FolderOpen,
  Image as ImageIcon,
  Italic,
  Lightbulb,
  Mic,
  Redo2,
  Underline,
  Undo2,
  X,
} from "lucide-react"
import { toast } from "sonner"

export interface TextNoteEditorProps {
  onBack: () => void
  /** @deprecated Use in-page AI bubble overlay instead */
  onAskSubmit?: (prompt: string, snapshot: { title: string; html: string }) => void
  onSave?: (data: { title: string; html: string }) => void
  note?: {
    id: number
    title: string
    html: string
  }
  /** When editing a brand-new note before first save */
  draftReturnNote?: Note
  variant?: "full" | "hubRich"
  requireAuthThen?: (run: () => void) => void
}

function execFormat(command: "bold" | "italic" | "underline" | "insertUnorderedList" | "insertOrderedList") {
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

const INSERT_OPTIONS = [
  { id: "image", label: "Image", Icon: ImageIcon },
  { id: "camera", label: "Take photo", Icon: Camera },
  { id: "recording", label: "Recording", Icon: Mic },
  { id: "library", label: "My library", Icon: Lightbulb },
  { id: "files", label: "Local files", Icon: FolderOpen },
] as const

export function TextNoteEditor({
  onBack,
  onSave,
  note,
  draftReturnNote,
  requireAuthThen,
}: TextNoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "")
  const editorRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [editorFocused, setEditorFocused] = useState(false)
  const [bodyEmpty, setBodyEmpty] = useState(true)
  const [showInsertSheet, setShowInsertSheet] = useState(false)
  const [showFormatBar, setShowFormatBar] = useState(false)
  const [showAiChat, setShowAiChat] = useState(false)

  const runWithAuth = requireAuthThen ?? ((run: () => void) => run())

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    const raw = note?.html?.trim() ?? ""
    const initial = raw
      ? raw.includes("<")
        ? raw
        : `<p>${raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`
      : "<p><br></p>"
    el.innerHTML = initial
    setBodyEmpty(htmlBodyIsEmpty(initial))
  }, [note?.id, note?.html, note?.title])

  const readHtml = () => editorRef.current?.innerHTML?.trim() || "<p></p>"

  const focusEditor = () => {
    editorRef.current?.focus()
  }

  const syncBodyEmpty = useCallback(() => {
    const html = editorRef.current?.innerHTML?.trim() || "<p></p>"
    setBodyEmpty(htmlBodyIsEmpty(html))
  }, [])

  const handleBack = useCallback(() => {
    const html = readHtml()
    const hasContent = title.trim().length > 0 || !htmlBodyIsEmpty(html)
    if (onSave && hasContent) {
      onSave({ title: title.trim(), html })
    }
    onBack()
  }, [onBack, onSave, title])

  const generateTitleFromBody = useCallback(() => {
    const html = editorRef.current?.innerHTML?.trim() || "<p></p>"
    const text = html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    if (!text) {
      setTitle("Untitled note")
      return
    }
    const max = 36
    const head = text.slice(0, max).trim()
    setTitle(text.length > max ? `${head}…` : head)
  }, [])

  const pickInsert = (id: (typeof INSERT_OPTIONS)[number]["id"]) => {
    setShowInsertSheet(false)
    if (id === "image") {
      imageInputRef.current?.click()
      return
    }
    const label = INSERT_OPTIONS.find((o) => o.id === id)?.label ?? "Insert"
    toast.message(label, { description: "Demo — coming soon." })
  }

  const runFormat = (command: "bold" | "italic" | "underline" | "insertUnorderedList") => {
    focusEditor()
    execFormat(command)
    syncBodyEmpty()
  }

  const noteChatContext: NoteChatLaunchContext | null = draftReturnNote
    ? {
        returnNote: draftReturnNote,
        noteId: draftReturnNote.id,
        noteTitle: title.trim() || draftReturnNote.title,
        notePreview: readHtml().replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 280),
        noteType: draftReturnNote.type,
      }
    : null

  const openSmartWrite = () => {
    runWithAuth(() => {
      if (!noteChatContext) {
        toast.message("Smart writing", { description: "Save the note first to use Mindar assist." })
        return
      }
      setShowAiChat(true)
    })
  }

  return (
    <div className="relative flex h-full flex-col bg-white dark:bg-zinc-950">
      <div className="flex shrink-0 items-center justify-between border-b border-stone-100/90 px-2 py-2.5 dark:border-zinc-800">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-zinc-800"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6 text-zinc-800 dark:text-zinc-200" strokeWidth={2} />
        </button>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-zinc-800"
            aria-label="Undo"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              focusEditor()
              execDoc("undo")
              syncBodyEmpty()
            }}
          >
            <Undo2 className="h-5 w-5 text-zinc-600 dark:text-zinc-400" strokeWidth={2} />
          </button>
          <button
            type="button"
            className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-zinc-800"
            aria-label="Redo"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              focusEditor()
              execDoc("redo")
              syncBodyEmpty()
            }}
          >
            <Redo2 className="h-5 w-5 text-zinc-600 dark:text-zinc-400" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-2 pt-3">
        <div className="flex min-w-0 items-center gap-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            className="min-w-0 flex-1 border-0 bg-transparent text-[22px] font-semibold text-zinc-900 placeholder:font-semibold placeholder:text-zinc-300 focus:outline-none focus:ring-0 dark:text-zinc-50 dark:placeholder:text-zinc-600"
          />
          <button
            type="button"
            title="Generate title"
            aria-label="Generate title from body"
            className="shrink-0 rounded-full p-2 text-zinc-400 transition-colors hover:bg-stone-100 hover:text-mind dark:hover:bg-zinc-800"
            onMouseDown={(e) => e.preventDefault()}
            onClick={generateTitleFromBody}
          >
            <NoteSmartTitleIcon />
          </button>
        </div>
        <div className="relative mt-3 min-h-[min(42vh,280px)] flex-1">
          {bodyEmpty && !editorFocused ? (
            <div className="pointer-events-none absolute left-0 top-0 select-none text-[17px] leading-relaxed text-zinc-300 dark:text-zinc-600">
              Start writing…
            </div>
          ) : null}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className={cn(
              "min-h-[min(42vh,280px)] w-full pb-6 text-[17px] leading-[1.75] text-zinc-900 caret-mind outline-none dark:text-zinc-100",
              "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
              "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
              "[&_p]:min-h-[1.4em]"
            )}
            onInput={syncBodyEmpty}
            onFocus={() => setEditorFocused(true)}
            onBlur={() => {
              setEditorFocused(false)
              syncBodyEmpty()
            }}
            onPaste={(e) => {
              e.preventDefault()
              const t = e.clipboardData.getData("text/plain")
              execDoc("insertText", t)
              syncBodyEmpty()
            }}
          />
        </div>
      </div>

      <div className="shrink-0 bg-white pb-[max(10px,env(safe-area-inset-bottom))] dark:bg-zinc-950">
        {showFormatBar ? (
          <div className="flex items-center justify-center gap-1 border-b border-stone-100/90 px-2 py-1.5 dark:border-zinc-800">
            {(
              [
                { cmd: "bold" as const, Icon: Bold, label: "Bold" },
                { cmd: "italic" as const, Icon: Italic, label: "Italic" },
                { cmd: "underline" as const, Icon: Underline, label: "Underline" },
              ] as const
            ).map(({ cmd, Icon, label }) => (
              <button
                key={cmd}
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                aria-label={label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runFormat(cmd)}
              >
                <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
            ))}
          </div>
        ) : null}
        <NoteEditorBottomBar
          smartActive={showAiChat}
          formatActive={showFormatBar}
          onSmartWrite={openSmartWrite}
          onFormat={() => {
            setShowFormatBar((v) => !v)
            focusEditor()
          }}
          onList={() => runFormat("insertUnorderedList")}
          onInsert={() => setShowInsertSheet(true)}
        />
      </div>

      <NoteAiChatOverlay
        open={showAiChat}
        onClose={() => setShowAiChat(false)}
        context={noteChatContext}
        requireAuthThen={requireAuthThen}
      />

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ""
          if (!file) return
          const url = URL.createObjectURL(file)
          focusEditor()
          execDoc("insertImage", url)
          syncBodyEmpty()
        }}
      />

      {showInsertSheet ? (
        <div className="absolute inset-0 z-[60] flex flex-col justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            aria-label="Close insert menu"
            onClick={() => setShowInsertSheet(false)}
          />
          <div className="relative animate-in slide-in-from-bottom rounded-t-[1.35rem] bg-white px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 duration-300 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-50">Insert</h2>
              <button
                type="button"
                onClick={() => setShowInsertSheet(false)}
                className="rounded-full p-2 text-zinc-500 hover:bg-stone-100 dark:hover:bg-zinc-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-x-3 gap-y-5">
              {INSERT_OPTIONS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => pickInsert(id)}
                  className="flex flex-col items-center gap-2"
                >
                  <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-stone-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    <Icon className="h-6 w-6" strokeWidth={1.65} aria-hidden />
                  </span>
                  <span className="text-center text-[11px] font-medium leading-tight text-zinc-600 dark:text-zinc-400">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
