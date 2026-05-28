"use client"

import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavMotion } from "@/components/mind-v2/web-nav-motion"

type NavItemOpts = { subtle?: boolean; className?: string }

/** Agent sidebar, knowledge library rows, recent chats */
export function webNavListItem(active: boolean, opts?: NavItemOpts) {
  return cn(
    web.navItemBase,
    webNavMotion.pressable,
    active ? (opts?.subtle ? web.navItemSubtleActive : web.navItemActive) : web.navItemIdle,
    opts?.className
  )
}

/** Left icon rail — 广场 / Library / Mindar */
export function webIconRailTab(active: boolean, className?: string) {
  return cn(
    web.railTabBase,
    webNavMotion.pressable,
    active ? web.railTabActive : web.railTabIdle,
    className
  )
}

/** Segmented control tabs (e.g. Ask / Prompt rail) */
export function webNavSegmentTab(active: boolean, className?: string) {
  return cn(
    web.navItemBase,
    webNavMotion.pressable,
    active ? web.navItemActive : web.navItemIdle,
    className
  )
}
