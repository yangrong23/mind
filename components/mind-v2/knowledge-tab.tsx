"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { knowledgeBaseIconForTitle } from "@/components/mind-v2/knowledge-base-icon"
import { ChevronRight, Compass, RefreshCw } from "lucide-react"
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"

type KBCategory = "mine" | "team" | "subscribed"

export type KnowledgeBase = {
  id: number
  name: string
  description: string
  category: KBCategory
  count: number
  lastUpdate: string
  icon?: string
  color: string
  subscribers?: number
}

export const MOCK_KNOWLEDGE_BASES: KnowledgeBase[] = [
  { id: 1, name: "Product library", description: "Specs and PRDs", category: "mine", count: 156, lastUpdate: "Just now", color: "from-zinc-400 to-stone-600" },
  { id: 2, name: "Study notes", description: "Personal learning log", category: "mine", count: 89, lastUpdate: "1h ago", color: "from-stone-500 to-zinc-700" },
  { id: 3, name: "Reading list", description: "Book notes and quotes", category: "mine", count: 45, lastUpdate: "Yesterday", color: "from-zinc-500 to-stone-600" },
  { id: 4, name: "Engineering docs", description: "Team playbooks and ADRs", category: "team", count: 234, lastUpdate: "2h ago", color: "from-zinc-500 to-zinc-700" },
  { id: 5, name: "Design system", description: "UI/UX guidelines", category: "team", count: 67, lastUpdate: "3d ago", color: "from-neutral-500 to-zinc-700" },
  { id: 6, name: "AI tools digest", description: "Curated AI tooling", category: "subscribed", count: 1523, lastUpdate: "Today", color: "from-slate-600 to-zinc-800", subscribers: 15000 },
  { id: 7, name: "PM growth", description: "Product craft and cases", category: "subscribed", count: 892, lastUpdate: "Yesterday", color: "from-stone-600 to-zinc-800", subscribers: 8900 },
]

interface KnowledgeTabProps {
  onKBClick: (kb: KnowledgeBase) => void
}

export function KnowledgeTab({ onKBClick }: KnowledgeTabProps) {
  const [activeCategory, setActiveCategory] = useState<KBCategory>("mine")
  const [showDiscover, setShowDiscover] = useState(false)

  const filteredKBs = MOCK_KNOWLEDGE_BASES.filter((kb) => kb.category === activeCategory)

  const categories = [
    { id: "mine" as KBCategory, label: "Mine" },
    { id: "team" as KBCategory, label: "Team" },
    { id: "subscribed" as KBCategory, label: "Following" },
  ]

  if (showDiscover) {
    return <DiscoverPage onBack={() => setShowDiscover(false)} />
  }

  return (
    <div className="relative flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-5 py-3">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Knowledge</h1>
          <button 
            onClick={() => setShowDiscover(true)}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            <Compass className="w-4 h-4" />
            Discover
          </button>
        </div>
      </div>

      <div className="px-5 py-3 border-b border-gray-100 bg-white">
        <div className="grid grid-cols-3 gap-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "text-[15px] font-medium py-2 text-center border-b-2 transition-colors",
                activeCategory === cat.id
                  ? "text-gray-900 border-gray-900"
                  : "text-gray-400 border-transparent"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4">
            <div className="space-y-3">
              {filteredKBs.map((kb) => {
                const KbIcon = knowledgeBaseIconForTitle(kb.name, kb.description)
                return (
                <button
                  key={kb.id}
                  onClick={() => onKBClick(kb)}
                  className="w-full bg-white rounded-2xl p-4 text-left border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
                      kb.color
                    )}>
                      <KbIcon className="w-6 h-6 text-white" strokeWidth={2} aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{kb.name}</h3>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1 mb-2">{kb.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{kb.count} items</span>
                        <span>·</span>
                        <span>Updated {kb.lastUpdate}</span>
                        {kb.subscribers && (
                          <>
                            <span>·</span>
                            <span>{(kb.subscribers / 1000).toFixed(1)}k followers</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
                )
              })}
            </div>

            {activeCategory === "subscribed" && (
              <button 
                onClick={() => setShowDiscover(true)}
                className="w-full mt-4 p-4 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300/80 flex items-center justify-center gap-2 text-zinc-700 hover:bg-stone-100/90 transition-colors"
              >
                <Compass className="w-5 h-5" />
                <span className="font-medium">Find more libraries</span>
              </button>
            )}
          </div>
      </div>
    </div>
  )
}

function DiscoverPage({ onBack }: { onBack: () => void }) {
  const featuredKBs = [
    { id: 1, name: "US equities library", desc: "Markets primer", author: "@Tencent", subscribers: 2015, content: 3681, color: "from-stone-600 to-zinc-800" },
    { id: 2, name: "AI tools digest", desc: "Curated AI tooling", author: "@HardcoreAIGC", subscribers: 15000, content: 315, color: "from-zinc-600 to-zinc-800" },
    { id: 3, name: "PM growth", desc: "Product craft and cases", author: "@PMPlanet", subscribers: 8900, content: 892, color: "from-neutral-600 to-zinc-800" },
  ]

  const categories = ["For you", "Tech", "Education", "Work", "Finance", "Industry", "Health"]

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-5 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="text-gray-600">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Library hub</h1>
        </div>

        <div className="relative mb-4">
          <SmartSearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search libraries"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-900">Featured</span>
            <button className="flex items-center gap-1 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          
          <div className="space-y-3">
            {featuredKBs.map((kb) => {
              const KbIcon = knowledgeBaseIconForTitle(kb.name, kb.desc)
              return (
              <div key={kb.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
                    kb.color
                  )}>
                    <KbIcon className="w-7 h-7 text-white" strokeWidth={2} aria-hidden />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{kb.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1 mb-2">{kb.desc}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{kb.subscribers} followers</span>
                      <span>|</span>
                      <span>{kb.content} items</span>
                      <span>|</span>
                      <span>{kb.author}</span>
                    </div>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {categories.map((cat, i) => (
              <button
                key={cat}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  i === 0 ? "bg-zinc-500 text-white" : "bg-gray-100 text-gray-600"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
