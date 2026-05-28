"use client"

import { FilePlus, type LucideProps } from "lucide-react"
import { cn } from "@/lib/utils"

/** Outline document with corner fold + plus — KB add/upload affordance. */
export function KbUploadFileIcon({ className, strokeWidth = 1.75, ...rest }: LucideProps) {
  return <FilePlus className={cn("shrink-0", className)} strokeWidth={strokeWidth} aria-hidden {...rest} />
}
