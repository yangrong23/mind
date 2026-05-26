"use client"

import type { ComponentType, ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { ProductScreenshotScene } from "@/lib/product-media"
import {
  CaptureLibraryPhotoGrid,
  CaptureUploadPhotoPanel,
  HeroContinuePhotoCards,
} from "@/components/mind-landing/landing-photo-cover"
import {
  AiSpeakerChip,
  MiniCitationChips,
  MiniDocThumb,
  MiniSlidesThumb,
  PreviewSideRail,
  SourceListRow,
} from "@/components/mind-landing/landing-realistic-media"

/** Scaled-down faithful UI chrome for marketing (matches /web product). */
export function PreviewChrome({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[14px] border border-white/70 bg-[#f3f4f8] shadow-inner",
        className
      )}
    >
      <div className="flex h-7 items-center gap-1.5 border-b border-stone-200/80 bg-white/95 px-3">
        <span className="size-[7px] rounded-full bg-[#ff5f57]" />
        <span className="size-[7px] rounded-full bg-[#febc2e]" />
        <span className="size-[7px] rounded-full bg-[#28c840]" />
        <span className="ml-1 truncate text-[10px] font-medium text-zinc-500">{title}</span>
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}

function StudioOutputGrid() {
  const items: { label: string; preview: React.ReactNode }[] = [
    { label: "Report", preview: <MiniDocThumb className="h-full w-full" accent="sky" lines={5} /> },
    { label: "Slides", preview: <MiniSlidesThumb className="h-full w-full" /> },
    {
      label: "Quiz",
      preview: (
        <div className="flex h-full flex-col justify-center gap-0.5 p-1">
          <div className="h-1 w-full rounded-full bg-violet-200" />
          {[1, 2].map((n) => (
            <div key={n} className="flex items-center gap-0.5">
              <span className="size-1 rounded-full border border-violet-300" />
              <span className="h-[2px] flex-1 rounded-full bg-violet-100" />
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "Audio",
      preview: (
        <div className="flex h-full items-end justify-center gap-[2px] px-1 pb-1">
          {[3, 5, 4, 7, 5].map((h, i) => (
            <span
              key={i}
              className="w-[2px] rounded-full bg-gradient-to-t from-cyan-500 to-teal-400"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
      ),
    },
  ]
  return (
    <div className="grid grid-cols-2 gap-1">
      {items.map(({ label, preview }) => (
        <div
          key={label}
          className="overflow-hidden rounded-lg border border-stone-100 bg-gradient-to-b from-white to-stone-50/80"
        >
          <div className="aspect-[5/4] border-b border-stone-100/80 bg-white">{preview}</div>
          <p className="py-0.5 text-center text-[7px] font-semibold text-zinc-600">{label}</p>
        </div>
      ))}
    </div>
  )
}

export function PreviewWebDashboard({ className }: { className?: string }) {
  return (
    <PreviewChrome title="Mindar · Dashboard" className={className}>
      <div className="flex min-h-[200px]">
        <PreviewSideRail />
        <div className="min-w-0 flex-1 p-3">
          <p className="text-[13px] font-semibold text-zinc-700">Good afternoon, John</p>
          <p className="mt-1 text-[11px] text-zinc-500">Pick up where you left off</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["New note", "Upload", "Ask Mindar", "Open library"].map((label) => (
              <span
                key={label}
                className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] font-medium text-zinc-600 shadow-sm"
              >
                {label}
              </span>
            ))}
          </div>
          <HeroContinuePhotoCards />
        </div>
      </div>
    </PreviewChrome>
  )
}

export function PreviewWebAgentCopilot({ className }: { className?: string }) {
  return (
    <PreviewChrome title="Mindar · Agent" className={className}>
      <div className="flex min-h-[220px] flex-col items-center bg-white px-4 py-5">
        <p className="text-[14px] font-semibold text-zinc-700">Mindar Copilot</p>
        <div className="mt-4 w-full max-w-[280px] rounded-[18px] border border-zinc-200/80 bg-white px-3 py-2 shadow-sm">
          <p className="text-[9px] text-zinc-400">Ask anything about your libraries…</p>
          <div className="mt-1.5 flex gap-1 overflow-hidden rounded-lg border border-stone-100 bg-stone-50/80 p-1">
            <MiniDocThumb className="h-5 w-4 shrink-0" lines={2} />
            <span className="truncate text-[8px] text-zinc-500">Summarize Q3 roadmap sources</span>
          </div>
          <div className="mt-2 flex justify-end gap-1">
            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[7px] font-medium text-zinc-500">Attach</span>
            <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[7px] font-semibold text-teal-800 ring-1 ring-teal-200/80">Send</span>
          </div>
        </div>
        <div className="mt-3 grid w-full max-w-[280px] grid-cols-3 gap-1.5">
          {[
            { label: "Report", el: <MiniDocThumb className="mx-auto h-8 w-7" lines={4} /> },
            { label: "Audio", el: <MiniDocThumb className="mx-auto h-8 w-7" accent="sky" lines={3} /> },
            { label: "Slides", el: <MiniSlidesThumb className="mx-auto h-8 w-7" /> },
          ].map(({ label, el }) => (
            <div
              key={label}
              className="rounded-xl border border-stone-200/80 bg-white py-2 text-center shadow-sm"
            >
              <div className="flex h-9 items-center justify-center">{el}</div>
              <span className="text-[8px] font-semibold text-zinc-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </PreviewChrome>
  )
}

export function PreviewNotebookWorkspace({ className }: { className?: string }) {
  return (
    <PreviewChrome title="Product library · Workspace" className={className}>
      <div className="flex min-h-[240px] bg-white">
        <div className="w-[26%] border-r border-stone-100 p-2">
          <p className="text-[9px] font-bold uppercase text-zinc-400">Sources</p>
          <div className="mt-1.5 space-y-0.5">
            <SourceListRow title="PRD v2.pdf" kind="pdf" active />
            <SourceListRow title="Research note" kind="doc" />
            <SourceListRow title="Competitor link" kind="link" />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col border-r border-stone-100 p-2">
          <p className="text-[9px] font-bold text-zinc-400">Overview</p>
          <div className="mt-2 flex-1 rounded-lg bg-stone-50 p-2">
            <div className="ml-auto max-w-[85%] rounded-xl rounded-tr-sm bg-zinc-800 px-2 py-1 text-[8px] text-white">
              Summarize key risks
            </div>
            <div className="mt-2 flex gap-1">
              <AiSpeakerChip size="sm" />
              <div className="flex-1 rounded-xl border border-stone-100 bg-white p-1.5">
                <p className="text-[8px] leading-snug text-zinc-600">
                  Three themes from your sources: timeline slip, pricing pressure, and API scope.
                </p>
                <MiniCitationChips />
              </div>
            </div>
          </div>
        </div>
        <div className="w-[28%] p-2">
          <p className="text-[9px] font-bold text-zinc-400">Studio</p>
          <div className="mt-1.5">
            <StudioOutputGrid />
          </div>
        </div>
      </div>
    </PreviewChrome>
  )
}

export function PreviewUploadGuide({ className }: { className?: string }) {
  return (
    <PreviewChrome title="Library · Add sources" className={className}>
      <div className="flex min-h-[180px] items-center justify-center bg-white p-4">
        <div className="w-full max-w-[300px] rounded-xl border border-dashed border-stone-200 bg-stone-50/40 px-3 py-3 text-center">
          <CaptureUploadPhotoPanel />
          <p className="mt-2 text-[11px] font-medium text-zinc-700">Or drag and drop files</p>
          <p className="mt-0.5 text-[9px] text-zinc-400">PDF, images, docs, audio…</p>
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {["Upload file", "Website", "Cloud drive", "Paste text"].map((l) => (
              <span
                key={l}
                className="rounded-md border border-stone-200 bg-white px-2 py-0.5 text-[8px] font-medium text-zinc-600"
              >
                {l}
              </span>
            ))}
          </div>
          <div className="mx-auto mt-3 h-1.5 max-w-[180px] overflow-hidden rounded-full bg-stone-200">
            <div className="h-full w-[35%] rounded-full bg-teal-300/90" />
          </div>
        </div>
      </div>
    </PreviewChrome>
  )
}

export function PreviewLibraryGrid({ className }: { className?: string }) {
  return (
    <PreviewChrome title="Mindar · Library" className={className}>
      <div className="flex min-h-[220px]">
        <PreviewSideRail />
        <CaptureLibraryPhotoGrid />
      </div>
    </PreviewChrome>
  )
}

const SCENE_PREVIEW: Record<ProductScreenshotScene, ComponentType<{ className?: string }>> = {
  dashboard: PreviewWebDashboard,
  "library-grid": PreviewLibraryGrid,
  "library-workspace": PreviewNotebookWorkspace,
  "agent-copilot": PreviewWebAgentCopilot,
  "notebook-sources": PreviewNotebookWorkspace,
  "notebook-studio": PreviewNotebookWorkspace,
  "upload-guide": PreviewUploadGuide,
  plaza: PreviewLibraryGrid,
  "capture-mobile": PreviewUploadGuide,
  study: PreviewNotebookWorkspace,
  work: PreviewWebDashboard,
  project: PreviewNotebookWorkspace,
  inspire: PreviewWebAgentCopilot,
  team: PreviewNotebookWorkspace,
  personal: PreviewLibraryGrid,
}

export function ProductScenePreview({
  scene,
  className,
}: {
  scene: ProductScreenshotScene
  className?: string
}) {
  const Comp = SCENE_PREVIEW[scene] ?? PreviewWebDashboard
  return <Comp className={className} />
}
