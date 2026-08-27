"use client"

import { ArrowRight, Box, Database, Diamond, Hexagon, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CANVAS_TEMPLATES, type CanvasTemplate } from "@/components/editor/starter-templates"
import type { CanvasShape } from "@/components/editor/live-canvas"

interface StarterTemplatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (template: CanvasTemplate) => void
}

const shapeIcons: Record<CanvasShape, LucideIcon> = { rectangle: Box, diamond: Diamond, circle: Box, pill: Box, cylinder: Database, hexagon: Hexagon }

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const width = 340
  const height = 150
  const bounds = template.nodes.reduce((result, current) => ({
    minX: Math.min(result.minX, current.position.x),
    minY: Math.min(result.minY, current.position.y),
    maxX: Math.max(result.maxX, current.position.x + Number(current.style?.width ?? 180)),
    maxY: Math.max(result.maxY, current.position.y + Number(current.style?.height ?? 82)),
  }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })
  const scale = Math.min((width - 28) / (bounds.maxX - bounds.minX), (height - 28) / (bounds.maxY - bounds.minY), 1)
  const point = (x: number, y: number) => ({ x: 14 + (x - bounds.minX) * scale, y: 14 + (y - bounds.minY) * scale })

  return <svg aria-label={`${template.name} diagram preview`} className="h-[150px] w-full rounded-md border border-border/70 bg-background/70" role="img" viewBox={`0 0 ${width} ${height}`}>
    {template.edges.map((current) => {
      const source = template.nodes.find((node) => node.id === current.source)
      const target = template.nodes.find((node) => node.id === current.target)
      if (!source || !target) return null
      const sourcePoint = point(source.position.x + Number(source.style?.width ?? 180) / 2, source.position.y + Number(source.style?.height ?? 82) / 2)
      const targetPoint = point(target.position.x + Number(target.style?.width ?? 180) / 2, target.position.y + Number(target.style?.height ?? 82) / 2)
      return <line key={current.id} stroke="#64748b" strokeWidth="1.5" x1={sourcePoint.x} x2={targetPoint.x} y1={sourcePoint.y} y2={targetPoint.y} />
    })}
    {template.nodes.map((current) => {
      const nodeWidth = Number(current.style?.width ?? 180) * scale
      const nodeHeight = Number(current.style?.height ?? 82) * scale
      const position = point(current.position.x, current.position.y)
      const Icon = shapeIcons[current.data.shape]
      const fill = current.data.backgroundColor ?? "#172554"
      const stroke = current.data.textColor ?? "#bfdbfe"
      const shape = current.data.shape
      return <g key={current.id} transform={`translate(${position.x} ${position.y})`}>
        {shape === "circle" ? <ellipse cx={nodeWidth / 2} cy={nodeHeight / 2} fill={fill} rx={nodeWidth / 2 - 1} ry={nodeHeight / 2 - 1} stroke={stroke} strokeWidth="1" /> : shape === "diamond" ? <polygon fill={fill} points={`${nodeWidth / 2},1 ${nodeWidth - 1},${nodeHeight / 2} ${nodeWidth / 2},${nodeHeight - 1} 1,${nodeHeight / 2}`} stroke={stroke} strokeWidth="1" /> : shape === "hexagon" ? <polygon fill={fill} points={`${nodeWidth * 0.18},1 ${nodeWidth * 0.82},1 ${nodeWidth - 1},${nodeHeight / 2} ${nodeWidth * 0.82},${nodeHeight - 1} ${nodeWidth * 0.18},${nodeHeight - 1} 1,${nodeHeight / 2}`} stroke={stroke} strokeWidth="1" /> : shape === "cylinder" ? <path d={`M1 10 C1 4 ${nodeWidth - 1} 4 ${nodeWidth - 1} 10 V${nodeHeight - 10} C${nodeWidth - 1} ${nodeHeight - 4} 1 ${nodeHeight - 4} 1 ${nodeHeight - 10} Z`} fill={fill} stroke={stroke} strokeWidth="1" /> : <rect fill={fill} height={nodeHeight - 2} rx={shape === "pill" ? (nodeHeight - 2) / 2 : 5} stroke={stroke} strokeWidth="1" width={nodeWidth - 2} x="1" y="1" />}
        <foreignObject height={nodeHeight} width={nodeWidth}>
          <div className="flex h-full w-full items-center justify-center gap-1 overflow-hidden px-1 text-center text-[8px] font-medium" style={{ color: current.data.textColor ?? "#f8fafc" }}>
            <Icon className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{current.data.label}</span>
          </div>
        </foreignObject>
      </g>
    })}
  </svg>
}

export function StarterTemplatesModal({ open, onOpenChange, onImport }: StarterTemplatesModalProps) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Starter templates</DialogTitle>
        <DialogDescription>Choose a technical architecture to add to this canvas.</DialogDescription>
      </DialogHeader>
      <div className="grid max-h-[min(65vh,620px)] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
        {CANVAS_TEMPLATES.map((template) => <article className="space-y-3 rounded-lg border border-border/80 bg-background/35 p-3" key={template.id}>
          <TemplatePreview template={template} />
          <div className="min-h-16">
            <h3 className="text-sm font-semibold">{template.name}</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{template.description}</p>
          </div>
          <Button className="w-full" size="sm" type="button" onClick={() => onImport(template)}>Import template <ArrowRight /></Button>
        </article>)}
      </div>
    </DialogContent>
  </Dialog>
}