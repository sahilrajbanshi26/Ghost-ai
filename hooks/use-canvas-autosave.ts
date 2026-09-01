import type { Edge, Node } from "@xyflow/react"
import { useCallback, useEffect, useRef } from "react"

export type CanvasSaveStatus = "saving" | "saved" | "error"

interface UseCanvasAutosaveOptions<TNode extends Node, TEdge extends Edge> {
  projectId?: string
  nodes: TNode[] | null | undefined
  edges: TEdge[] | null | undefined
  isLoading: boolean
  onSaveStatusChange?: (status: CanvasSaveStatus) => void
  onSaveRef?: (saveNow: () => Promise<void>) => void
}

export function useCanvasAutosave<TNode extends Node, TEdge extends Edge>({
  projectId,
  nodes,
  edges,
  isLoading,
  onSaveStatusChange,
  onSaveRef,
}: UseCanvasAutosaveOptions<TNode, TEdge>) {
  const lastSavedRef = useRef("")
  const hasHydratedRef = useRef(false)

  const saveNow = useCallback(async () => {
    if (!projectId || isLoading || !nodes || !edges) return

    const payload = JSON.stringify({ nodes, edges })
    onSaveStatusChange?.("saving")

    try {
      const response = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "")
        throw new Error(errorText || "Failed to save canvas")
      }

      lastSavedRef.current = payload
      onSaveStatusChange?.("saved")
    } catch (error) {
      console.error("Canvas auto-save failed", error)
      onSaveStatusChange?.("error")
    }
  }, [edges, isLoading, nodes, onSaveStatusChange, projectId])

  useEffect(() => {
    if (onSaveRef) {
      onSaveRef(saveNow)
    }
  }, [onSaveRef, saveNow])

  useEffect(() => {
    if (!projectId || isLoading || !nodes || !edges) return

    const payload = JSON.stringify({ nodes, edges })

    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true
      lastSavedRef.current = payload
      return
    }

    if (payload === lastSavedRef.current) return

    const timeout = window.setTimeout(() => {
      void saveNow()
    }, 700)

    return () => window.clearTimeout(timeout)
  }, [edges, isLoading, nodes, projectId, saveNow])

  return { saveNow }
}
