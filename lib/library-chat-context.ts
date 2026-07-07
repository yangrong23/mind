/** Launch library-grounded Mindar chat from Knowledge detail. */
export type LibraryChatLaunchContext = {
  kbName: string
  contentTitle?: string
  initialPrompt?: string
  /** When set, backing out of Chat re-opens this Hub article. */
  contentDocId?: number
  /** Optional starter prompts for public KB chat. */
  publicAgent?: {
    recommendedQuestions?: string[]
  }
}
