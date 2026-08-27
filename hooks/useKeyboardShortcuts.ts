"use client"

import { useEffect } from "react"
import type { ReactFlowInstance } from "@xyflow/react"

type KeyboardShortcutsOptions = {
  flow: Pick<ReactFlowInstance, "zoomIn" | "zoomOut">
  undo: () => void
  redo: () => void
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.matches("input, textarea, select, [contenteditable='true']") || Boolean(target.closest("[contenteditable='true']"))
}

export function useKeyboardShortcuts({ flow, undo, redo }: KeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return

      const commandKey = event.metaKey || event.ctrlKey
      if (commandKey && event.key.toLowerCase() === "z") {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
        return
      }

      if (commandKey && event.key.toLowerCase() === "y") {
        event.preventDefault()
        redo()
        return
      }

      if (!commandKey && (event.key === "+" || event.key === "=")) {
        event.preventDefault()
        flow.zoomIn({ duration: 200 })
        return
      }

      if (!commandKey && event.key === "-") {
        event.preventDefault()
        flow.zoomOut({ duration: 200 })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [flow, redo, undo])
}
