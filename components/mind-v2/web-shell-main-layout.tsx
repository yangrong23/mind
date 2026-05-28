"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { useWebWorkspaceChromeOptional } from "@/components/mind-v2/web-workspace-chrome"

/** Shared shell for Plaza / Library / Agent list views — matches primary nav surface language. */
export function WebShellMainLayout({
  title,
  subtitle,
  headerTrailing,
  children,
  bodyClassName,
  maxWidth = "1040px",
}: {
  title: string
  subtitle?: string
  headerTrailing?: ReactNode
  children: ReactNode
  bodyClassName?: string
  maxWidth?: string
}) {
  const chrome = useWebWorkspaceChromeOptional()
  const Credits = chrome?.CreditsInline

  return (
    <div className={cn("flex h-full min-h-0 flex-col overflow-hidden", web.canvas)}>
      <header
        className={cn(
          "shrink-0 border-b border-white/45 bg-white/30 px-6 py-5 backdrop-blur-md lg:px-10"
        )}
      >
        <div
          className="mx-auto flex w-full flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
          style={{ maxWidth }}
        >
          <div className="min-w-0 flex-1">
            <h1 className={web.pageTitle}>{title}</h1>
            {subtitle ? <p className={web.pageSubtitle}>{subtitle}</p> : null}
          </div>
          {(headerTrailing || Credits) && (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto lg:shrink-0">
              {headerTrailing}
              {Credits ? <Credits /> : null}
            </div>
          )}
        </div>
      </header>

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div
          className={cn("mx-auto w-full pb-14", web.pagePadWide, bodyClassName)}
          style={{ maxWidth }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
