"use client"

import { useUser } from "@clerk/nextjs"
import { LiveblocksProvider, RoomProvider, useCanRedo, useCanUndo, useMyPresence, useOthers, useRedo, useStatus, useUndo } from "@liveblocks/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import dynamic from "next/dynamic"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import {
  Background,
  BaseEdge,
  EdgeLabelRenderer,
  Handle,
  NodeToolbar,
  NodeResizer,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getSmoothStepPath,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type OnEdgesChange,
  type Node,
  type NodeProps,
  type OnNodesChange,
  type ReactFlowInstance,
} from "@xyflow/react"
import { Circle, Cylinder, Diamond, Hexagon, LayoutTemplate, Maximize, Minus, Pill, Plus, RectangleHorizontal, Redo2, Undo2, X } from "lucide-react"
import { useCanvasAutosave, type CanvasSaveStatus } from "@/hooks/use-canvas-autosave"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import "@xyflow/react/dist/style.css"

interface LiveCanvasProps {
  roomId: string
  projectName: string
  onSaveStatusChange?: (status: CanvasSaveStatus) => void
  onSaveRef?: (saveNow: () => Promise<void>) => void
}

export type CanvasShape = "rectangle" | "diamond" | "circle" | "pill" | "cylinder" | "hexagon"
const shapeDragType = "application/x-ghost-ai-shape"

interface ShapeDefinition {
  name: CanvasShape
  label: string
  width: number
  height: number
  icon: typeof RectangleHorizontal
  fillColor: string
  borderColor: string
}

const shapeDefinitions: ShapeDefinition[] = [
  { name: "rectangle", label: "Rectangle", width: 180, height: 96, icon: RectangleHorizontal, fillColor: "#083344", borderColor: "#22d3ee" },
  { name: "diamond", label: "Diamond", width: 220, height: 140, icon: Diamond, fillColor: "#451a03", borderColor: "#f59e0b" },
  { name: "circle", label: "Circle", width: 120, height: 120, icon: Circle, fillColor: "#4c0519", borderColor: "#fb7185" },
  { name: "pill", label: "Pill", width: 180, height: 72, icon: Pill, fillColor: "#2e1065", borderColor: "#a78bfa" },
  { name: "cylinder", label: "Cylinder", width: 160, height: 120, icon: Cylinder, fillColor: "#052e16", borderColor: "#4ade80" },
  { name: "hexagon", label: "Hexagon", width: 180, height: 110, icon: Hexagon, fillColor: "#172554", borderColor: "#60a5fa" },
]

const UserButton = dynamic(() => import("@clerk/nextjs").then((module) => module.UserButton), {
  ssr: false,
})

function getInitials(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter((part): part is string => Boolean(part))
  if (!parts.length) return "?"
  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?"
}

type CollaboratorUser = {
  id: string
  info: {
    displayName?: string | null
    avatarUrl?: string | null
    cursorColor?: string | null
  }
  presence: {
    cursor: { x: number; y: number } | null
    thinking: boolean
  }
  connectionId: number
}

function CollaboratorAvatar({ user, isThinking }: { user: CollaboratorUser; isThinking?: boolean }) {
  const displayName = user.info.displayName || "Collaborator"
  const hasAvatar = Boolean(user.info.avatarUrl)
  const hasCursor = Boolean(user.presence.cursor)
  const statusLabel = isThinking ? "Thinking..." : hasCursor ? "Viewing" : "Online"

  return (
    <div className="relative group" title={`${displayName} · ${statusLabel}`}>
      <div
        className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-background/80 bg-slate-800 text-[10px] font-semibold text-slate-100 shadow-sm ring-2 ring-background/70 transition-all duration-200"
        style={{ backgroundColor: user.info.cursorColor || "#334155" }}
      >
        {hasAvatar ? <img alt={displayName} className="h-full w-full object-cover" src={user.info.avatarUrl ?? undefined} /> : <span>{getInitials(displayName)}</span>}
        {(isThinking || hasCursor) && (
          <span
            aria-label={statusLabel}
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-slate-950/80 shadow-sm"
            style={{ backgroundColor: isThinking ? "#fbbf24" : user.info.cursorColor || "#22d3ee" }}
          />
        )}
      </div>
    </div>
  )
}

export interface ProjectBlockData extends Record<string, unknown> {
  label: string
  shape: CanvasShape
  backgroundColor?: string
  textColor?: string
}

export type ProjectBlock = Node<ProjectBlockData>
export interface ProjectEdgeData extends Record<string, unknown> {
  label?: string
}

export type ProjectEdge = Edge<ProjectEdgeData>
const NodeChangesContext = createContext<OnNodesChange<ProjectBlock> | null>(null)
const EdgeChangesContext = createContext<OnEdgesChange<ProjectEdge> | null>(null)

const nodeCounter = { current: 0 }

const nodeColorPalette = [
  { name: "Cyan", backgroundColor: "#083344", textColor: "#a5f3fc" },
  { name: "Amber", backgroundColor: "#451a03", textColor: "#fde68a" },
  { name: "Rose", backgroundColor: "#4c0519", textColor: "#fecdd3" },
  { name: "Violet", backgroundColor: "#2e1065", textColor: "#ddd6fe" },
  { name: "Green", backgroundColor: "#052e16", textColor: "#bbf7d0" },
  { name: "Blue", backgroundColor: "#172554", textColor: "#bfdbfe" },
]

const initialNodes: ProjectBlock[] = [
  {
    id: "project",
    position: { x: 120, y: 180 },
    data: { label: "Project brief", shape: "rectangle" },
    style: { width: 180, height: 96 },
    type: "canvasNode",
  },
  {
    id: "architecture",
    position: { x: 420, y: 180 },
    data: { label: "Architecture", shape: "rectangle" },
    style: { width: 180, height: 96 },
    type: "canvasNode",
  },
]

function ShapeVisual({ shape, selected, label, preview = false, backgroundColor, textColor }: { shape: CanvasShape; selected: boolean; label: string; preview?: boolean; backgroundColor?: string; textColor?: string }) {
  const definition = shapeDefinitions.find((candidate) => candidate.name === shape) ?? shapeDefinitions[0]
  const sharedClass = `flex h-full w-full items-center justify-center text-center text-sm font-medium text-foreground ${preview ? "opacity-80" : ""}`
  const visualStyle = {
    backgroundColor: backgroundColor ?? definition.fillColor,
    borderColor: definition.borderColor,
    color: textColor ?? "#f8fafc",
    borderWidth: selected ? 2 : 1,
  }

  if (shape === "rectangle") {
    return <div className={`${sharedClass} rounded-md border`} style={visualStyle}>{label}</div>
  }

  if (shape === "pill") {
    return <div className={`${sharedClass} rounded-full border`} style={visualStyle}>{label}</div>
  }

  if (shape === "circle") {
    return <div className={`${sharedClass} rounded-full border`} style={visualStyle}>{label}</div>
  }

  const points = shape === "diamond" ? "50,2 98,50 50,98 2,50" : "18,2 82,2 98,50 82,98 18,98 2,50"

  return (
    <div className="relative h-full w-full">
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {shape === "cylinder" ? (
          <>
            <path d="M4 16 C4 8 96 8 96 16 V84 C96 92 4 92 4 84 Z" fill={backgroundColor ?? definition.fillColor} stroke={definition.borderColor} strokeWidth={selected ? 2 : 1.5} />
            <ellipse cx="50" cy="16" rx="46" ry="8" fill={backgroundColor ?? definition.fillColor} stroke={definition.borderColor} strokeWidth={selected ? 2 : 1.5} />
          </>
        ) : (
          <polygon fill={backgroundColor ?? definition.fillColor} points={points} stroke={definition.borderColor} strokeWidth={selected ? 2 : 1.5} />
        )}
      </svg>
      <span className="relative z-10 flex h-full w-full items-center justify-center px-4 text-center text-sm font-medium" style={{ color: textColor ?? "#f8fafc" }}>{label}</span>
    </div>
  )
}

function CanvasNode({ id, data, selected }: NodeProps<ProjectBlock>) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftLabel, setDraftLabel] = useState(data.label)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const onNodesChange = useContext(NodeChangesContext)
  const { getNode } = useReactFlow<ProjectBlock>()

  function updateColor(color: (typeof nodeColorPalette)[number]) {
    if (!onNodesChange) return
    const node = getNode(id)
    if (!node) return
    onNodesChange([{ type: "replace", id, item: { ...node, data: { ...node.data, backgroundColor: color.backgroundColor, textColor: color.textColor } } }])
  }

  function commitLabel() {
    setIsEditing(false)
    if (!onNodesChange || draftLabel === data.label) return
    const node = getNode(id)
    if (!node) return
    onNodesChange([{ type: "replace", id, item: { ...node, data: { ...node.data, label: draftLabel } } }])
  }

  return (
    <>
      <NodeToolbar isVisible={Boolean(selected)} position={Position.Top} offset={12} className="nodrag nopan flex items-center gap-1 rounded-full border border-border/80 bg-card/95 p-1.5 shadow-xl backdrop-blur">
        {nodeColorPalette.map((color) => {
          const isActive = (data.backgroundColor ?? shapeDefinitions.find((shape) => shape.name === data.shape)?.fillColor) === color.backgroundColor
          return (
            <button
              key={color.name}
              aria-label={`Use ${color.name} node color`}
              className={`nodrag nopan h-5 w-5 rounded-full border-2 border-transparent transition-transform hover:scale-110 hover:shadow-[0_0_8px_var(--swatch-color)] ${isActive ? "ring-2 ring-foreground ring-offset-1 ring-offset-background" : ""}`}
              style={{ backgroundColor: color.backgroundColor, borderColor: isActive ? color.textColor : "transparent", "--swatch-color": color.textColor } as React.CSSProperties}
              title={color.name}
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => updateColor(color)}
            />
          )
        })}
      </NodeToolbar>
      <NodeResizer
        color="#64748b"
        isVisible={Boolean(selected)}
        minWidth={80}
        minHeight={48}
        handleClassName="!h-2 !w-2 !border-0 !bg-slate-500"
        lineClassName="!border-slate-500/60"
      />
      {[Position.Top, Position.Right, Position.Bottom, Position.Left].map((position) => (
        <div key={position} className="canvas-handle-group">
          <Handle className="canvas-handle !h-2 !w-2 !border-2 !border-slate-900 !bg-white" id={`${position}-target`} position={position} type="target" />
          <Handle className="canvas-handle !h-2 !w-2 !border-2 !border-slate-900 !bg-white" id={`${position}-source`} position={position} type="source" />
        </div>
      ))}
      <div
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onDoubleClick={(event) => {
          event.stopPropagation()
          setDraftLabel(data.label)
          setIsEditing(true)
          requestAnimationFrame(() => inputRef.current?.focus())
        }}
      >
        <ShapeVisual backgroundColor={data.backgroundColor} label={isEditing ? "" : data.label || "Double-click to label"} selected={Boolean(selected)} shape={data.shape ?? "rectangle"} textColor={data.textColor} />
        {isEditing && (
          <textarea
            ref={inputRef}
            className="nodrag nopan absolute inset-2 z-20 resize-none rounded border border-auth-accent/70 bg-background/90 p-2 text-center text-sm text-foreground outline-none"
            value={draftLabel}
            onChange={(event) => setDraftLabel(event.target.value)}
            onBlur={commitLabel}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault()
                setDraftLabel(data.label)
                setIsEditing(false)
              }
            }}
            onPointerDown={(event) => event.stopPropagation()}
          />
        )}
      </div>
    </>
  )
}

function CanvasEdge({ id, source, target, sourceHandleId, targetHandleId, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, data, selected }: EdgeProps<ProjectEdge>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
  const onEdgesChange = useContext(EdgeChangesContext)
  const [isEditing, setIsEditing] = useState(false)
  const [draftLabel, setDraftLabel] = useState(data?.label ?? "")
  const [isHovered, setIsHovered] = useState(false)
  const label = data?.label ?? ""

  function commitLabel() {
    setIsEditing(false)
    if (!onEdgesChange || draftLabel === label) return
    onEdgesChange([{ type: "replace", id, item: { id, source, target, sourceHandle: sourceHandleId, targetHandle: targetHandleId, type: "canvasEdge", data: { ...data, label: draftLabel } } }])
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd="url(#canvas-edge-arrow)"
        interactionWidth={18}
        style={{ stroke: selected || isHovered ? "#f8fafc" : "#cbd5e1", strokeLinecap: "round", opacity: selected || isHovered ? 1 : 0.7, strokeWidth: selected || isHovered ? 2 : 1.5 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={() => setIsEditing(true)}
      />
      <EdgeLabelRenderer>
        {(isEditing || label) && (
          <input
            autoFocus={isEditing}
            className="nodrag nopan absolute rounded border border-border bg-card px-1.5 py-0.5 text-center text-xs text-foreground outline-none"
            style={{ left: labelX, top: labelY, width: `${Math.max(2, (isEditing ? draftLabel : label).length + 1)}ch`, transform: "translate(-50%, -50%)" }}
            value={isEditing ? draftLabel : label}
            readOnly={!isEditing}
            onChange={(event) => setDraftLabel(event.target.value)}
            onBlur={commitLabel}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === "Escape") {
                event.preventDefault()
                if (event.key === "Escape") {
                  setDraftLabel(label)
                  setIsEditing(false)
                } else {
                  commitLabel()
                }
              }
            }}
            onPointerDown={(event) => event.stopPropagation()}
          />
        )}
      </EdgeLabelRenderer>
    </>
  )
}

const nodeTypes = { canvasNode: CanvasNode }
const edgeTypes = { canvasEdge: CanvasEdge }

function ShapeToolbar({ selectedNodes, selectedEdges, onDelete, onTemplates }: { selectedNodes: ProjectBlock[]; selectedEdges: ProjectEdge[]; onDelete: (params: { nodes: ProjectBlock[]; edges: ProjectEdge[] }) => void; onTemplates: () => void }) {
  const [preview, setPreview] = useState<{ shape: ShapeDefinition; x: number; y: number } | null>(null)

  function handleDragStart(event: React.DragEvent<HTMLButtonElement>, shape: ShapeDefinition) {
    const payload = JSON.stringify({ shape: shape.name, width: shape.width, height: shape.height })
    event.dataTransfer.effectAllowed = "copy"
    event.dataTransfer.setData(shapeDragType, payload)
    event.dataTransfer.setData("text/plain", payload)
  }

  return (
    <>
      {preview && (
        <div className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-1/2 opacity-70" style={{ left: preview.x, top: preview.y, width: preview.shape.width, height: preview.shape.height }}>
          <ShapeVisual label="" preview selected shape={preview.shape.name} />
        </div>
      )}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border/80 bg-card/95 p-1.5 shadow-2xl backdrop-blur">
      {shapeDefinitions.map((shape) => {
        const Icon = shape.icon
        return (
          <button
            key={shape.name}
            aria-label={`Drag ${shape.label}`}
            className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing"
            draggable
            title={shape.label}
            type="button"
            onDragStart={(event) => handleDragStart(event, shape)}
            onDrag={(event) => {
              if (event.clientX || event.clientY) setPreview({ shape, x: event.clientX, y: event.clientY })
            }}
            onDragEnd={() => setPreview(null)}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
      {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
        <>
          <div className="mx-1 h-5 w-px bg-border" />
          <button
            aria-label="Delete selected shapes"
            className="flex h-9 w-9 items-center justify-center rounded-full text-rose-400 transition-colors hover:bg-rose-500/15 hover:text-rose-300"
            title="Delete selected shapes"
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onDelete({ nodes: selectedNodes, edges: selectedEdges })}
          >
            <X className="h-4 w-4" />
          </button>
        </>
      )}
      <div className="mx-1 h-5 w-px bg-border" />
      <button
        aria-label="Open starter templates"
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        title="Starter templates"
        type="button"
        onClick={onTemplates}
      >
        <LayoutTemplate className="h-4 w-4" />
      </button>
      </div>
    </>
  )
}

function CanvasControls<NodeType extends Node>({ flow, canUndo, canRedo, undo, redo }: { flow: Pick<ReactFlowInstance<NodeType>, "zoomIn" | "zoomOut" | "fitView">; canUndo: boolean; canRedo: boolean; undo: () => void; redo: () => void }) {
  const buttonClass = "flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-35"

  return (
    <div className="absolute bottom-5 left-5 z-20 flex items-center gap-1 rounded-full border border-border/80 bg-card/95 p-1.5 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-1">
        <button aria-label="Zoom out" className={buttonClass} title="Zoom out" type="button" onClick={() => flow.zoomOut({ duration: 200 })}>
          <Minus className="h-4 w-4" />
        </button>
        <button aria-label="Fit canvas to view" className={buttonClass} title="Fit canvas to view" type="button" onClick={() => flow.fitView({ duration: 200 })}>
          <Maximize className="h-4 w-4" />
        </button>
        <button aria-label="Zoom in" className={buttonClass} title="Zoom in" type="button" onClick={() => flow.zoomIn({ duration: 200 })}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="mx-1 h-5 w-px bg-border" />
      <div className="flex items-center gap-1">
        <button aria-label="Undo" className={buttonClass} disabled={!canUndo} title="Undo" type="button" onClick={undo}>
          <Undo2 className="h-4 w-4" />
        </button>
        <button aria-label="Redo" className={buttonClass} disabled={!canRedo} title="Redo" type="button" onClick={redo}>
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function PresenceAndFlow({ projectName, projectId, onSaveStatusChange, onSaveRef }: { projectName: string; projectId: string; onSaveStatusChange?: (status: CanvasSaveStatus) => void; onSaveRef?: (saveNow: () => Promise<void>) => void }) {
  const [presence, updatePresence] = useMyPresence()
  const others = useOthers()
  const { user } = useUser()
  const tabIdRef = useRef<string>(typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`)
  const currentUserId = user?.id
  const visibleCollaborators = others.filter((other) => {
    if (other.id !== currentUserId) return true
    return other.presence.tabId !== tabIdRef.current
  })
  const status = useStatus()
  const reactFlow = useReactFlow<ProjectBlock>()
  const { screenToFlowPosition } = reactFlow

  useEffect(() => {
    updatePresence({ tabId: tabIdRef.current })
  }, [updatePresence])
  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const flow = useLiveblocksFlow<ProjectBlock>({
    storageKey: "canvas",
    nodes: { initial: initialNodes },
  })
  const { saveNow } = useCanvasAutosave({
    projectId,
    nodes: flow.nodes,
    edges: flow.edges,
    isLoading: flow.isLoading,
    onSaveStatusChange,
    onSaveRef,
  })
  useKeyboardShortcuts({ flow: reactFlow, undo, redo })

  useEffect(() => {
    if (!projectId || flow.isLoading) return

    const shouldRestoreSavedCanvas = flow.nodes.length <= initialNodes.length && flow.edges.length === 0 && flow.nodes.every((node) => initialNodes.some((initialNode) => initialNode.id === node.id))
    if (!shouldRestoreSavedCanvas) return

    let cancelled = false

    async function loadSavedCanvas() {
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`)
        if (!response.ok) return

        const payload = await response.json()
        const savedNodes = Array.isArray(payload?.nodes) ? payload.nodes : []
        const savedEdges = Array.isArray(payload?.edges) ? payload.edges : []
        if (cancelled || (!savedNodes.length && !savedEdges.length)) return

        if (savedNodes.length) {
          flow.onNodesChange(savedNodes.map((node: ProjectBlock) => ({ type: "replace", id: node.id, item: node })))
        }
        if (savedEdges.length) {
          flow.onEdgesChange(savedEdges.map((edge: ProjectEdge) => ({ type: "replace", id: edge.id, item: edge })))
        }
      } catch (error) {
        console.error("Failed to load saved canvas", error)
      }
    }

    void loadSavedCanvas()
    return () => {
      cancelled = true
    }
  }, [flow.edges, flow.isLoading, flow.nodes, projectId])

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
    const payload = event.dataTransfer.getData(shapeDragType) || event.dataTransfer.getData("text/plain")
    if (!payload) return

    let shape: { shape?: unknown; width?: unknown; height?: unknown }
    try {
      shape = JSON.parse(payload)
    } catch {
      return
    }

    const definition = shapeDefinitions.find((candidate) => candidate.name === shape.shape)
    const width = typeof shape.width === "number" ? shape.width : Number(shape.width)
    const height = typeof shape.height === "number" ? shape.height : Number(shape.height)
    if (!definition || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return

    nodeCounter.current += 1
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
    flow.onNodesChange([
      {
        type: "add",
        item: {
          id: `${definition.name}-${Date.now()}-${nodeCounter.current}`,
          type: "canvasNode",
          position: { x: position.x - width / 2, y: position.y - height / 2 },
          data: { label: "", shape: definition.name },
          style: { width, height },
        },
      },
    ])
  }

  function importTemplate(template: CanvasTemplate) {
    const stamp = Date.now()
    const nodeIds = new Map(template.nodes.map((node, index) => [node.id, `template-${stamp}-node-${index}`]))
    flow.onNodesChange(template.nodes.map((node, index) => ({
      type: "add",
      item: { ...node, id: nodeIds.get(node.id) ?? `template-${stamp}-node-${index}`, selected: false },
    })))
    flow.onEdgesChange(template.edges.map((edge, index) => ({
      type: "add",
      item: { ...edge, id: `template-${stamp}-edge-${index}`, type: "canvasEdge", source: nodeIds.get(edge.source) ?? edge.source, target: nodeIds.get(edge.target) ?? edge.target },
    })) as never)
    setIsTemplatesOpen(false)
  }
  if (flow.isLoading || !flow.nodes) {
    return <div className="flex h-full min-h-0 items-center justify-center text-sm text-muted-foreground">Loading collaborative canvas...</div>
  }

  const selectedNodes = (flow.nodes ?? []).filter((node) => node.selected)
  const selectedEdges = (flow.edges ?? []).filter((edge) => edge.selected)

  const handleDeleteSelected = () => {
    if (!selectedNodes.length && !selectedEdges.length) return

    if (selectedNodes.length) {
      flow.onNodesChange(selectedNodes.map((node) => ({ type: "remove", id: node.id })))
    }
    if (selectedEdges.length) {
      flow.onEdgesChange(selectedEdges.map((edge) => ({ type: "remove", id: edge.id })))
    }
  }

  return (
    <div
      className="relative h-full min-h-0 w-full bg-background/40"
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "copy"
      }}
      onDrop={handleDrop}
    >
      <div className="pointer-events-none absolute left-5 top-5 z-10 rounded-lg border bg-card/90 px-3 py-2 backdrop-blur">
        <p className="text-xs font-semibold">{projectName}</p>
        <p className="text-[11px] text-muted-foreground">
          {status === "connected" ? "Connected" : status === "connecting" ? "Connecting..." : "Connection unavailable"}
          {others.length ? ` · ${others.length} collaborator${others.length === 1 ? "" : "s"} online` : ""}
        </p>
      </div>

      <div className="absolute right-5 top-5 z-30 flex items-center gap-2">
        {visibleCollaborators.length > 0 && (
          <div className="flex items-center">
            {visibleCollaborators.slice(0, 5).map((other, index) => (
              <div key={other.id} className={index > 0 ? "-ml-2" : ""}>
                <CollaboratorAvatar isThinking={Boolean(other.presence.thinking)} user={other} />
              </div>
            ))}
            {visibleCollaborators.length > 5 && (
              <div className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-background/80 bg-slate-800 text-[10px] font-semibold text-slate-100 ring-2 ring-background/70">
                +{visibleCollaborators.length - 5}
              </div>
            )}
          </div>
        )}
        {visibleCollaborators.length > 0 && <div className="h-7 w-px bg-border/80" />}
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm">
          <UserButton appearance={{ elements: { userButtonBox: "h-8 w-8", userButtonTrigger: "h-8 w-8" } }} />
        </div>
      </div>

      <NodeChangesContext.Provider value={flow.onNodesChange}>
        <EdgeChangesContext.Provider value={flow.onEdgesChange as OnEdgesChange<ProjectEdge>}>
        <svg aria-hidden="true" className="absolute h-0 w-0">
          <defs>
            <marker id="canvas-edge-arrow" markerHeight="7" markerWidth="7" orient="auto-start-reverse" refX="6" refY="3.5" viewBox="0 0 7 7">
              <path d="M 0 0 L 7 3.5 L 0 7 z" fill="#cbd5e1" />
            </marker>
          </defs>
        </svg>
        <ReactFlow
        fitView
        defaultEdgeOptions={{ type: "canvasEdge" }}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        nodes={flow.nodes}
        edges={flow.edges}
        onMouseLeave={() => updatePresence({ tabId: tabIdRef.current, cursor: null })}
        onMouseMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect()
          updatePresence({ tabId: tabIdRef.current, cursor: { x: event.clientX - bounds.left, y: event.clientY - bounds.top } })
        }}
        onNodesChange={flow.onNodesChange}
        onEdgesChange={flow.onEdgesChange}
        onConnect={(connection) => flow.onEdgesChange([{ type: "add", item: { ...connection, id: `edge-${Date.now()}`, type: "canvasEdge", data: { label: "" } } } as never])}
        onDelete={handleDeleteSelected}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#334155" gap={28} size={1} />
        {visibleCollaborators.map((other) => {
          const cursor = other.presence.cursor
          if (!cursor) return null

          const badgeText = other.presence.thinking ? "Thinking..." : "Viewing"

          return (
            <div key={other.connectionId} className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: cursor.x, top: cursor.y }}>
              <div className="relative flex items-start gap-2">
                <div className="h-4 w-4 rotate-45 rounded-[3px] border border-slate-950/80 shadow-[0_0_12px_rgba(15,23,42,0.6)]" style={{ backgroundColor: other.info.cursorColor || "#22d3ee" }} />
                <div className="inline-flex items-center gap-1 rounded-full border border-slate-950/80 px-2 py-0.5 text-[10px] font-medium text-slate-950 shadow-sm" style={{ backgroundColor: other.info.cursorColor || "#22d3ee" }}>
                  <span>{other.info.displayName || "Collaborator"}</span>
                  {other.presence.thinking && <span className="text-[9px] font-semibold uppercase tracking-[0.16em] opacity-75">{badgeText}</span>}
                </div>
              </div>
            </div>
          )
        })}
        </ReactFlow>
          </EdgeChangesContext.Provider>
      </NodeChangesContext.Provider>
      <ShapeToolbar onTemplates={() => setIsTemplatesOpen(true)} selectedNodes={selectedNodes} selectedEdges={selectedEdges} onDelete={handleDeleteSelected} />
      <StarterTemplatesModal open={isTemplatesOpen} onImport={importTemplate} onOpenChange={setIsTemplatesOpen} />
      <CanvasControls flow={reactFlow} canRedo={canRedo} canUndo={canUndo} redo={redo} undo={undo} />
      <button className="absolute bottom-20 left-5 z-10 rounded-md border bg-card/90 px-3 py-2 text-xs text-muted-foreground backdrop-blur hover:bg-accent" type="button" onClick={() => updatePresence({ tabId: tabIdRef.current, thinking: !presence.thinking })}>
        {presence.thinking ? "Thinking..." : "Set thinking status"}
      </button>
      <button className="absolute bottom-20 right-5 z-10 rounded-md border bg-card/90 px-3 py-2 text-xs text-muted-foreground backdrop-blur hover:bg-accent" type="button" onClick={() => void saveNow()}>
        Save now
      </button>
    </div>
  )
}

export function LiveCanvas({ roomId, projectName, onSaveStatusChange, onSaveRef }: LiveCanvasProps) {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return <div className="flex h-full min-h-0 items-center justify-center text-sm text-muted-foreground">Loading workspace...</div>
  }

  if (!user) {
    return <div className="flex h-full min-h-0 items-center justify-center text-sm text-muted-foreground">Sign in to open this workspace.</div>
  }

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider key={`${roomId}-${user.id}`} id={roomId} initialPresence={{ cursor: null, thinking: false, tabId: "" }} initialStorage={{} as never}>
        <ReactFlowProvider>
          <PresenceAndFlow projectId={roomId} projectName={projectName} onSaveStatusChange={onSaveStatusChange} onSaveRef={onSaveRef} />
        </ReactFlowProvider>
      </RoomProvider>
    </LiveblocksProvider>
  )
}