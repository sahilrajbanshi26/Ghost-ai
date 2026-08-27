"use client"

import type { ReactNode } from "react"
import { Maximize2, Move3d } from "lucide-react"

interface CanvasBlockProps {
  children: ReactNode
  projectName?: string
}

export function CanvasBlock({ children, projectName = "Workspace canvas" }: CanvasBlockProps) {
  return (
    <section className="workspace-canvas grid h-full min-h-0 grid-rows-[52px_minmax(0,1fr)] overflow-hidden">
      <div className="pointer-events-none z-10 flex items-center justify-between border-b border-border/40 bg-background/70 px-4 backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-2">
          <Move3d className="h-4 w-4 shrink-0 text-auth-accent" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">Canvas</p>
            <p className="truncate text-[11px] text-muted-foreground">{projectName} · synced</p>
          </div>
        </div>
        <Maximize2 className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="relative min-h-0">{children}</div>
    </section>
  )
}