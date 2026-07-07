"use client"

import { useCallback, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export type AgentHomePagerPage = "plaza" | "agent"

export function AgentHomePlazaPager({
  page,
  onPageChange,
  plaza,
  agent,
  className,
}: {
  page: AgentHomePagerPage
  onPageChange: (page: AgentHomePagerPage) => void
  plaza: ReactNode
  agent: ReactNode
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const touchRef = useRef<{ x: number; y: number; locked: "h" | "v" | null } | null>(null)
  const [dragPx, setDragPx] = useState(0)
  const [animating, setAnimating] = useState(false)

  const snapTo = useCallback(
    (target: AgentHomePagerPage) => {
      setAnimating(true)
      setDragPx(0)
      onPageChange(target)
      window.setTimeout(() => setAnimating(false), 320)
    },
    [onPageChange]
  )

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchRef.current = { x: t.clientX, y: t.clientY, locked: null }
    setAnimating(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const start = touchRef.current
    if (!start) return
    const t = e.touches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y

    if (!start.locked) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
      start.locked = Math.abs(dx) > Math.abs(dy) ? "h" : "v"
    }
    if (start.locked !== "h") return

    const w = containerRef.current?.offsetWidth ?? 360
    if (page === "agent") {
      setDragPx(Math.max(0, Math.min(dx, w * 0.92)))
      return
    }
    setDragPx(Math.min(0, Math.max(dx, -w * 0.92)))
  }

  const handleTouchEnd = () => {
    const w = containerRef.current?.offsetWidth ?? 360
    const threshold = w * 0.22
    if (page === "agent" && dragPx > threshold) snapTo("plaza")
    else if (page === "plaza" && dragPx < -threshold) snapTo("agent")
    else {
      setAnimating(true)
      setDragPx(0)
      window.setTimeout(() => setAnimating(false), 320)
    }
    touchRef.current = null
  }

  const basePercent = page === "agent" ? -50 : 0

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full touch-pan-y overflow-hidden", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        className={cn("flex h-full w-[200%] will-change-transform", animating && "transition-transform duration-300 ease-out")}
        style={{ transform: `translateX(calc(${basePercent}% + ${dragPx}px))` }}
      >
        <div className="h-full w-1/2 shrink-0 overflow-hidden">{plaza}</div>
        <div className="h-full w-1/2 shrink-0 overflow-hidden">{agent}</div>
      </div>
    </div>
  )
}
