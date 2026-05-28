"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus, Search } from "lucide-react"
import { LibraryCoverFromKb } from "@/components/mind-v2/library-cover"
import { MOCK_KNOWLEDGE_BASES, type KnowledgeBase } from "@/lib/mock-knowledge-bases"
import { WebGradientButton, WebPageCanvas, WebPageHeader } from "@/components/mind-v2/web-app-chrome"
import { cn } from "@/lib/utils"

const filterTabs = ["All", "Notes", "Docs", "Images", "Web Clips", "Projects"] as const

const tagColors: Record<string, string> = {
  Technology: "bg-mind",
  Strategy: "bg-teal-600",
  Design: "bg-fuchsia-600",
  Research: "bg-mind",
  Personal: "bg-amber-600",
}

function tagForKb(kb: KnowledgeBase): string {
  const tags = ["Technology", "Strategy", "Design", "Research", "Personal"]
  return tags[kb.id % tags.length]
}

export function WebLibraryGridPage({
  onOpenLibrary,
}: {
  onOpenLibrary: (kb: KnowledgeBase) => void
}) {
  const [filter, setFilter] = useState<(typeof filterTabs)[number]>("All")
  const [query, setQuery] = useState("")

  const libraries = useMemo(() => {
    let list = MOCK_KNOWLEDGE_BASES.filter((k) => k.category !== "subscribed")
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (k) => k.name.toLowerCase().includes(q) || k.description.toLowerCase().includes(q)
      )
    }
    return list
  }, [query])

  return (
    <WebPageCanvas>
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <WebPageHeader
          title="Libraries"
          subtitle="Open a notebook workspace: sources, chat, AI view, and Studio on one screen"
          actions={
            <WebGradientButton onClick={() => toast.message("New library", { description: "Demo." })}>
              <Plus className="h-2 w-2" strokeWidth={2.25} />
              New library
            </WebGradientButton>
          }
        />

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-white/90 bg-white px-3 py-2.5 shadow-sm">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search libraries…"
              className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-zinc-400"
            />
          </div>
          <div className="flex flex-wrap gap-1 rounded-xl border border-white/90 bg-white/80 p-1 shadow-sm">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                  filter === tab
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-stone-100"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {libraries.map((kb) => {
            const tag = tagForKb(kb)
            return (
              <button
                key={kb.id}
                type="button"
                onClick={() => onOpenLibrary(kb)}
                className="group overflow-hidden rounded-2xl border border-white/90 bg-white text-left shadow-[0_12px_40px_-14px_rgba(15,23,42,0.12)] transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-36 overflow-hidden">
                  <LibraryCoverFromKb
                    kb={kb}
                    className="transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <span
                    className={cn(
                      "absolute bottom-3 left-3 rounded-md px-2 py-1 text-[11px] font-bold text-white shadow-sm",
                      tagColors[tag] ?? "bg-zinc-600"
                    )}
                  >
                    {tag}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-[16px] font-semibold text-zinc-700">{kb.name}</h3>
                  <p className="mt-1 line-clamp-2 text-[13px] text-zinc-500">{kb.description}</p>
                  <p className="mt-3 text-[12px] font-medium tabular-nums text-zinc-400">
                    {kb.count} items · Updated {kb.lastUpdate}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </WebPageCanvas>
  )
}
