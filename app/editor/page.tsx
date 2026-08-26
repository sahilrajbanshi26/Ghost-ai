"use client"

import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useOpenCreateProject } from "@/components/editor/use-project-dialogs"

export default function EditorPage() {
  const openCreate = useOpenCreateProject()

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Create a project or open an existing one</h1>
        <p className="text-sm text-muted-foreground">Start a new architecture workspace, or choose a project from the sidebar.</p>
      </div>
      <Button type="button" onClick={openCreate}>
        <Plus />
        New Project
      </Button>
    </div>
  )
}
