"use client"

import { Plus, MessageSquare, Zap } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const projects = [
  { id: 1, name: "新对话", active: true },
  { id: 2, name: "新对话", active: false },
  { id: 3, name: "新对话", active: false },
  { id: 4, name: "新对话", active: false },
  { id: 5, name: "新对话", active: false },
  { id: 6, name: "新对话", active: false },
  { id: 7, name: "新对话", active: false },
  { id: 8, name: "新对话", active: false },
  { id: 9, name: "新对话", active: false },
]

export function Sidebar() {
  return (
    <aside className="w-[220px] h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="h-14 px-4 flex items-center gap-3">
        <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="flex items-center gap-1.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="7" height="16" rx="1" fill="#2563eb"/>
            <rect x="11" y="4" width="5" height="16" rx="1" fill="#60a5fa"/>
            <rect x="18" y="4" width="4" height="16" rx="1" fill="#93c5fd"/>
          </svg>
          <span className="font-semibold text-sm text-gray-900">Medrix Scientist</span>
        </div>
      </div>

      {/* New Project Button */}
      <div className="px-3 pt-2 pb-3">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          <Plus className="size-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Label */}
      <div className="px-3 mb-1">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3">
          PROJECTS
        </p>
      </div>

      {/* Projects List */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-0.5">
          {projects.map((project) => (
            <button
              key={project.id}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                project.active
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <MessageSquare className="size-4" />
              <span>{project.name}</span>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3">
        {/* Credit */}
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Zap className="size-4" />
            <span>Credit</span>
          </div>
          <span className="text-sm font-medium text-blue-500">100/100</span>
        </div>
        
        {/* User */}
        <div className="flex items-center gap-2.5 px-3 py-2">
          <Avatar className="size-7">
            <AvatarFallback className="bg-red-500 text-white text-xs font-medium">
              R
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-700">rong yang</span>
          <button className="ml-auto flex items-center gap-1 px-2.5 py-1 text-xs text-blue-500 border border-blue-200 rounded-full hover:bg-blue-50 transition-colors">
            <Zap className="size-3" />
            <span>Upgrade</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
