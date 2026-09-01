"use client"

import { useSyncExternalStore, useState } from "react"

import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ShareDialog } from "@/components/editor/share-dialog"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { LiveCanvas } from "@/components/editor/live-canvas"
import { CanvasBlock } from "@/components/editor/canvas-block"
import { AISidebar } from "@/components/editor/ai-sidebar"
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { ProjectSummary } from "@/lib/projects"

interface EditorShellProps {
  ownedProjects: ProjectSummary[]
  sharedProjects: ProjectSummary[]
  children?: React.ReactNode
  workspaceTitle?: string
  projectId?: string
  isOwner?: boolean
}

export function EditorShell({ ownedProjects, sharedProjects, children, workspaceTitle, projectId, isOwner = false }: EditorShellProps) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const projectActions = useProjectActions()
  const [manualSave, setManualSave] = useState<(() => Promise<void>) | null>(null)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isCopilotOpen, setIsCopilotOpen] = useState(true)
  const [saveStatus, setSaveStatus] = useState<CanvasSaveStatus>("saved")
  const isMobile = useSyncExternalStore(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia("(max-width: 767px)")
      mediaQuery.addEventListener("change", onStoreChange)
      return () => mediaQuery.removeEventListener("change", onStoreChange)
    },
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false
  )
  const isSidebarOpen = isMobile ? isMobileSidebarOpen : isDesktopSidebarOpen

  return (
    <div className="min-h-screen bg-background">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => {
          if (isMobile) {
            setIsMobileSidebarOpen((isOpen) => !isOpen)
          } else {
            setIsDesktopSidebarOpen((isOpen) => !isOpen)
          }
        }}
        workspaceTitle={workspaceTitle}
        projectId={projectId}
        onShare={() => setIsShareOpen(true)}
        onSave={() => {
          if (manualSave) {
            void manualSave()
          }
        }}
        isCopilotOpen={isCopilotOpen}
        onCopilotToggle={() => setIsCopilotOpen((isOpen) => !isOpen)}
        saveStatus={saveStatus}
      />
      <main className="h-screen overflow-hidden pt-14">
        <div className="relative h-[calc(100vh-3.5rem)] min-h-0">
          <ProjectSidebar
            isOpen={isSidebarOpen}
            onClose={() => {
              if (isMobile) {
                setIsMobileSidebarOpen(false)
              } else {
                setIsDesktopSidebarOpen(false)
              }
            }}
            ownedProjects={ownedProjects}
            sharedProjects={sharedProjects}
            onCreate={projectActions.openCreate}
            onRename={projectActions.openRename}
            onDelete={projectActions.openDelete}
          />
          <div className="h-full min-h-0">
            <CanvasBlock projectName={workspaceTitle}>
              {projectId ? <LiveCanvas roomId={projectId} projectName={workspaceTitle ?? "Untitled Workspace"} onSaveStatusChange={setSaveStatus} onSaveRef={setManualSave} /> : children ?? (
          <div className="flex h-full min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">Create a project or open an existing one</h1>
              <p className="text-sm text-muted-foreground">Start a new architecture workspace, or choose a project from the sidebar.</p>
            </div>
            <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90" type="button" onClick={projectActions.openCreate}>
              New Project
            </button>
          </div>
              )}
            </CanvasBlock>
          </div>
          {isCopilotOpen && <AISidebar isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />}
        </div>
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
      <ShareDialog
        key={projectId}
        projectId={projectId}
        projectName={workspaceTitle}
        isOwner={isOwner}
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
      />
    </div>
  )
}
