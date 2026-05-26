/** Share helpers for major international social platforms (web intents). */

const FALLBACK_SHARE_URL = "https://mind.app/share"

export function combineShareText(title: string, body: string) {
  const t = title.trim()
  const b = body.trim()
  if (t && b) return `${t}\n\n${b}`
  return t || b
}

export type SocialShareId =
  | "x"
  | "facebook"
  | "whatsapp"
  | "linkedin"
  | "reddit"
  | "telegram"
  | "instagram"

export function getSocialShareUrl(id: SocialShareId, title: string, body: string): string {
  const full = combineShareText(title, body)
  const enc = encodeURIComponent
  const u = FALLBACK_SHARE_URL
  switch (id) {
    case "x":
      return `https://twitter.com/intent/tweet?text=${enc(full.slice(0, 280))}`
    case "whatsapp":
      return `https://wa.me/?text=${enc(full)}`
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${enc(u)}&quote=${enc(full)}`
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${enc(u)}`
    case "reddit":
      return `https://www.reddit.com/submit?title=${enc(title || "Shared")}&text=${enc(body)}`
    case "telegram":
      return `https://t.me/share/url?url=${enc(u)}&text=${enc(full)}`
    case "instagram":
      return `https://www.threads.net/intent/post?text=${enc(full.slice(0, 500))}`
  }
}

export function openSocialShare(id: SocialShareId, title: string, body: string) {
  window.open(getSocialShareUrl(id, title, body), "_blank", "noopener,noreferrer")
}

export async function copyShareText(title: string, body: string): Promise<boolean> {
  const text = combineShareText(title, body)
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export type SocialShareRowId = SocialShareId | "copy"

/** Major international networks; Instagram uses Threads web compose for text. */
export const SOCIAL_SHARE_ACTIONS: readonly {
  id: SocialShareRowId
  label: string
  color: string
}[] = [
  { id: "x", label: "X", color: "bg-zinc-900" },
  { id: "facebook", label: "Facebook", color: "bg-[#1877F2]" },
  { id: "whatsapp", label: "WhatsApp", color: "bg-[#25D366]" },
  { id: "instagram", label: "Instagram", color: "bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888]" },
  { id: "linkedin", label: "LinkedIn", color: "bg-[#0A66C2]" },
  { id: "reddit", label: "Reddit", color: "bg-[#FF4500]" },
  { id: "telegram", label: "Telegram", color: "bg-[#26A5E4]" },
  { id: "copy", label: "Copy", color: "bg-gray-100" },
] as const
