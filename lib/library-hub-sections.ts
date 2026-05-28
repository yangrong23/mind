export type LibraryHubSectionId = "mine" | "followed" | "team" | "published"

export type LibraryHubSectionMeta = {
  id: LibraryHubSectionId
  /** Sidebar / overview heading */
  label: string
  /** One-line helper under the heading */
  description: string
  canCreate: boolean
  browsePlaza?: boolean
}

/** Personal → Subscribed (plaza follows) → Shared (team) → Published by me */
export const LIBRARY_HUB_SECTIONS: LibraryHubSectionMeta[] = [
  {
    id: "mine",
    label: "Personal",
    description: "Private libraries only you can manage",
    canCreate: true,
  },
  {
    id: "followed",
    label: "Subscribed",
    description: "Libraries you follow from the plaza — read and chat on your account",
    canCreate: false,
    browsePlaza: true,
  },
  {
    id: "team",
    label: "Shared",
    description: "Team libraries — you may be the owner or a collaborator",
    canCreate: true,
  },
  {
    id: "published",
    label: "Published by me",
    description: "Libraries you listed on the plaza for others to subscribe",
    canCreate: false,
  },
]

export function libraryHubSectionLabel(id: LibraryHubSectionId): string {
  return LIBRARY_HUB_SECTIONS.find((s) => s.id === id)?.label ?? id
}
