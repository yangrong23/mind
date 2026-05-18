"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import type { KBCategory } from "@/lib/mock-knowledge-bases"

const GRADIENT_PRESETS: { id: string; label: string; value: string }[] = [
  { id: "mind-bright", label: "Mind · Bright", value: "from-stone-12 to-stone-10" },
  { id: "mind-deep", label: "Mind · Deep", value: "from-stone-12 to-stone-10" },
  { id: "mind-rich", label: "Mind · Rich", value: "from-stone-12 to-stone-10" },
  { id: "mind-even", label: "Mind · Even", value: "from-stone-12 to-stone-10" },
  { id: "mind-soft", label: "Mind · Soft", value: "from-stone-12 to-stone-10" },
  { id: "neutral-stone", label: "Neutral", value: "from-zinc-400/90 to-stone-500/85" },
]

export type CreateLibraryPayload = {
  name: string
  description: string
  color: string
  category: KBCategory
}

export interface CreateLibrarySheetProps {
  open: boolean
  category: "mine" | "team"
  onClose: () => void
  onCreate: (payload: CreateLibraryPayload) => void
}

export function CreateLibrarySheet({ open, category, onClose, onCreate }: CreateLibrarySheetProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState(GRADIENT_PRESETS[0].value)

  useEffect(() => {
    if (!open) {
      setName("")
      setDescription("")
      setColor(GRADIENT_PRESETS[0].value)
    }
  }, [open])

  if (!open) return null

  const canSubmit = name.trim().length > 0
  const title = category === "team" ? "New team library" : "New library"
  const subtitle =
    category === "team"
      ? "Shared with teammates — you can invite members after creation."
      : "Private to you — add notes, uploads, and Studio outputs anytime."

  const submit = () => {
    if (!canSubmit) return
    onCreate({
      name: name.trim(),
      description: description.trim() || (category === "team" ? "Team knowledge base" : "Personal knowledge base"),
      color,
      category,
    })
    onClose()
  }

  return (
    <div className="absolute inset-0 z-[55]">
      <button type="button" className="absolute inset-0 bg-zinc-900/35" aria-label="Close" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 flex max-h-[min(88vh,780px)] flex-col rounded-t-3xl bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom duration-300 dark:bg-zinc-950">
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        </div>
        <div className="flex items-start justify-between border-b border-zinc-100 px-5 pb-4 dark:border-zinc-800">
          <div>
            <h2 className="text-[20px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h2>
            <p className="mt-1 max-w-[280px] text-[13px] leading-snug text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-zinc-500" strokeWidth={2} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-4 border-b border-zinc-100 py-4 dark:border-zinc-800">
            <span className="w-14 shrink-0 text-[15px] text-zinc-900 dark:text-zinc-100">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Required"
              className="min-w-0 flex-1 border-0 bg-transparent py-1 text-[15px] text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
              autoFocus
            />
          </div>

          <div className="flex items-start gap-4 border-b border-zinc-100 py-4 dark:border-zinc-800">
            <span className="w-14 shrink-0 pt-1 text-[15px] text-zinc-900 dark:text-zinc-100">About</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              rows={2}
              className="min-w-0 flex-1 resize-none border-0 bg-transparent py-1 text-[15px] leading-relaxed text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
            />
          </div>

          <div className="border-b border-zinc-100 py-4 dark:border-zinc-800">
            <div className="mb-3 flex items-center gap-4">
              <span className="w-14 shrink-0 text-[15px] text-zinc-900 dark:text-zinc-100">Cover</span>
            </div>
            <div className="flex flex-wrap gap-3 pl-[3.75rem]">
              {GRADIENT_PRESETS.map((sw) => (
                <button
                  key={sw.id}
                  type="button"
                  onClick={() => setColor(sw.value)}
                  className={cn(
                    "h-11 w-11 rounded-xl bg-gradient-to-br shadow-sm ring-2 ring-offset-2 ring-offset-white transition-transform active:scale-95 dark:ring-offset-zinc-950",
                    color === sw.value ? "ring-zinc-900 scale-105 dark:ring-zinc-100" : "ring-transparent hover:ring-zinc-200 dark:hover:ring-zinc-600",
                    sw.value
                  )}
                  aria-label={`Cover ${sw.label}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-100 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 dark:border-zinc-800">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={submit}
            className={cn(
              "w-full rounded-xl py-3.5 text-[16px] font-semibold transition-colors",
              canSubmit
                ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                : "cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
            )}
          >
            Create library
          </button>
        </div>
      </div>
    </div>
  )
}
