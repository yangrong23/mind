"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { SocialShareRow } from "@/components/mind-v2/social-share-row"
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
}

function execFormat(command: "bold" | "italic" | "underline" | "insertUnorderedList" | "insertOrderedList") {
  try {
    document.execCommand(command, false)
  } catch {
    /* noop */
  }
}

export function TextNoteEditor({ onBack, onSave, note }: TextNoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "")
  const editorRef = useRef<HTMLDivElement>(null)
  const [showShareSheet, setShowShareSheet] = useState(false)
  const [aiMessage, setAiMessage] = useState("")
  const [showAIModelSelect, setShowAIModelSelect] = useState(false)
  const [selectedAIModel, setSelectedAIModel] = useState("DS Fast")

  const aiModels = [
    { id: "ds-fast", name: "DS Fast", desc: "Fastest responses" },
    { id: "ds-pro", name: "DS Pro", desc: "Higher quality" },
    { id: "gpt4", name: "GPT-4", desc: "Strong all-around" },
    { id: "claude", name: "Claude", desc: "Long documents" },
  ]

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
  }, [note?.id, note?.html, note?.title])

  const readHtml = () => editorRef.current?.innerHTML?.trim() || "<p></p>"

  const handleSave = useCallback(() => {
    onSave?.({ title: title.trim(), html: readHtml() })
  }, [onSave, title])

  const focusEditor = () => {
    editorRef.current?.focus()
  }

  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button type="button" onClick={onBack} className="shrink-0 p-1" aria-label="Back">
            <ChevronLeft className="h-6 w-6 text-gray-600" />
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
          <button type="button" className="rounded-full p-2 hover:bg-gray-100" aria-label="Undo">
            <Undo2 className="h-5 w-5 text-gray-400" />
          </button>
          <button type="button" className="rounded-full p-2 hover:bg-gray-100" aria-label="Redo">
            <Redo2 className="h-5 w-5 text-gray-400" />
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
          className="mb-3 w-full text-2xl font-light text-gray-300 placeholder:text-gray-300 focus:text-gray-900 focus:outline-none"
        />

        <div className="mb-2 flex flex-wrap gap-1 rounded-xl border border-gray-100 bg-gray-50/80 p-1">
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
              className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-gray-900"
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
            "min-h-[200px] w-full rounded-xl border border-gray-100 bg-white px-3 py-3 text-[17px] leading-relaxed text-gray-800",
            "outline-none focus:border-gray-200 focus:ring-2 focus:ring-gray-100",
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
      <div className="border-t border-gray-100 bg-white">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            <input
              type="text"
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
              placeholder="Message or hold to speak"
              className="flex-1 bg-transparent text-[15px] placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-4 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAIModelSelect(true)}
              className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5"
            >
              <Globe className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">{selectedAIModel}</span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
            </button>

            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200">
              <span className="text-sm font-medium text-gray-600">@</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200">
              <Mic className="h-5 w-5 text-gray-600" />
            </button>

            <button
              type="button"
              onClick={() => setShowShareSheet(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-900 bg-white"
            >
              <Plus className="h-5 w-5 text-gray-900" />
            </button>
          </div>
        </div>
      </div>

      {showAIModelSelect && (
        <div className="absolute inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAIModelSelect(false)} />
          <div className="absolute bottom-0 left-0 right-0 animate-in slide-in-from-bottom rounded-t-3xl bg-white duration-300">
            <div className="flex justify-center pb-2 pt-3">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>
            <div className="px-5 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Choose AI model</h3>
            </div>
            <div className="space-y-2 px-5 pb-6">
              {aiModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    setSelectedAIModel(model.name)
                    setShowAIModelSelect(false)
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 transition-colors",
                    selectedAIModel === model.name ? "border-gray-900 bg-gray-50" : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{model.name}</div>
                    <div className="text-sm text-gray-500">{model.desc}</div>
                  </div>
                  {selectedAIModel === model.name && (
                    <svg className="h-5 w-5 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showShareSheet && (
        <div className="absolute inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowShareSheet(false)} />
          <div className="absolute bottom-0 left-0 right-0 animate-in slide-in-from-bottom rounded-t-3xl bg-white duration-300">
            <div className="flex justify-center pb-2 pt-3">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>

            <div className="px-5 py-4">
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50">
                  <svg className="h-6 w-6 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </div>
                <p className="line-clamp-2 flex-1 text-sm text-gray-600">
                  {readHtml().replace(/<[^>]+>/g, " ").trim() || "Capture your thoughts…"}
                </p>
              </div>
            </div>

            <div className="px-5 pb-2">
              <SocialShareRow title={title.trim() || "Note"} body={readHtml().replace(/<[^>]+>/g, " ").trim() || "…"} />
            </div>

            <div className="px-5 pb-4">
              <p className="mb-2 text-xs text-gray-400">Export</p>
              <div className="flex gap-4 overflow-x-auto pb-2">
                <button type="button" className="flex min-w-[64px] flex-col items-center gap-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100">
                    <svg className="h-6 w-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">Long image</span>
                </button>
                <button type="button" className="flex min-w-[64px] flex-col items-center gap-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100">
                    <svg className="h-6 w-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">Export PDF</span>
                </button>
              </div>
            </div>

            <div className="px-5 pb-6">
              <h4 className="mb-3 text-sm text-gray-400">Add to library</h4>
              <div className="space-y-1">
                <div className="px-1 pb-1 text-xs text-gray-400">Personal</div>
                <button type="button" className="flex w-full items-center gap-3 rounded-xl border-t border-gray-100 px-4 py-3 hover:bg-gray-50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                    <svg className="h-4 w-4 text-zinc-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <span className="text-[15px] text-gray-900">My library</span>
                </button>

                <div className="px-1 pb-1 pt-3 text-xs text-gray-400">Shared</div>
                <button type="button" className="flex w-full items-center gap-3 rounded-xl border-t border-gray-100 px-4 py-3 hover:bg-gray-50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <span className="text-sm font-bold text-zinc-600">M</span>
                  </div>
                  <span className="text-[15px] text-gray-900">Mind knowledge hub</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
