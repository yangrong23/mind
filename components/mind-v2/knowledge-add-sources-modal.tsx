"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { KnowledgeUploadGuide } from "@/components/mind-v2/knowledge-upload-guide"
import {
  KnowledgeAddSourceMenu,
  type KnowledgeAddSourceAction,
} from "@/components/mind-v2/knowledge-add-source-menu"

export function KnowledgeAddSourcesModal({
  open,
  onClose,
  locale = "en",
  itemCount,
  maxItems = 50,
  onFiles,
  onWebsite,
  onCloudDrive,
  onPasteText,
  onMoreAction,
}: {
  open: boolean
  onClose: () => void
  locale?: "en" | "zh"
  itemCount: number
  maxItems?: number
  onFiles: (files: FileList) => void
  onWebsite: () => void
  onCloudDrive: () => void
  onPasteText: () => void
  onMoreAction?: (action: KnowledgeAddSourceAction) => void
}) {
  const [showMore, setShowMore] = useState(false)

  if (!open) return null

  const title = locale === "zh" ? "添加来源" : "Add sources"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="add-sources-title"
        className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 px-5 pb-2 pt-5 text-center">
          <h2 id="add-sources-title" className="text-[18px] font-semibold text-zinc-800">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-lg p-2 text-zinc-400 hover:bg-stone-100 hover:text-zinc-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          <KnowledgeUploadGuide
            locale={locale}
            itemCount={itemCount}
            maxItems={maxItems}
            onFiles={onFiles}
            onWebsite={onWebsite}
            onCloudDrive={onCloudDrive}
            onPasteText={onPasteText}
          />

          {onMoreAction ? (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className="text-[13px] font-medium text-zinc-500 hover:text-zinc-700"
              >
                {showMore
                  ? locale === "zh"
                    ? "收起更多来源"
                    : "Hide more source types"
                  : locale === "zh"
                    ? "更多来源类型"
                    : "More source types"}
              </button>
              {showMore ? (
                <div className="mt-2 overflow-hidden rounded-xl border border-stone-200/80">
                  <KnowledgeAddSourceMenu
                    variant="panel"
                    locale={locale}
                    onAction={(action) => {
                      onMoreAction(action)
                      onClose()
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
