"use client"

import { useState } from "react"

import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { ProjectSummary } from "@/lib/projects"

interface EditorShellProps {
  ownedProjects: ProjectSummary[]
  sharedProjects: ProjectSummary[]
  children?: React.ReactNode
}

export function EditorShell({ ownedProjects, sharedProjects, children }: EditorShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const projectActions = useProjectActions()

  return (
    <div className="min-h-screen bg-background">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onCreate={projectActions.openCreate}
        onRename={projectActions.openRename}
        onDelete={projectActions.openDelete}
      />

      <main className="min-h-screen pt-14">
        {children ?? (
          <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">Create a project or open an existing one</h1>
              <p className="text-sm text-muted-foreground">Start a new architecture workspace, or choose a project from the sidebar.</p>
            </div>
            <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90" type="button" onClick={projectActions.openCreate}>
              New Project
            </button>
          </div>
        )}
      </main>
      <ProjectDialogs
        dialog={projectActions.dialog}
        projectName={projectActions.projectName}
        roomIdPreview={projectActions.roomIdPreview}
        selectedProjectName={projectActions.selectedProject?.name}
        isLoading={projectActions.isLoading}
        error={projectActions.error}
        onProjectNameChange={projectActions.updateProjectName}
        onClose={projectActions.closeDialog}
        onCreate={projectActions.submitCreate}
        onRename={projectActions.submitRename}
        onDelete={projectActions.submitDelete}
      />
    </div>
  )
}
