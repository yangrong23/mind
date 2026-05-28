"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { LibraryCoverArt } from "@/components/mind-v2/mind-media-art"
import { plazaDiscoverVisualForRow } from "@/lib/plaza-discover-visual"
import type { PlazaLibraryRow } from "@/lib/mock-plaza-libraries"

/** Plaza list — realistic photo / material thumbnail (reference: square cover + rounded) */
export function PlazaDiscoverThumbnail({
  row,
  className,
  size = "list",
}: {
  row: Pick<PlazaLibraryRow, "kbId" | "title" | "description" | "coverVariant">
  className?: string
  /** list = 48px · featured = 52px */
  size?: "list" | "featured"
}) {
  const visual = plazaDiscoverVisualForRow(row)
  const dim = size === "featured" ? "h-[52px] w-[52px]" : "h-12 w-12"

  if (visual.kind === "photo") {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-[10px] bg-stone-100 ring-1 ring-black/[0.06]",
          dim,
          className
        )}
      >
        <Image
          src={visual.src}
          alt=""
          fill
          sizes={size === "featured" ? "52px" : "48px"}
          className="object-cover"
          style={{ objectPosition: visual.objectPosition ?? "center" }}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[10px] ring-1 ring-black/[0.06]",
        dim,
        className
      )}
    >
      <LibraryCoverArt
        variant={visual.variant}
        name={visual.name}
        className="h-full w-full"
        showMiniUi={false}
      />
    </div>
  )
}
