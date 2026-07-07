"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { MindAddFab } from "@/components/mind-v2/mind-add-button"
import { KnowledgeUploadGuide } from "@/components/mind-v2/knowledge-upload-guide"

export type KbMaterialDoc = {
  id: number
  title: string
  excerpt: string
  source: string
  author: string
  date: string
  image: string
}

export function KbMaterialView({
  contents,
  isPublicKb,
  onAddSources,
  emptyUploadHandlers,
  uploadGuideIntent = "default",
  header,
  renderRow,
}: {
  contents: KbMaterialDoc[]
  isPublicKb: boolean
  onAddSources?: () => void
  uploadGuideIntent?: "default" | "onboarding"
  header?: ReactNode
  emptyUploadHandlers?: {
    onFiles: (files: FileList) => void
    onWebsite: () => void
    onYouTube: () => void
    onPodcast: () => void
    onCloudDrive: () => void
    onPasteText: () => void
  }
  renderRow: (content: KbMaterialDoc) => React.ReactNode
}) {
  const isEmpty = contents.length === 0
  const showAddFab = !isEmpty && !isPublicKb && onAddSources

  return (
    <div className={cn("relative flex min-h-0 flex-1 flex-col", mx.pageBg)}>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
        <div className={cn("px-4 pb-2 pt-2", showAddFab ? "pb-20" : "pb-2")}>
          {header}
          {isEmpty ? (
            <div className="pb-6 pt-1">
              {!isPublicKb && emptyUploadHandlers ? (
                <KnowledgeUploadGuide
                  locale="en"
                  itemCount={0}
                  intent={uploadGuideIntent}
                  onFiles={emptyUploadHandlers.onFiles}
                  onWebsite={emptyUploadHandlers.onWebsite}
                  onYouTube={emptyUploadHandlers.onYouTube}
                  onPodcast={emptyUploadHandlers.onPodcast}
                  onCloudDrive={emptyUploadHandlers.onCloudDrive}
                  onPasteText={emptyUploadHandlers.onPasteText}
                  variant="compact"
                />
              ) : (
                <p className="py-10 text-center text-[13px] text-zinc-500">No material in this library yet.</p>
              )}
              <p className="mt-4 text-center text-[12px] leading-relaxed text-zinc-500">
                Links, PDFs, audio, YouTube, and pasted text — same types NotebookLM supports for grounded Q&amp;A.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 overflow-hidden dark:divide-zinc-800">
              {contents.map((content) => renderRow(content))}
            </div>
          )}
        </div>
      </div>

      {showAddFab ? (
        <MindAddFab
          onClick={onAddSources}
          ariaLabel="Add sources"
          variant="fab-dark"
          wrapperClassName="bottom-[max(1.25rem,env(safe-area-inset-bottom))]"
        />
      ) : null}
    </div>
  )
}
