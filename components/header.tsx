"use client"

import { Globe, Moon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Header() {
  return (
    <header className="h-14 flex items-center justify-end px-6 gap-4">
      <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
        <Globe className="size-4" />
        <span>EN</span>
      </button>
      <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
        <Moon className="size-5" />
      </button>
      <Avatar className="size-8">
        <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
          R
        </AvatarFallback>
      </Avatar>
    </header>
  )
}
