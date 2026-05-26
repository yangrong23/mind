export type MindAccountId = "work" | "personal"

export type MindAccountKind = "work" | "personal"

export interface MindAccount {
  id: MindAccountId
  kind: MindAccountKind
  displayName: string
  email: string
  /** Single-letter avatar fallback */
  initial: string
}

export const MIND_ACCOUNTS = [
  {
    id: "work",
    kind: "work",
    displayName: "Alex Chen",
    email: "alex@acme-labs.com",
    initial: "A",
  },
  {
    id: "personal",
    kind: "personal",
    displayName: "Alex Chen",
    email: "alex.personal@gmail.com",
    initial: "A",
  },
] as const satisfies readonly MindAccount[]

export function getMindAccount(id: MindAccountId): MindAccount {
  return MIND_ACCOUNTS.find((a) => a.id === id) ?? MIND_ACCOUNTS[0]
}

export function accountSpaceLabel(kind: MindAccountKind): string {
  return kind === "work" ? "Work" : "Personal"
}
