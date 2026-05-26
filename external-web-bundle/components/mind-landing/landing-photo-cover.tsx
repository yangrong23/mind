"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  LANDING_CAPTURE_FEATURE_PHOTOS,
  LANDING_CAPTURE_LIBRARY_ITEMS,
  LANDING_CAPTURE_UPLOAD_PHOTO,
  LANDING_FLOW_PLATFORM_PHOTOS,
  LANDING_HERO_CONTINUE_PHOTOS,
  LANDING_RESOURCE_PHOTOS,
} from "@/lib/landing-photo-assets"
import type {
  CaptureFeatureVariant,
  FlowPlatformKind,
  ResourceCoverKind,
} from "@/lib/landing-photo-assets"

export function LandingPhoto({
  src,
  alt,
  className,
  objectPosition = "center center",
  priority,
}: {
  src: string
  alt: string
  className?: string
  objectPosition?: string
  priority?: boolean
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 400px"
      className={cn("object-cover", className)}
      style={{ objectPosition }}
      priority={priority}
    />
  )
}

/** Hero continue-reading row — real photos only */
export function HeroContinuePhotoCards({ className }: { className?: string }) {
  return (
    <div className={cn("mt-3 grid grid-cols-3 gap-2", className)}>
      {LANDING_HERO_CONTINUE_PHOTOS.map((item, i) => (
        <div
          key={item.src}
          className="group relative aspect-[4/3] overflow-hidden rounded-lg ring-1 ring-black/[0.06]"
        >
          <LandingPhoto
            src={item.src}
            alt={item.alt}
            objectPosition="center 40%"
            priority={i === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <span className="absolute bottom-1.5 left-2 text-[9px] font-semibold text-white drop-shadow-sm">
            {item.tag}
          </span>
        </div>
      ))}
    </div>
  )
}

/** Resource plaza card — full-bleed category photo */
export function ResourcePhotoCover({ kind }: { kind: ResourceCoverKind }) {
  const photo = LANDING_RESOURCE_PHOTOS[kind]
  return (
    <div className="relative h-[120px] w-full overflow-hidden bg-stone-200 sm:h-[128px]">
      <LandingPhoto
        src={photo.src}
        alt={photo.alt}
        objectPosition={photo.objectPosition}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
    </div>
  )
}

const FLOW_PLATFORM_COPY: Record<FlowPlatformKind, { title: string; line: string }> = {
  web: { title: "Web app", line: "Capture, libraries, and chat in one tab" },
  library: { title: "Library", line: "Organize sources and team folders" },
  agent: { title: "Mindar", line: "Grounded answers from your files" },
  studio: { title: "Studio", line: "Reports, slides, and audio from sources" },
  team: { title: "Team space", line: "Shared libraries with permissions" },
}

/** Capture section — left feature card photo */
export function CaptureFeaturePhoto({ variant }: { variant: CaptureFeatureVariant }) {
  const photo = LANDING_CAPTURE_FEATURE_PHOTOS[variant]
  const frame =
    variant === "mobile"
      ? "h-[88px] w-[88px] rounded-[14px] border-[3px] border-slate-800"
      : variant === "file"
        ? "h-[88px] w-[140px] rounded-xl border border-slate-200"
        : "h-[88px] w-[148px] rounded-xl border border-slate-200"

  return (
    <div className={cn("relative shrink-0 overflow-hidden bg-stone-200 shadow-md", frame)} aria-hidden>
      <LandingPhoto src={photo.src} alt={photo.alt} objectPosition={photo.objectPosition} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
      {photo.label ? (
        <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-800 shadow-sm">
          {photo.label}
        </span>
      ) : null}
    </div>
  )
}

/** Capture section — upload panel with photo */
export function CaptureUploadPhotoPanel({ className }: { className?: string }) {
  const photo = LANDING_CAPTURE_UPLOAD_PHOTO
  return (
    <div
      className={cn(
        "relative mx-auto aspect-[16/10] w-full max-w-[280px] overflow-hidden rounded-lg ring-1 ring-stone-200/80",
        className
      )}
      aria-hidden
    >
      <LandingPhoto src={photo.src} alt={photo.alt} objectPosition={photo.objectPosition} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
    </div>
  )
}

/** Capture section — library grid with unique photos */
export function CaptureLibraryPhotoGrid({ className }: { className?: string }) {
  return (
    <div className={cn("grid flex-1 grid-cols-2 gap-2 p-3", className)}>
      {LANDING_CAPTURE_LIBRARY_ITEMS.map((item) => (
        <div key={item.name} className="overflow-hidden rounded-xl border border-white bg-white shadow-sm">
          <div className="relative aspect-[5/3] bg-stone-200">
            <LandingPhoto src={item.src} alt={item.alt} objectPosition={item.objectPosition} />
          </div>
          <div className="px-2 py-1.5">
            <p className="truncate text-[9px] font-semibold text-zinc-800">{item.name}</p>
            <div className="mt-1 h-1 w-full rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Let knowledge flow — browser chrome + category photo */
export function FlowPlatformPhoto({ kind }: { kind: FlowPlatformKind }) {
  const copy = FLOW_PLATFORM_COPY[kind]
  const photo = LANDING_FLOW_PLATFORM_PHOTOS[kind]
  return (
    <div
      className="flex h-[128px] w-[176px] flex-col overflow-hidden rounded-xl border border-stone-200/90 bg-white shadow-sm sm:h-[136px] sm:w-[200px]"
      aria-hidden
    >
      <div className="flex h-5 shrink-0 items-center gap-1 border-b border-stone-200/80 bg-white/95 px-2">
        <span className="size-[5px] rounded-full bg-[#ff5f57]" />
        <span className="size-[5px] rounded-full bg-[#febc2e]" />
        <span className="size-[5px] rounded-full bg-[#28c840]" />
        <span className="ml-0.5 truncate text-[8px] font-medium text-zinc-600">{copy.title}</span>
      </div>
      <div className="relative min-h-0 flex-1 bg-stone-200">
        <LandingPhoto src={photo.src} alt={photo.alt} objectPosition={photo.objectPosition} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        <p className="absolute bottom-2 left-2 right-2 text-[8px] font-medium leading-snug text-white drop-shadow-sm">
          {copy.line}
        </p>
      </div>
    </div>
  )
}

/** @deprecated Use FlowPlatformPhoto */
export function FlowPlatformShell(props: { kind: FlowPlatformKind }) {
  return <FlowPlatformPhoto {...props} />
}
