"use client"

import {
  Fragment,
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"
import { cn } from "@/lib/utils"

type WebResizableColumnsProps = {
  /** Percent widths — must sum to 100 */
  defaultSizes: number[]
  minPx?: number[]
  className?: string
  children: ReactNode[]
}

/** Horizontal panels with drag handles between columns */
export function WebResizableColumns({
  defaultSizes,
  minPx = [],
  className,
  children,
}: WebResizableColumnsProps) {
  const count = children.length
  const [sizes, setSizes] = useState(() => normalizeSizes(defaultSizes, count))
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ index: number; startX: number; startSizes: number[] } | null>(null)

  const onHandlePointerDown = useCallback(
    (index: number) => (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      dragRef.current = { index, startX: e.clientX, startSizes: [...sizes] }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [sizes]
  )

  const onHandlePointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const el = containerRef.current
    if (!drag || !el) return
    const rect = el.getBoundingClientRect()
    const deltaPct = ((e.clientX - drag.startX) / rect.width) * 100
    const next = [...drag.startSizes]
    const leftMin = (minPx[drag.index] ?? 200) / rect.width * 100
    const rightMin = (minPx[drag.index + 1] ?? 200) / rect.width * 100
    let left = next[drag.index]! + deltaPct
    let right = next[drag.index + 1]! - deltaPct
    if (left < leftMin) {
      right -= leftMin - left
      left = leftMin
    }
    if (right < rightMin) {
      left -= rightMin - right
      right = rightMin
    }
    next[drag.index] = left
    next[drag.index + 1] = right
    setSizes(normalizeSizes(next, count))
  }, [count, minPx])

  const onHandlePointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
  }, [])

  return (
    <div ref={containerRef} className={cn("flex min-h-0 min-w-0 flex-1", className)}>
      {children.map((child, i) => (
        <Fragment key={i}>
          <div
            className="flex min-h-0 min-w-0 flex-col overflow-hidden"
            style={{ width: `${sizes[i]}%` }}
          >
            {child}
          </div>
          {i < children.length - 1 ? (
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize columns"
              onPointerDown={onHandlePointerDown(i)}
              onPointerMove={onHandlePointerMove}
              onPointerUp={onHandlePointerUp}
              onPointerCancel={onHandlePointerUp}
              className="group relative z-10 w-2 shrink-0 cursor-col-resize touch-none"
            >
              <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-stone-200/90 transition-colors group-hover:bg-mind/40 group-active:bg-mind/55" />
              <div className="absolute top-1/2 left-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-300/80 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ) : null}
        </Fragment>
      ))}
    </div>
  )
}

function normalizeSizes(sizes: number[], count: number): number[] {
  const base = sizes.slice(0, count)
  while (base.length < count) base.push(100 / count)
  const sum = base.reduce((a, b) => a + b, 0) || 1
  return base.map((s) => (s / sum) * 100)
}
