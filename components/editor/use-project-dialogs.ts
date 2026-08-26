"use client"

import { createContext, useContext, useState } from "react"

export interface Project {
  id: string
  name: string
  slug: string
  isShared?: boolean
}

export type ProjectDialog = "create" | "rename" | "delete" | null

export const ProjectDialogContext = createContext<(() => void) | null>(null)

export function useOpenCreateProject() {
  const openCreate = useContext(ProjectDialogContext)
  if (!openCreate) {
    throw new Error("useOpenCreateProject must be used inside EditorShell")
  }
  return openCreate
}

const initialProjects: Project[] = [
  { id: "atlas", name: "Atlas", slug: "atlas" },
  {
    id: "platform-foundations",
    name: "Platform Foundations",
    slug: "platform-foundations",
    isShared: true,
  },
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function useProjectDialogs() {
  const [projects, setProjects] = useState(initialProjects)
  const [dialog, setDialog] = useState<ProjectDialog>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectName, setProjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const openCreate = () => {
    setProjectName("")
    setSelectedProject(null)
    setDialog("create")
  }

  const openRename = (project: Project) => {
    setProjectName(project.name)
    setSelectedProject(project)
    setDialog("rename")
  }

  const openDelete = (project: Project) => {
    setSelectedProject(project)
    setDialog("delete")
  }

  const closeDialog = () => {
    setDialog(null)
    setSelectedProject(null)
    setProjectName("")
  }

  const submitCreate = () => {
    const name = projectName.trim()
    if (!name) return

    setIsLoading(true)
    setProjects((currentProjects) => [
      ...currentProjects,
      { id: `project-${Date.now()}`, name, slug: slugify(name) },
    ])
    setIsLoading(false)
    closeDialog()
  }

  const submitRename = () => {
    const name = projectName.trim()
    if (!name || !selectedProject) return

    setIsLoading(true)
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === selectedProject.id
          ? { ...project, name, slug: slugify(name) }
          : project
      )
    )
    setIsLoading(false)
    closeDialog()
  }

  const submitDelete = () => {
    if (!selectedProject) return

    setIsLoading(true)
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== selectedProject.id)
    )
    setIsLoading(false)
    closeDialog()
  }

  return {
    projects,
    dialog,
    selectedProject,
    projectName,
    slugPreview: slugify(projectName),
    isLoading,
    setProjectName,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    submitCreate,
    submitRename,
    submitDelete,
  }
}