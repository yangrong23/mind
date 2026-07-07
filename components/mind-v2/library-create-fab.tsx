"use client"

import { MindAddFab } from "@/components/mind-v2/mind-add-button"

/** Compact FAB — bottom-right above the tab bar. */
export function LibraryCreateFab({
  onClick,
  ariaLabel = "New library",
}: {
  onClick: () => void
  label?: string
  ariaLabel?: string
}) {
  return <MindAddFab onClick={onClick} ariaLabel={ariaLabel} variant="fab-light" />
}
