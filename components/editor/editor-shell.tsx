"use client"

import { useState } from "react"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import {
  ProjectDialogContext,
  useProjectDialogs,
} from "@/components/editor/use-project-dialogs"

interface EditorShellProps {
  children: React.ReactNode
}

export function EditorShell({ children }: EditorShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const projectDialogs = useProjectDialogs()

  return (
    <ProjectDialogContext.Provider value={projectDialogs.openCreate}>
      <div className="min-h-screen bg-background">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen((isOpen) => !isOpen)}
        />
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          projects={projectDialogs.projects}
          onCreate={projectDialogs.openCreate}
          onRename={projectDialogs.openRename}
          onDelete={projectDialogs.openDelete}
        />

        <main className="min-h-screen pt-14">{children}</main>
        <ProjectDialogs
          dialog={projectDialogs.dialog}
          projectName={projectDialogs.projectName}
          slugPreview={projectDialogs.slugPreview}
          selectedProjectName={projectDialogs.selectedProject?.name}
          isLoading={projectDialogs.isLoading}
          onProjectNameChange={projectDialogs.setProjectName}
          onClose={projectDialogs.closeDialog}
          onCreate={projectDialogs.submitCreate}
          onRename={projectDialogs.submitRename}
          onDelete={projectDialogs.submitDelete}
        />
      </div>
    </ProjectDialogContext.Provider>
  )
}
