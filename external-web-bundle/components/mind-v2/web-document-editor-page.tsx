"use client"

import { toast } from "sonner"
import { ChevronLeft, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const outline = [
  { id: "1", label: "1. Introduction", level: 0 },
  { id: "2", label: "2. Market context", level: 0 },
  { id: "3", label: "3. Product vision", level: 0, active: true },
  { id: "4", label: "3.1 Positioning", level: 1 },
  { id: "5", label: "3.2 Differentiation", level: 1 },
  { id: "6", label: "4. Roadmap", level: 0 },
]

export function WebDocumentEditorPage({
  title = "Product Strategy Doc",
  onBack,
}: {
  title?: string
  onBack: () => void
}) {
  return (
    <div className="flex h-full min-h-0 bg-[#f8f9fc]">
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-stone-200/80 bg-white">
        <div className="border-b border-stone-100 px-4 py-3">
          <button type="button" onClick={onBack} className="flex items-center gap-1 text-[13px] font-medium text-teal-600">
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        </div>
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Outline</p>
          <nav className="mt-2 space-y-0.5">
            {outline.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "block w-full rounded-lg py-1.5 text-left text-[13px]",
                  item.level === 1 && "pl-4",
                  item.active ? "font-semibold text-teal-700 bg-teal-50" : "text-zinc-600 hover:bg-stone-50"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t border-stone-100 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Backlinks</p>
          <p className="mt-2 text-[12px] text-zinc-500">3 notes link here</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <div className="flex shrink-0 items-center gap-2 border-b border-stone-100 px-4 py-2">
          {["B", "I", "H1", "List"].map((t) => (
            <button
              key={t}
              type="button"
              className="rounded-lg px-2.5 py-1 text-[13px] font-medium text-zinc-600 hover:bg-stone-100"
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            className="ml-2 inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2.5 py-1 text-[13px] font-semibold text-violet-700"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI
          </button>
        </div>
        <div className="mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto px-8 pt-10 pb-0">
          <h1 className="text-[28px] font-semibold text-zinc-700">{title}</h1>
          <h2 className="mt-8 text-[20px] font-semibold text-zinc-600">3. Product vision</h2>
          <p className="mt-4 text-[16px] leading-[1.75] text-zinc-700">
            Mindar is your AI-powered second brain: capture on mobile, think on web. Libraries ground every answer;
            Studio turns depth into audio, slides, and reports without leaving context.
          </p>
          <p className="relative mt-4 rounded-lg bg-amber-50/80 px-3 py-2 text-[16px] leading-[1.75] text-zinc-700 ring-2 ring-amber-200/60">
            The north star is zero-friction handoff from sources → dialogue → deliverables.
            <span className="absolute -top-10 left-1/4 flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1 text-[12px] font-medium shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-violet-600" />
              Improve clarity
            </span>
          </p>
        </div>
      </div>

      <aside className="flex w-[280px] shrink-0 flex-col border-l border-stone-200/80 bg-white">
        <div className="border-b border-stone-100 px-4 py-3">
          <p className="text-[13px] font-semibold text-zinc-700">Comments</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 text-[13px] text-zinc-600">
          <p className="rounded-xl bg-stone-50 p-3">@team Can we align this with Q4 OKRs?</p>
        </div>
        <div className="border-t border-stone-100 p-4">
          <p className="text-[13px] font-semibold text-zinc-700">AI suggestions</p>
          <div className="mt-2 rounded-xl border border-violet-100 bg-violet-50/50 p-3 text-[13px] text-zinc-700">
            Add a single sentence that states the decision this section drives.
          </div>
          <button
            type="button"
            onClick={() => toast.success("Applied")}
            className="mt-2 w-full rounded-lg bg-violet-600 py-2 text-[13px] font-semibold text-white"
          >
            Apply
          </button>
        </div>
      </aside>
    </div>
  )
}
