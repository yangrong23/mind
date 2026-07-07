"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { MINDAR_LOGO_HEIGHT, MINDAR_LOGO_SRC, MINDAR_LOGO_WIDTH } from "@/lib/mindar-brand"

const variantClass = {
  /** Headers, nav — full wordmark */
  wordmark: "h-7 w-auto max-w-[132px] object-contain object-left",
  /** Auth card, larger contexts */
  auth: "h-9 w-auto max-w-[168px] object-contain",
  /** Agent home hero */
  hero: "h-10 w-auto max-w-[200px] object-contain",
  /** Small inline chip */
  inline: "h-6 w-auto max-w-[108px] object-contain",
  /** Circular / square avatar shell — scales wordmark inside */
  avatar: "h-[70%] w-[85%] object-contain",
} as const

export function MindarLogo({
  variant = "wordmark",
  className,
  priority = false,
}: {
  variant?: keyof typeof variantClass
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      src={MINDAR_LOGO_SRC}
      alt="Mindar"
      width={MINDAR_LOGO_WIDTH}
      height={MINDAR_LOGO_HEIGHT}
      className={cn(variantClass[variant], className)}
      priority={priority}
    />
  )
}

/** Plain img for places that cannot use next/image easily */
export function MindarLogoImg({
  variant = "wordmark",
  className,
}: {
  variant?: keyof typeof variantClass
  className?: string
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={MINDAR_LOGO_SRC} alt="Mindar" className={cn(variantClass[variant], className)} />
  )
}
