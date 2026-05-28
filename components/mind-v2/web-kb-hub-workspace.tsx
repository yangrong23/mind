"use client"

import { useState, type ReactNode } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { WebResizableColumns } from "@/components/mind-v2/web-resizable-columns"
import { WebKbAiViewPanel } from "@/components/mind-v2/web-kb-ai-view"
import { WebKbHubContentList, type WebKbHubListItem } from "@/components/mind-v2/web-kb-detail-chrome"

export type WebKbHubTabId = "content" | "ai"

/** @deprecated Use `ai` — kept for callers still passing `graph`. */
export type WebKbHubTabIdLegacy = WebKbHubTabId | "graph"

const HUB_TABS: { id: WebKbHubTabId; label: string }[] = [
  { id: "content", label: "Materials" },
  { id: "ai", label: "AI view" },
]

export function WebKbHubTabs({
  active,
  onChange,
  className,
}: {
  active: WebKbHubTabId
  onChange: (tab: WebKbHubTabId) => void
  className?: string
}) {
  return (
    <div
      className={cn("shrink-0 border-b border-stone-100/90 px-8", className)}
      role="tablist"
      aria-label="Library workspace"
    >
      <div className="flex gap-1">
        {HUB_TABS.map((tab) => {
          const selected = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative px-4 pb-3 pt-3 text-[14px] font-semibold transition-colors",
                selected ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {tab.label}
              {selected ? (
                <span
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-mind"
                  aria-hidden
                />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function WebKbAiViewSidePanel({
  libraryName,
  sourceCount,
  description,
  expanded = false,
}: {
  libraryName: string
  sourceCount: number
  description?: string
  expanded?: boolean
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-stone-50/40">
      <WebKbAiViewPanel
        libraryName={libraryName}
        sourceCount={sourceCount}
        description={description}
        expanded={expanded}
        className="min-h-0 flex-1"
        onExpand={() =>
          toast.message("AI view", {
            description: "Full-screen AI view will open here (demo).",
          })
        }
      />
    </div>
  )
}

export function WebKbHubWorkspace({
  libraryName,
  libraryDescription,
  items,
  itemCount,
  contentSlot,
  onOpenItem,
  onOpenWorkspace,
}: {
  libraryName: string
  libraryDescription?: string
  items: WebKbHubListItem[]
  itemCount: number
  contentSlot: ReactNode
  onOpenItem: (item: WebKbHubListItem) => void
  onOpenWorkspace: (opts?: { tab?: "ai" | "graph" | "factory" }) => void
}) {
  const [hubTab, setHubTab] = useState<WebKbHubTabId>("content")

  const contentList =
    items.length > 0 ? (
      <WebKbHubContentList
        items={items}
        onOpenItem={onOpenItem}
        className="!px-4 !pb-6 sm:!px-5"
      />
    ) : (
      contentSlot
    )

  return (
    <>
      <WebKbHubTabs active={hubTab} onChange={setHubTab} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {hubTab === "content" ? (
          <WebResizableColumns defaultSizes={[58, 42]} minPx={[280, 260]} className="min-h-0 flex-1">
            <div className="flex min-h-0 flex-col overflow-hidden bg-white">
              <div className="flex shrink-0 items-baseline justify-between gap-3 border-b border-stone-100/80 px-5 py-2.5">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-zinc-400">
                  Materials
                </h2>
                <span className="text-[12px] tabular-nums text-zinc-400">
                  {itemCount} item{itemCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">{contentList}</div>
            </div>
            <WebKbAiViewSidePanel
              libraryName={libraryName}
              sourceCount={itemCount}
              description={libraryDescription}
            />
          </WebResizableColumns>
        ) : (
          <WebResizableColumns defaultSizes={[32, 68]} minPx={[240, 360]} className="min-h-0 flex-1">
            <div className="flex min-h-0 flex-col overflow-hidden bg-white">
              <div className="shrink-0 border-b border-stone-100/80 px-4 py-2.5">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-zinc-400">
                  Sources
                </h2>
                <p className="mt-0.5 text-[11px] text-zinc-500">Linked in AI view</p>
              </div>
              <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="px-4 py-10 text-center text-[13px] text-zinc-500">No content yet</p>
                ) : (
                  <ul className="divide-y divide-stone-50">
                    {items.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onOpenItem(item)}
                          className="flex w-full flex-col gap-0.5 px-4 py-3 text-left hover:bg-stone-50/80"
                        >
                          <span className="line-clamp-2 text-[13px] font-medium text-zinc-700">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-zinc-400">{item.source}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <WebKbAiViewSidePanel
              libraryName={libraryName}
              sourceCount={itemCount}
              description={libraryDescription}
              expanded
            />
          </WebResizableColumns>
        )}
      </div>

      <p className="shrink-0 border-t border-stone-100/80 px-8 py-2 text-center text-[11px] text-zinc-400">
        Studio and content factory live in{" "}
        <button
          type="button"
          onClick={() => onOpenWorkspace({ tab: "factory" })}
          className="font-semibold text-mind hover:underline"
        >
          Open workspace
        </button>
      </p>
    </>
  )
}
