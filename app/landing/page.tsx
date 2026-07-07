import type { Metadata } from "next"
import { MindLandingPage } from "@/components/mind-landing/mind-landing-page"

export const metadata: Metadata = {
  title: "Mindar — The knowledge base that thinks",
  description:
    "AI knowledge platform: capture, organize, digest, share, and deliver. Library plaza, grounded Q&A, and Mindar.",
}

export default function LandingPage() {
  return <MindLandingPage />
}
