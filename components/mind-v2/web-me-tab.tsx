"use client"

import { MeTab, type MeTabProps } from "@/components/mind-v2/me-tab"

/** Desktop Me — profile + linear activity timeline */
export function WebMeTab(props: Omit<MeTabProps, "webLayout">) {
  return <MeTab {...props} webLayout />
}
