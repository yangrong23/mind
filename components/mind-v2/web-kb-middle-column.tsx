"use client"

import { Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { WebPanelHeader } from "@/components/mind-v2/knowledge-detail-web-shell"
import { HubItemThumb } from "@/components/mind-v2/mind-media-art"
import { hubItemKindFromLabel } from "@/lib/product-media"
import { bodyForLibraryDocument } from "@/lib/library-document-body"
import { WebKbAiViewPanel } from "@/components/mind-v2/web-kb-ai-view"
import type { WebKbCenterSurface } from "@/components/mind-v2/web-kb-ai-view"

export type WebKbMiddleDoc = {
  id: number
  title: string
  source: string
  author: string
  date: string
  excerpt?: string
}

/** Center column — article reader or full AI view; share in header. */
export function WebKbMiddleColumn({
  libraryName,
  sourceCount,
  description,
  surface,
  activeDoc,
  onShare,
}: {
  libraryName: string
  sourceCount: number
  description?: string
  surface: WebKbCenterSurface | "doc" | "empty"
  activeDoc: WebKbMiddleDoc | null
  onShare: () => void
}) {
  const showDoc = surface === "doc" && activeDoc != null
  const showAi = surface === "ai"
  const title = showDoc ? activeDoc!.title : showAi ? "AI view" : libraryName
  const body =
    showDoc && activeDoc
      ? bodyForLibraryDocument(activeDoc.id, activeDoc.title, activeDoc.excerpt ?? "")
      : []

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <WebPanelHeader
        title={title}
        className="border-b border-black/[0.05]"
        trailing={
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-zinc-600 transition-colors hover:bg-white/80 hover:text-zinc-900"
            aria-label="Share"
          >
            <Share2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Share
          </button>
        }
      />

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
        {showAi ? (
          <WebKbAiViewPanel
            libraryName={libraryName}
            sourceCount={sourceCount}
            description={description}
            expanded
            className="!px-4 !py-5"
          />
        ) : showDoc && activeDoc ? (
          <div className="px-6 py-8 sm:px-10">
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 flex h-40 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-stone-50 to-white ring-1 ring-black/[0.04]">
                <HubItemThumb
                  kind={hubItemKindFromLabel(activeDoc.source, activeDoc.title)}
                  size="lg"
                  className="h-20 w-20"
                />
              </div>
              <h2 className="text-[26px] font-semibold tracking-tight text-zinc-800 sm:text-[28px]">
                {activeDoc.title}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-zinc-500">
                <span className="font-medium text-zinc-600">{activeDoc.source}</span>
                <span aria-hidden>·</span>
                <span>{activeDoc.author}</span>
                <span aria-hidden>·</span>
                <span>{activeDoc.date}</span>
              </div>
              <div className="mt-8 space-y-5 text-[16px] leading-[1.75] text-zinc-700">
                {body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="text-[15px] font-medium text-zinc-700">Select a source to read</p>
            <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-zinc-500">
              Choose a file on the left, or open <strong className="font-semibold text-zinc-600">AI view</strong>{" "}
              for topics and connections across this library.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
