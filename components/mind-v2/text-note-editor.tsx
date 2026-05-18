"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { SocialShareRow } from "@/components/mind-v2/social-share-row"
import { MindChatComposer } from "@/components/mind-v2/mind-chat-composer"
import {
  ChevronLeft,
  Undo2,
  Redo2,
  Globe,
  Mic,
  Plus,
  ChevronDown,
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline,
  Wand2,
  ListChecks,
  CirclePlus,
  Keyboard,
  Sparkles,
} from "lucide-react"

export interface TextNoteEditorProps {
  onBack: () => void
  /** Persist title + HTML body; optional—if omitted, only back navigation applies */
  onSave?: (data: { title: string; html: string }) => void
  note?: {
    id: number
    title: string
    /** Stored rich HTML (plain text is wrapped as a single paragraph) */
    html: string
  }
  /**
   * `full` — Notes tab editor with inline formatting + AI strip.
   * `hubRich` — Knowledge Hub “new note”: title + body + bottom toolbar (mobile-style rich text).
   */
  variant?: "full" | "hubRich"
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

export function TextNoteEditor({ onBack, onSave, note, variant = "full" }: TextNoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "")
  const editorRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const hubHeadingCycle = useRef(0)
  const [editorFocused, setEditorFocused] = useState(false)
  const [bodyEmpty, setBodyEmpty] = useState(true)
  const [hubAiHint, setHubAiHint] = useState(false)
  const [showShareSheet, setShowShareSheet] = useState(false)
  const [aiMessage, setAiMessage] = useState("")
  const [selectedAIModel, setSelectedAIModel] = useState("DS Fast")
  const [editorChatMode, setEditorChatMode] = useState<"dialog" | "agent">("dialog")
  const [editorVoiceOn, setEditorVoiceOn] = useState(false)

  const aiModelOptions = ["DS Fast", "DS Pro", "GPT-4", "Claude"] as const

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

  const handleSave = useCallback(() => {
    onSave?.({ title: title.trim(), html: readHtml() })
  }, [onSave, title])

  const focusEditor = () => {
    editorRef.current?.focus()
  }

  const syncBodyEmpty = useCallback(() => {
    const html = editorRef.current?.innerHTML?.trim() || "<p></p>"
    setBodyEmpty(htmlBodyIsEmpty(html))
  }, [])

  const handleHubBack = useCallback(() => {
    const html = readHtml()
    const hasContent = title.trim().length > 0 || !htmlBodyIsEmpty(html)
    if (onSave && hasContent) {
      onSave({ title: title.trim(), html })
    }
    onBack()
  }, [onBack, onSave, title])

  const hubToolbarBtn =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-stone-100 active:bg-stone-200/80"

  if (variant === "hubRich") {
    return (
      <div className="relative flex h-full flex-col bg-white">
        <div className="flex shrink-0 items-center justify-between border-b border-stone-100 px-2 py-2.5">
          <button type="button" onClick={handleHubBack} className="rounded-full p-2 hover:bg-stone-100" aria-label="Back">
            <ChevronLeft className="h-6 w-6 text-zinc-800" strokeWidth={2} />
          </button>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              className="rounded-full p-2 hover:bg-stone-100"
              aria-label="Undo"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                focusEditor()
                execDoc("undo")
                syncBodyEmpty()
              }}
            >
              <Undo2 className="h-5 w-5 text-zinc-600" strokeWidth={2} />
            </button>
            <button
              type="button"
              className="rounded-full p-2 hover:bg-stone-100"
              aria-label="Redo"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                focusEditor()
                execDoc("redo")
                syncBodyEmpty()
              }}
            >
              <Redo2 className="h-5 w-5 text-zinc-600" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-2 pt-3">
          <div className="flex min-w-0 items-center gap-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="min-w-0 flex-1 border-0 bg-transparent text-[20px] font-normal text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0"
            />
            <button
              type="button"
              title="Generate title"
              aria-label="Generate title from body"
              className="shrink-0 rounded-full p-2 text-zinc-400 transition-colors hover:bg-stone-100 hover:text-zinc-600"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
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
              }}
            >
              <Sparkles className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
          <div className="relative mt-4 min-h-[min(50vh,320px)] flex-1">
            {bodyEmpty && !editorFocused ? (
              <div className="pointer-events-none absolute left-0 top-0 select-none text-[17px] leading-relaxed text-zinc-400">
                Start writing
              </div>
            ) : null}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className={cn(
                "min-h-[min(50vh,320px)] w-full pb-8 text-[17px] leading-[1.75] text-zinc-900 caret-sky-600 outline-none",
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

        <div className="shrink-0 border-t border-stone-100 bg-white px-1 pt-1 pb-[max(10px,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-around">
            <button
              type="button"
              className={hubToolbarBtn}
              aria-label="Smart layout"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setHubAiHint(true)
                window.setTimeout(() => setHubAiHint(false), 2200)
              }}
            >
              <Wand2 className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className={hubToolbarBtn}
              aria-label="Heading and body styles"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                focusEditor()
                const order = ["h2", "h3", "p"] as const
                const tag = order[hubHeadingCycle.current % order.length]
                hubHeadingCycle.current += 1
                execDoc("formatBlock", tag)
              }}
            >
              <span className="text-[15px] font-semibold tracking-tight text-zinc-700">Aa</span>
            </button>
            <button
              type="button"
              className={hubToolbarBtn}
              aria-label="List"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                focusEditor()
                execFormat("insertUnorderedList")
                syncBodyEmpty()
              }}
            >
              <ListChecks className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className={hubToolbarBtn}
              aria-label="Insert image"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => imageInputRef.current?.click()}
            >
              <CirclePlus className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className={hubToolbarBtn}
              aria-label="Dismiss keyboard"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                ;(document.activeElement as HTMLElement | null)?.blur()
                setEditorFocused(false)
              }}
            >
              <Keyboard className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

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

        {hubAiHint ? (
          <div className="pointer-events-none absolute bottom-[72px] left-1/2 z-10 max-w-[min(90%,280px)] -translate-x-1/2 rounded-full bg-zinc-900/90 px-4 py-2 text-center text-[12px] text-white shadow-lg">
            AI-assisted layout is coming soon
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button type="button" onClick={onBack} className="shrink-0 p-1" aria-label="Back">
            <ChevronLeft className="h-6 w-6 text-zinc-700" />
          </button>
          {onSave && (
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-zinc-900"
            >
              Save
            </button>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="rounded-full p-2 hover:bg-stone-200"
            aria-label="Undo"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              focusEditor()
              execDoc("undo")
            }}
          >
            <Undo2 className="h-5 w-5 text-zinc-600" />
          </button>
          <button
            type="button"
            className="rounded-full p-2 hover:bg-stone-200"
            aria-label="Redo"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              focusEditor()
              execDoc("redo")
            }}
          >
            <Redo2 className="h-5 w-5 text-zinc-600" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="mb-3 w-full text-2xl font-light text-zinc-500 placeholder:text-zinc-500 focus:text-zinc-900 focus:outline-none"
        />

        <div className="mb-2 flex flex-wrap gap-1 rounded-xl border border-stone-200 bg-stone-100/90 p-1">
          {(
            [
              { cmd: "bold" as const, Icon: Bold, label: "Bold" },
              { cmd: "italic" as const, Icon: Italic, label: "Italic" },
              { cmd: "underline" as const, Icon: Underline, label: "Underline" },
              { cmd: "insertUnorderedList" as const, Icon: List, label: "Bullet list" },
              { cmd: "insertOrderedList" as const, Icon: ListOrdered, label: "Numbered list" },
            ] as const
          ).map(({ cmd, Icon, label }) => (
            <button
              key={cmd}
              type="button"
              title={label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                focusEditor()
                execFormat(cmd)
              }}
              className="rounded-lg p-2 text-zinc-700 hover:bg-white hover:text-zinc-900"
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
            </button>
          ))}
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className={cn(
            "min-h-[200px] w-full rounded-xl border border-stone-200 bg-white px-3 py-3 text-[17px] leading-relaxed text-zinc-900",
            "outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100",
            "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
            "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
            "[&_p]:min-h-[1.4em]"
          )}
          onPaste={(e) => {
            e.preventDefault()
            const t = e.clipboardData.getData("text/plain")
            document.execCommand("insertText", false, t)
          }}
        />
      </div>

      {/* Bottom AI composer */}
      <div className="border-t border-stone-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <MindChatComposer
          variant="thread"
          className="max-w-none"
          value={aiMessage}
          onChange={setAiMessage}
          onSubmit={() => {
            const q = aiMessage.trim()
            if (!q) return
            setAiMessage("")
          }}
          placeholder=""
          chatMode={editorChatMode}
          onChatModeChange={setEditorChatMode}
          modelLabel={selectedAIModel}
          onModelLabelChange={setSelectedAIModel}
          modelOptions={aiModelOptions}
          voiceOn={editorVoiceOn}
          onVoiceToggle={() => setEditorVoiceOn((prev) => !prev)}
          onUploadClick={() => setShowShareSheet(true)}
        />
      </div>

      {showShareSheet && (
        <div className="absolute inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowShareSheet(false)} />
          <div className="absolute bottom-0 left-0 right-0 animate-in slide-in-from-bottom rounded-t-3xl bg-white duration-300">
            <div className="flex justify-center pb-2 pt-3">
              <div className="h-1 w-10 rounded-full bg-stone-400" />
            </div>

            <div className="px-5 py-4">
              <div className="flex items-center gap-3 rounded-xl bg-stone-100 p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">
                  <svg className="h-6 w-6 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </div>
                <p className="line-clamp-2 flex-1 text-sm text-zinc-700">
                  {readHtml().replace(/<[^>]+>/g, " ").trim() || "Capture your thoughts…"}
                </p>
              </div>
            </div>

            <div className="px-5 pb-2">
              <SocialShareRow title={title.trim() || "Note"} body={readHtml().replace(/<[^>]+>/g, " ").trim() || "…"} />
            </div>

            <div className="px-5 pb-4">
              <p className="mb-2 text-xs text-zinc-500">Export</p>
              <div className="flex gap-4 overflow-x-auto pb-2">
                <button type="button" className="flex min-w-[64px] flex-col items-center gap-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-200">
                    <svg className="h-6 w-6 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                  <span className="text-xs text-zinc-700">Long image</span>
                </button>
                <button type="button" className="flex min-w-[64px] flex-col items-center gap-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-200">
                    <svg className="h-6 w-6 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                  </div>
                  <span className="text-xs text-zinc-700">Export PDF</span>
                </button>
              </div>
            </div>

            <div className="px-5 pb-6">
              <h4 className="mb-3 text-sm text-zinc-500">Add to library</h4>
              <div className="space-y-1">
                <div className="px-1 pb-1 text-xs text-zinc-500">Personal</div>
                <button type="button" className="flex w-full items-center gap-3 rounded-xl border-t border-stone-200 px-4 py-3 hover:bg-stone-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200">
                    <svg className="h-4 w-4 text-zinc-700" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <span className="text-[15px] text-zinc-900">My library</span>
                </button>

                <div className="px-1 pb-1 pt-3 text-xs text-zinc-500">Shared</div>
                <button type="button" className="flex w-full items-center gap-3 rounded-xl border-t border-stone-200 px-4 py-3 hover:bg-stone-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100">
                    <span className="text-sm font-bold text-zinc-700">M</span>
                  </div>
                  <span className="text-[15px] text-zinc-900">Mind knowledge hub</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
