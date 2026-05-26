"use client"

import type { SVGProps } from "react"
import { cn } from "@/lib/utils"

export type SmartSearchIconProps = SVGProps<SVGSVGElement> & {
  /** Ring + handle stroke width (default 2, matches Lucide) */
  strokeWidth?: number
}

/**
 * Smart-search icon: magnifier ring with a gap at the top-right + solid four-point star (matches product reference),
 * distinct from generic Search / ScanSearch.
 */
export function SmartSearchIcon({
  className,
  strokeWidth = 2,
  ...props
}: SmartSearchIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      aria-hidden
      {...props}
    >
      {/* Main ring: long arc leaving a wedge at ~NE for the star */}
      <path
        d="M 16.34 7.04 A 7 7 0 1 1 12.96 3.66"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Handle */}
      <path
        d="M 14.85 15.35 L 21 21"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Four-point sparkle (filled), sits in the ring gap */}
      <path
        d="M 14.95 2.95 L 16.95 5.05 L 14.95 7.15 L 12.95 5.05 Z"
        fill="currentColor"
      />
    </svg>
  )
}
