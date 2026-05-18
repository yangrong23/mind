"use client"

import { Globe, Moon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Header() {
  return (
    <header className="h-14 flex items-center justify-end px-6 gap-4">
      <button className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900">
        <Globe className="size-4" />
        <span>EN</span>
      </button>
      <button className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg">
        <Moon className="size-5" />
      </button>
      <Avatar className="size-8">
        <AvatarFallback className="bg-zinc-200 text-zinc-600 text-sm">
          R
        </AvatarFallback>
      </Avatar>
    </header>
  )
}
