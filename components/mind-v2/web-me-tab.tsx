"use client"

import { MeTab, type MeTabProps } from "@/components/mind-v2/me-tab"

/** Desktop Me — always uses web layout (profile cards + square timeline) */
export function WebMeTab(props: Omit<MeTabProps, "webLayout">) {
  return <MeTab {...props} webLayout />
}
