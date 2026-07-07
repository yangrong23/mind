"use client"

import { LANDING_COPY as t } from "@/lib/mind-landing-copy"
import { cn } from "@/lib/utils"
import {
  PreviewLibraryGrid,
  PreviewNotebookWorkspace,
  PreviewUploadGuide,
  PreviewWebAgentCopilot,
  PreviewWebDashboard,
  ProductScenePreview,
} from "@/components/mind-landing/landing-app-previews"
import { CaptureFeatureCompact } from "@/components/mind-landing/landing-compact-previews"
import { FlowPlatformPhoto, ResourcePhotoCover } from "@/components/mind-landing/landing-photo-cover"
import { flowPlatformKind, resourceCoverKind } from "@/lib/landing-photo-assets"
import {
  AiSpeakerChip,
  MiniCitationChips,
  PermissionThumbPrivate,
  PermissionThumbPublic,
  PermissionThumbTeam,
} from "@/components/mind-landing/landing-realistic-media"
import type { ProductScreenshotScene } from "@/lib/product-media"

/** Floating product screenshot — design mock style */
export function ProductShot({
  children,
  className,
  shadow = "lg",
}: {
  children: React.ReactNode
  className?: string
  shadow?: "lg" | "xl"
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] border border-white/60 bg-white/90 shadow-[0_24px_80px_-20px_rgba(30,41,59,0.22)] backdrop-blur-sm",
        shadow === "xl" && "shadow-[0_32px_100px_-24px_rgba(30,41,59,0.28)]",
        className
      )}
    >
      {children}
    </div>
  )
}

function AppTitleBar({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/95 px-4 py-2.5">
      <span className="size-[9px] rounded-full bg-[#ff5f57]" />
      <span className="size-[9px] rounded-full bg-[#febc2e]" />
      <span className="size-[9px] rounded-full bg-[#28c840]" />
      <span className="ml-1 truncate text-[11px] font-medium text-slate-500">{title}</span>
    </div>
  )
}

/** Hero — Web dashboard (actual product chrome) */
export function WorkbenchShot({ className }: { className?: string }) {
  return (
    <ProductShot shadow="xl" className={cn("w-full", className)}>
      <PreviewWebDashboard className="min-h-[340px] sm:min-h-[380px]" />
    </ProductShot>
  )
}

/** Library hub + upload guide */
export function LibraryTableShot({ className }: { className?: string }) {
  return (
    <ProductShot className={cn("w-full", className)}>
      <div className="space-y-3 bg-white p-3">
        <PreviewUploadGuide />
        <PreviewLibraryGrid className="opacity-95" />
      </div>
    </ProductShot>
  )
}

/** Capture feature — native-size thumbnails (no heavy scale) */
export function CaptureFeaturePreview({ variant }: { variant: "web" | "file" | "mobile" }) {
  return <CaptureFeatureCompact variant={variant} />
}

/** Notebook Q&A — workspace + cited answer overlay */
export function ChatShot({ className }: { className?: string }) {
  return (
    <ProductShot className={cn("w-full", className)}>
      <div className="relative bg-white">
        <PreviewNotebookWorkspace className="min-h-[300px]" />
        <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-slate-200/90 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
          <div className="flex justify-end">
            <div className="max-w-[78%] rounded-xl rounded-tr-sm bg-slate-900 px-3 py-2 text-[11px] text-white">
              {t.qa.question}
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <AiSpeakerChip />
            <div>
              <p className="text-[11px] leading-snug text-slate-600">{t.qa.answerPoints[0]}</p>
              <MiniCitationChips />
            </div>
          </div>
        </div>
      </div>
    </ProductShot>
  )
}

/** Notes + Studio from same library sources */
export function NotesEditorShot({ className }: { className?: string }) {
  return (
    <ProductShot className={cn("w-full", className)}>
      <PreviewNotebookWorkspace className="min-h-[280px]" />
    </ProductShot>
  )
}

/** Notes features — Studio / workspace strip */
export function NotesFeatureStrip({ index }: { index: number }) {
  const scenes: ProductScreenshotScene[] = ["notebook-studio", "notebook-sources", "agent-copilot"]
  return (
    <div className="h-14 w-full overflow-hidden rounded-lg border border-slate-100 bg-white">
      <ProductScenePreview scene={scenes[index] ?? scenes[0]} className="scale-[0.32] origin-top-left w-[320px] -mb-8" />
    </div>
  )
}

/** Team library workspace */
export function TeamCollabShot({ className }: { className?: string }) {
  return (
    <ProductShot className={cn("w-full", className)}>
      <PreviewNotebookWorkspace className="min-h-[240px]" />
    </ProductShot>
  )
}

/** Permission row — mini UI thumbnail */
export function PermissionPreview({ variant }: { variant: "private" | "team" | "public" }) {
  const content = {
    private: <PermissionThumbPrivate />,
    team: <PermissionThumbTeam />,
    public: <PermissionThumbPublic />,
  }
  return (
    <div className="h-[72px] w-[100px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {content[variant]}
    </div>
  )
}

/** Multi-device — same product UI at different sizes */
export function MultiDeviceShot({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-end justify-center gap-5", className)}>
      <DeviceFrame variant="laptop" className="z-10 w-[220px]">
        <PreviewWebDashboard className="scale-[0.95] origin-top" />
      </DeviceFrame>
      <DeviceFrame variant="tablet" className="mb-4 w-[120px]">
        <PreviewLibraryGrid className="scale-[0.55] origin-top-left w-[200px]" />
      </DeviceFrame>
      <DeviceFrame variant="phone" className="mb-8 w-[64px]">
        <PreviewWebAgentCopilot className="scale-[0.38] origin-top-left w-[170px]" />
      </DeviceFrame>
    </div>
  )
}

function DeviceFrame({
  variant,
  children,
  className,
}: {
  variant: "laptop" | "tablet" | "phone"
  children: React.ReactNode
  className?: string
}) {
  const sizes = {
    laptop: "w-[200px] rounded-xl border-[3px] border-slate-800 pb-2 pt-1",
    tablet: "w-[100px] rounded-2xl border-[3px] border-slate-800 pb-1.5 pt-1",
    phone: "w-[56px] rounded-[14px] border-[3px] border-slate-800 pb-1 pt-0.5",
  }
  return (
    <div className={cn("overflow-hidden bg-slate-800 shadow-xl", sizes[variant], className)}>
      <div className="mx-auto mb-1 h-1 w-8 rounded-full bg-slate-600" />
      <div className="overflow-hidden rounded-md bg-white">{children}</div>
    </div>
  )
}

function MiniWorkbench() {
  return (
    <div className="flex h-[100px] bg-slate-50 p-1">
      <div className="w-8 shrink-0 space-y-0.5 border-r border-slate-100 pr-1">
        <div className="h-2 rounded bg-emerald-100" />
        <div className="h-1.5 rounded bg-slate-100" />
        <div className="h-1.5 rounded bg-slate-100" />
      </div>
      <div className="grid flex-1 grid-cols-2 gap-0.5 p-0.5">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="rounded bg-white p-1 shadow-sm">
            <div className="h-3 rounded bg-sky-50" />
            <div className="mt-0.5 h-1 w-full rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  )
}

function MiniLibraryList() {
  return (
    <div className="h-[72px] space-y-1 bg-white p-1.5">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex gap-1">
          <div className="size-3 shrink-0 rounded bg-slate-100" />
          <div className="h-1.5 flex-1 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  )
}

function MiniNote() {
  return (
    <div className="h-[80px] bg-white p-1.5">
      <div className="h-2 w-2/3 rounded bg-slate-300" />
      <div className="mt-2 h-1 w-full rounded bg-slate-100" />
      <div className="mt-1 h-8 rounded bg-amber-50" />
    </div>
  )
}

/** Use case card with screenshot thumbnail */
export function UseCaseShot({
  title,
  desc,
  tint,
  scene,
}: {
  title: string
  desc: string
  tint: string
  scene: "study" | "work" | "project" | "inspire" | "team" | "personal"
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-white/55 bg-gradient-to-b shadow-md backdrop-blur-md transition hover:shadow-lg",
        tint
      )}
    >
      <div className="border-b border-white/40 bg-white/50 p-3">
        <UseCaseThumbnail scene={scene} />
      </div>
      <div className="p-6 pt-5">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
      </div>
    </div>
  )
}

export function UseCaseThumbnail({
  scene,
  className,
}: {
  scene: "study" | "work" | "project" | "inspire" | "team" | "personal"
  className?: string
}) {
  const map: Record<typeof scene, ProductScreenshotScene> = {
    study: "study",
    work: "work",
    project: "project",
    inspire: "inspire",
    team: "team",
    personal: "personal",
  }
  return (
    <div
      className={cn(
        "h-[120px] w-full overflow-hidden rounded-2xl border border-slate-100 bg-[#f3f4f8] shadow-inner",
        className
      )}
    >
      <ProductScenePreview scene={map[scene]} className="scale-[0.52] origin-top-left w-[340px]" />
    </div>
  )
}

/** Resource library card — unique plaza cover per category */
export function ResourceLibraryShot({
  label,
  stat,
  tint,
  coverIndex = 0,
}: {
  label: string
  stat: string
  tint: string
  coverIndex?: number
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/50 shadow-sm backdrop-blur-md",
        tint
      )}
    >
      <ResourcePhotoCover kind={resourceCoverKind(coverIndex)} />
      <div className="flex items-center justify-between border-t border-white/40 bg-white/60 px-4 py-3">
        <span className="text-sm font-medium text-slate-800">{label}</span>
        <span className="text-sm font-bold tabular-nums text-slate-900">{stat}</span>
      </div>
    </div>
  )
}

/** Platform tile — distinct preview per flow step, readable size */
export function PlatformDevice({
  label,
  platformIndex = 0,
}: {
  label: string
  platformIndex?: number
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/70 p-1 shadow-lg backdrop-blur-md">
        <FlowPlatformPhoto kind={flowPlatformKind(platformIndex)} />
      </div>
      <span className="text-sm font-medium text-slate-600">{label}</span>
    </div>
  )
}
