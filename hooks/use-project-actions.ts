"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

import type { ProjectSummary } from "@/lib/projects"

export type ProjectDialog = "create" | "rename" | "delete" | null

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function createRoomId(name: string, suffix: string) {
  return `${slugify(name) || "untitled-project"}-${suffix}`
}

export function useProjectActions() {
  const router = useRouter()
  const pathname = usePathname()
  const [dialog, setDialog] = useState<ProjectDialog>(null)
  const [projectName, setProjectName] = useState("")
  const [roomIdPreview, setRoomIdPreview] = useState("")
  const [roomIdSuffix, setRoomIdSuffix] = useState("")
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openCreate = () => {
    const suffix = Math.random().toString(36).slice(2, 8)
    setProjectName("")
    setRoomIdSuffix(suffix)
    setRoomIdPreview(createRoomId("Untitled Project", suffix))
    setSelectedProject(null)
    setError(null)
    setDialog("create")
  }

  const openRename = (project: ProjectSummary) => {
    setProjectName(project.name)
    setSelectedProject(project)
    setError(null)
    setDialog("rename")
  }

  const openDelete = (project: ProjectSummary) => {
    setSelectedProject(project)
    setError(null)
    setDialog("delete")
  }

  const updateProjectName = (name: string) => {
    setProjectName(name)
    if (dialog === "create") setRoomIdPreview(createRoomId(name, roomIdSuffix))
  }

  const closeDialog = () => {
    setDialog(null)
    setSelectedProject(null)
    setProjectName("")
    setRoomIdPreview("")
    setRoomIdSuffix("")
    setError(null)
  }

  const submitCreate = async () => {
    const name = projectName.trim() || "Untitled Project"
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!response.ok) throw new Error("Unable to create project")

      const project: ProjectSummary = await response.json()
      closeDialog()
      router.push(`/editor/${project.id}`)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create project")
    } finally {
      setIsLoading(false)
    }
  }

  const submitRename = async () => {
    if (!selectedProject || !projectName.trim()) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim() }),
      })
      if (!response.ok) throw new Error("Unable to rename project")
      closeDialog()
      router.refresh()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to rename project")
    } finally {
      setIsLoading(false)
    }
  }

  const submitDelete = async () => {
    if (!selectedProject) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Unable to delete project")
      closeDialog()
      if (pathname === `/editor/${selectedProject.id}`) {
        router.push("/editor")
      } else {
        router.refresh()
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to delete project")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    dialog,
    projectName,
    roomIdPreview,
    selectedProject,
    isLoading,
    error,
    openCreate,
    openRename,
    openDelete,
    updateProjectName,
    closeDialog,
    submitCreate,
    submitRename,
    submitDelete,
  }
}