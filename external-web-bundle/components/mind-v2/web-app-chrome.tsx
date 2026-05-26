"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Shared web product chrome — light canvas, soft mesh, rounded panels (Figure 1). */
export function WebPageCanvas({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative h-full min-h-0 overflow-hidden bg-[#f3f4f8] dark:bg-zinc-950",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_8%_0%,rgba(199,210,254,0.45),transparent_55%),radial-gradient(ellipse_70%_50%_at_92%_8%,rgba(153,246,228,0.35),transparent_50%),radial-gradient(ellipse_50%_40%_at_50%_100%,rgba(233,213,255,0.25),transparent_45%)]"
        aria-hidden
      />
      <div className="relative z-10 h-full min-h-0 overflow-y-auto">{children}</div>
    </div>
  )
}

export function WebPanel({
  children,
  className,
  noPadding,
}: {
  children: ReactNode
  className?: string
  noPadding?: boolean
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/90 bg-white/95 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.1)] backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95",
        !noPadding && "p-4",
        className
      )}
    >
      {children}
    </div>
  )
}

export function WebPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-zinc-700 dark:text-zinc-50">{title}</h1>
        {subtitle ? <p className="mt-1 text-[14px] text-zinc-500">{subtitle}</p> : null}
      </div>
      {actions}
    </div>
  )
}

export function WebGradientButton({
  children,
  onClick,
  variant = "primary",
  className,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "outline"
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-semibold transition-all",
        variant === "primary" &&
          "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/25 hover:shadow-lg hover:brightness-105",
        variant === "outline" &&
          "border border-stone-200 bg-white text-zinc-700 hover:bg-stone-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
        className
      )}
    >
      {children}
    </button>
  )
}
