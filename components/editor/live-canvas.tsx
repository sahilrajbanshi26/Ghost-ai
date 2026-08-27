"use client"

import { LiveblocksProvider, RoomProvider, useMyPresence, useOthers, useStatus } from "@liveblocks/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import { Circle, Cylinder, Diamond, Hexagon, Pill, RectangleHorizontal } from "lucide-react"
import "@xyflow/react/dist/style.css"

interface LiveCanvasProps {
  roomId: string
  projectName: string
}

type CanvasShape = "rectangle" | "diamond" | "circle" | "pill" | "cylinder" | "hexagon"
const shapeDragType = "application/x-ghost-ai-shape"

interface ShapeDefinition {
  name: CanvasShape
  label: string
  width: number
  height: number
  icon: typeof RectangleHorizontal
}

const shapeDefinitions: ShapeDefinition[] = [
  { name: "rectangle", label: "Rectangle", width: 180, height: 96, icon: RectangleHorizontal },
  { name: "diamond", label: "Diamond", width: 220, height: 140, icon: Diamond },
  { name: "circle", label: "Circle", width: 120, height: 120, icon: Circle },
  { name: "pill", label: "Pill", width: 180, height: 72, icon: Pill },
  { name: "cylinder", label: "Cylinder", width: 160, height: 120, icon: Cylinder },
  { name: "hexagon", label: "Hexagon", width: 180, height: 110, icon: Hexagon },
]

interface ProjectBlockData extends Record<string, unknown> {
  label: string
  shape: CanvasShape
}

type ProjectBlock = Node<ProjectBlockData>

const nodeCounter = { current: 0 }

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

function CanvasNode({ data }: NodeProps<ProjectBlock>) {
  return (
    <>
      <Handle className="!h-2 !w-2 !border-0 !bg-auth-accent" position={Position.Top} type="target" />
      <div className="nodrag flex h-full w-full cursor-grab items-center justify-center rounded-lg border border-auth-accent/70 bg-card px-4 py-3 text-center text-sm font-medium text-foreground shadow-lg active:cursor-grabbing">
        {data.label}
      </div>
      <Handle className="!h-2 !w-2 !border-0 !bg-auth-accent" position={Position.Bottom} type="source" />
    </>
  )
}

const nodeTypes = { canvasNode: CanvasNode }

function ShapeToolbar() {
  function handleDragStart(event: React.DragEvent<HTMLButtonElement>, shape: ShapeDefinition) {
    const payload = JSON.stringify({ shape: shape.name, width: shape.width, height: shape.height })
    event.dataTransfer.effectAllowed = "copy"
    event.dataTransfer.setData(shapeDragType, payload)
    event.dataTransfer.setData("text/plain", payload)
  }

  return (
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
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}
function PresenceAndFlow({ projectName }: { projectName: string }) {
  const [presence, updatePresence] = useMyPresence()
  const others = useOthers()
  const status = useStatus()
  const { screenToFlowPosition } = useReactFlow()
  const flow = useLiveblocksFlow<ProjectBlock>({
    storageKey: "canvas",
    nodes: { initial: initialNodes },
  })

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
  if (flow.isLoading) {
    return <div className="flex h-full min-h-0 items-center justify-center text-sm text-muted-foreground">Loading collaborative canvas...</div>
  }

  return (
    <div
      className="relative h-full min-h-0 w-full bg-background/40"
      onPointerLeave={() => updatePresence({ cursor: null })}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        updatePresence({ cursor: { x: event.clientX - bounds.left, y: event.clientY - bounds.top } })
      }}
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
      <ReactFlow
        fitView
        nodeTypes={nodeTypes}
        nodes={flow.nodes}
        edges={flow.edges}
        onNodesChange={flow.onNodesChange}
        onEdgesChange={flow.onEdgesChange}
        onConnect={flow.onConnect}
        onDelete={flow.onDelete}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#334155" gap={28} size={1} />
        <Controls />
        <MiniMap nodeColor="#22d3ee" />
      </ReactFlow>
      <ShapeToolbar />
      <button className="absolute bottom-5 left-5 z-10 rounded-md border bg-card/90 px-3 py-2 text-xs text-muted-foreground backdrop-blur hover:bg-accent" type="button" onClick={() => updatePresence({ isThinking: !presence.isThinking })}>
        {presence.isThinking ? "Thinking..." : "Set thinking status"}
      </button>
    </div>
  )
}

export function LiveCanvas({ roomId, projectName }: LiveCanvasProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider id={roomId} initialPresence={{ cursor: null, isThinking: false }} initialStorage={{} as never}>
        <ReactFlowProvider>
          <PresenceAndFlow projectName={projectName} />
        </ReactFlowProvider>
      </RoomProvider>
    </LiveblocksProvider>
  )
}