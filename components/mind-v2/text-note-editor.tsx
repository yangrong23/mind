"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { NoteEditorBottomBar } from "@/components/mind-v2/note-editor-bottom-bar"
import { NoteAiChatOverlay } from "@/components/mind-v2/note-ai-assist"
import { NoteShareLibrarySheet, type NoteSaveToLibraryOptions } from "@/components/mind-v2/note-share-library-sheet"
import { MindChatComposer } from "@/components/mind-v2/mind-chat-composer"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"
import { SocialShareRow } from "@/components/mind-v2/social-share-row"
import type { Note } from "@/lib/note-types"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import type { NoteChatLaunchContext } from "@/lib/note-chat-context"
import {
  Bold,
  Camera,
  ChevronLeft,
  FolderInput,
  FolderOpen,
  Image as ImageIcon,
  Italic,
  Lightbulb,
  Mic,
  MoreHorizontal,
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
  onSaveToLibrary?: (kb: KnowledgeBase, options: NoteSaveToLibraryOptions) => void
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

function stripHtmlPreview(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
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
  onSaveToLibrary,
}: TextNoteEditorProps) {
  const [mode, setMode] = useState<"view" | "edit">("view")
  const [title, setTitle] = useState(note?.title || "")
  const [viewHtml, setViewHtml] = useState(note?.html?.trim() || "")
  const editorRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [editorFocused, setEditorFocused] = useState(false)
  const [bodyEmpty, setBodyEmpty] = useState(true)
  const [showInsertSheet, setShowInsertSheet] = useState(false)
  const [showFormatBar, setShowFormatBar] = useState(false)
  const [showShareSheet, setShowShareSheet] = useState(false)
  const [showSocialShareSheet, setShowSocialShareSheet] = useState(false)
  const [removeFromMemosOnSave, setRemoveFromMemosOnSave] = useState(true)
  const [showAgentChat, setShowAgentChat] = useState(false)
  const [showAiWrite, setShowAiWrite] = useState(false)
  const [aiWritePrompt, setAiWritePrompt] = useState("")
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>()

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
    setViewHtml(initial)
    setBodyEmpty(htmlBodyIsEmpty(initial))
  }, [note?.id, note?.html, note?.title])

  const readHtml = useCallback(() => {
    if (mode === "edit" && editorRef.current) {
      return editorRef.current.innerHTML?.trim() || viewHtml || "<p></p>"
    }
    return viewHtml || "<p></p>"
  }, [mode, viewHtml])

  const focusEditor = () => {
    editorRef.current?.focus()
  }

  const syncBodyEmpty = useCallback(() => {
    const html = editorRef.current?.innerHTML?.trim() || "<p></p>"
    setBodyEmpty(htmlBodyIsEmpty(html))
    setViewHtml(html)
  }, [])

  const readDraft = useCallback(() => {
    const html = readHtml()
    return { title: title.trim(), html }
  }, [readHtml, title])

  const persistDraft = useCallback(() => {
    const draft = readDraft()
    setViewHtml(draft.html)
    return draft
  }, [readDraft])

  const buildChatContext = useCallback(
    (initialPrompt?: string): NoteChatLaunchContext => {
      const { title: t, html } = readDraft()
      const preview = stripHtmlPreview(html)
      const returnNote: Note =
        draftReturnNote ??
        ({
          id: note?.id ?? 0,
          title: t || "Untitled note",
          type: "text",
          date: "Just now",
          preview,
          bodyHtml: html,
          status: "analyzed",
          source: "Rich text",
        } as Note)
      return {
        returnNote,
        noteId: note?.id ?? returnNote.id,
        noteTitle: t || "Untitled note",
        notePreview: preview,
        noteType: "text",
        initialPrompt,
      }
    },
    [draftReturnNote, note?.id, readDraft]
  )

  const openAgentChat = useCallback(
    (initialPrompt?: string) => {
      const run = () => {
        setChatInitialPrompt(initialPrompt)
        setShowAgentChat(true)
        setShowAiWrite(false)
      }
      if (requireAuthThen) requireAuthThen(run)
      else run()
    },
    [requireAuthThen]
  )

  const exitEditor = useCallback(() => {
    const { title: t, html } = persistDraft()
    const hasContent = t.length > 0 || !htmlBodyIsEmpty(html)
    if (onSave && hasContent) {
      onSave({ title: t, html })
    }
    onBack()
  }, [onBack, onSave, persistDraft])

  const handleHeaderBack = useCallback(() => {
    if (mode === "edit") {
      persistDraft()
      setShowAiWrite(false)
      setShowFormatBar(false)
      setMode("view")
      return
    }
    exitEditor()
  }, [exitEditor, mode, persistDraft])

  const enterEditMode = useCallback((focusTarget: "title" | "body" = "body") => {
    setMode("edit")
    window.requestAnimationFrame(() => {
      if (focusTarget === "title") titleInputRef.current?.focus()
      else focusEditor()
    })
  }, [])

  const dismissKeyboard = useCallback(() => {
    ;(document.activeElement as HTMLElement | null)?.blur?.()
    setEditorFocused(false)
    setShowAiWrite(false)
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

  const handleAiWriteSubmit = () => {
    const q = aiWritePrompt.trim()
    if (!q) return
    setAiWritePrompt("")
    openAgentChat(q)
  }

  const displayTitle = title.trim() || "Untitled note"
  const viewBodyEmpty = htmlBodyIsEmpty(viewHtml)
  const bodyPreview = stripHtmlPreview(viewHtml)

  const openSocialShare = useCallback(() => {
    persistDraft()
    setShowSocialShareSheet(true)
  }, [persistDraft])

  const openMoveToLibrary = useCallback(() => {
    const run = () => {
      persistDraft()
      const draft = readDraft()
      if (!draft.title && htmlBodyIsEmpty(draft.html)) {
        toast.message("Add content first", {
          description: "Write something in your note before saving to a library.",
        })
        return
      }
      setShowShareSheet(true)
    }
    if (requireAuthThen) requireAuthThen(run)
    else run()
  }, [persistDraft, readDraft, requireAuthThen])

  useEffect(() => {
    setRemoveFromMemosOnSave(true)
  }, [note?.id])

  return (
    <div className="relative flex h-full flex-col bg-white dark:bg-zinc-950">
      {mode === "view" ? (
        <div className="flex shrink-0 items-center justify-between px-3 py-2.5">
          <button
            type="button"
            onClick={handleHeaderBack}
            className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-zinc-800"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6 text-zinc-800 dark:text-zinc-200" strokeWidth={2} />
          </button>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => openAgentChat()}
              className="flex h-10 items-center justify-center rounded-full px-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800"
              aria-label="Open Mindar assistant"
            >
              <MindarLogo variant="inline" className="!h-7 !max-w-[88px]" priority />
            </button>
            <button
              type="button"
              onClick={openMoveToLibrary}
              className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-zinc-800"
              aria-label="Move to library"
            >
              <FolderInput className="h-5 w-5 text-zinc-600 dark:text-zinc-400" strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              onClick={openSocialShare}
              className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-zinc-800"
              aria-label="Share to social channels"
            >
              <MoreHorizontal className="h-5 w-5 text-zinc-600 dark:text-zinc-400" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex shrink-0 items-center justify-between px-3 py-2.5">
          <button
            type="button"
            onClick={handleHeaderBack}
            className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-zinc-800"
            aria-label="Back to view"
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
              <Undo2 className="h-5 w-5 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
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
              <Redo2 className="h-5 w-5 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {mode === "view" ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-6 pt-1">
          <button
            type="button"
            onClick={() => enterEditMode("title")}
            className="w-full text-left"
            aria-label="Edit title"
          >
            <h1
              className={cn(
                "text-[26px] font-semibold leading-tight tracking-tight",
                title.trim() ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-300 dark:text-zinc-600"
              )}
            >
              {title.trim() || "Add a title"}
            </h1>
          </button>
          <button
            type="button"
            onClick={() => enterEditMode("body")}
            className="mt-4 w-full flex-1 text-left"
            aria-label="Edit note"
          >
            {viewBodyEmpty ? (
              <p className="text-[17px] leading-relaxed text-zinc-300 dark:text-zinc-600">Start writing</p>
            ) : (
              <div
                className={cn(
                  "text-[17px] leading-[1.75] text-zinc-900 dark:text-zinc-100",
                  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
                  "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
                  "[&_p]:min-h-[1.4em]"
                )}
                dangerouslySetInnerHTML={{ __html: viewHtml }}
              />
            )}
          </button>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-2 pt-1">
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a title"
            className="w-full border-0 bg-transparent text-[26px] font-semibold text-zinc-900 placeholder:font-semibold placeholder:text-zinc-300 focus:outline-none focus:ring-0 dark:text-zinc-50 dark:placeholder:text-zinc-600"
          />
          <div className="relative mt-4 min-h-[min(42vh,280px)] flex-1">
            {bodyEmpty && !editorFocused ? (
              <div className="pointer-events-none absolute left-0 top-0 select-none text-[17px] leading-relaxed text-zinc-300 dark:text-zinc-600">
                Start writing
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
      )}

      {mode === "edit" ? (
        <div className="shrink-0 bg-white pb-[max(10px,env(safe-area-inset-bottom))] dark:bg-zinc-950">
          {showAiWrite ? (
            <div className="border-t border-stone-100/90 px-3 pb-2 pt-2 dark:border-zinc-800">
              <MindChatComposer
                value={aiWritePrompt}
                onChange={setAiWritePrompt}
                onSubmit={handleAiWriteSubmit}
                placeholder="@ library or describe what to write"
                variant="thread"
                dockLayout="split"
                showScreenshotButton={false}
                showUploadButton
                showVoiceButton
                showAtButton
                atLabel="Link library"
                onAtClick={() => toast.message("Library", { description: "Pick a library to ground writing (demo)." })}
                onUploadClick={() => toast.message("Attachment", { description: "Coming soon (demo)." })}
                onVoiceToggle={() => toast.message("Voice", { description: "Coming soon (demo)." })}
                ariaLabel="AI help writing"
              />
              <p className="mt-1.5 text-center text-[10px] text-zinc-400">
                AI-generated content is for reference only.
              </p>
            </div>
          ) : null}
          {showFormatBar && !showAiWrite ? (
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
            onAiWrite={() => {
              setShowFormatBar(false)
              setShowAiWrite((v) => !v)
            }}
            aiWriteActive={showAiWrite}
            formatActive={showFormatBar}
            onFormat={() => {
              setShowAiWrite(false)
              setShowFormatBar((v) => !v)
              focusEditor()
            }}
            onList={() => runFormat("insertUnorderedList")}
            onInsert={() => setShowInsertSheet(true)}
            onDismissKeyboard={dismissKeyboard}
          />
        </div>
      ) : null}

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

      {showSocialShareSheet ? (
        <div className="absolute inset-0 z-[55] flex flex-col justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/30"
            aria-label="Close"
            onClick={() => setShowSocialShareSheet(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Share to social"
            className="relative rounded-t-3xl bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4 shadow-[0_-8px_40px_rgba(0,0,0,0.12)] dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-50">Share elsewhere</h2>
              <button
                type="button"
                onClick={() => setShowSocialShareSheet(false)}
                className="rounded-full p-2 text-zinc-500 hover:bg-stone-100 dark:hover:bg-zinc-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <p className="mb-4 truncate text-[13px] text-zinc-500 dark:text-zinc-400">{displayTitle}</p>
            <SocialShareRow
              title={displayTitle}
              body={bodyPreview || displayTitle}
              onAfterAction={() => setShowSocialShareSheet(false)}
            />
          </div>
        </div>
      ) : null}

      <NoteShareLibrarySheet
        open={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        noteTitle={displayTitle}
        notePreview={bodyPreview}
        noteId={note?.id}
        presentation="save"
        removeFromMemos={removeFromMemosOnSave}
        onRemoveFromMemosChange={setRemoveFromMemosOnSave}
        onSaveToLibrary={(kb, options) => {
          onSaveToLibrary?.(kb, options)
          if (!onSaveToLibrary) {
            toast.success(`Saved to ${kb.name}`, {
              description: options.removeFromMemos
                ? "Removed from Memos (demo)."
                : "A copy is now in your library (demo).",
            })
          }
        }}
      />

      <NoteAiChatOverlay
        open={showAgentChat}
        variant="text"
        onClose={() => {
          setShowAgentChat(false)
          setChatInitialPrompt(undefined)
        }}
        context={showAgentChat ? buildChatContext(chatInitialPrompt) : null}
        requireAuthThen={requireAuthThen}
      />
    </div>
  )
}
