"use client"

import { useRef, useState, type ReactNode } from "react"
import { Pin, PinOff } from "lucide-react"
import { cn } from "@/lib/utils"

const PIN_STRIP_PX = 88
const SWIPE_SNAP_THRESHOLD = 40

type SwipeableKbRowProps = {
  children: ReactNode
  isPinned: boolean
  onTogglePin: () => void
  kbName: string
  className?: string
}

/** Swipe left to reveal pin / unpin on the right. */
export function SwipeableKbRow({
  children,
  isPinned,
  onTogglePin,
  kbName,
  className,
}: SwipeableKbRowProps) {
  const startX = useRef(0)
  const startDx = useRef(0)
  const [dx, setDx] = useState(0)
  const dragging = useRef(false)

  const snapClosed = () => setDx(0)
  const snapPinOpen = () => setDx(-PIN_STRIP_PX)

  const onStart = (clientX: number) => {
    startX.current = clientX
    startDx.current = dx
    dragging.current = true
  }
  const onMove = (clientX: number) => {
    if (!dragging.current) return
    const next = startDx.current + (clientX - startX.current)
    setDx(Math.max(-PIN_STRIP_PX, Math.min(48, next)))
  }
  const onEnd = () => {
    dragging.current = false
    if (dx < -SWIPE_SNAP_THRESHOLD / 2) {
      snapPinOpen()
      return
    }
    snapClosed()
  }

  const pinRevealed = dx <= -SWIPE_SNAP_THRESHOLD / 2

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <button
        type="button"
        style={{ width: PIN_STRIP_PX }}
        className={cn(
          "absolute inset-y-0 right-0 z-20 flex flex-col items-center justify-center gap-0.5 text-white transition-opacity",
          isPinned ? "bg-zinc-500" : "bg-mind",
          pinRevealed ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-label={isPinned ? `Unpin ${kbName}` : `Pin ${kbName} to top`}
        onClick={(e) => {
          e.stopPropagation()
          onTogglePin()
          snapClosed()
        }}
      >
        {isPinned ? (
          <PinOff className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
        ) : (
          <Pin className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
        )}
        <span className="px-1 text-center text-[11px] font-semibold leading-tight">
          {isPinned ? "Unpin" : "Pin"}
        </span>
      </button>

      <div
        className="relative z-10 w-full select-none bg-transparent"
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging.current ? "none" : "transform 0.2s ease-out",
        }}
        onClick={() => {
          if (pinRevealed) snapClosed()
        }}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => dragging.current && onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={() => dragging.current && onEnd()}
      >
        <div className={cn(pinRevealed && "pointer-events-none")}>{children}</div>
      </div>
    </div>
  )
}
