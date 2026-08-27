import type { Edge, Node } from "@xyflow/react"

import type { CanvasShape, ProjectBlockData, ProjectEdgeData } from "@/components/editor/live-canvas"

export type CanvasTemplate = {
  id: string
  name: string
  description: string
  nodes: Node<ProjectBlockData>[]
  edges: Edge<ProjectEdgeData>[]
}

const node = (id: string, label: string, shape: CanvasShape, x: number, y: number, backgroundColor: string, textColor: string, width = 180, height = 82): Node<ProjectBlockData> => ({
  id,
  type: "canvasNode",
  position: { x, y },
  data: { label, shape, backgroundColor, textColor },
  style: { width, height },
})

const edge = (id: string, source: string, target: string, label?: string): Edge<ProjectEdgeData> => ({
  id,
  source,
  target,
  type: "canvasEdge",
  data: label ? { label } : { label: "" },
})

const cyan = ["#083344", "#a5f3fc"] as const
const amber = ["#451a03", "#fde68a"] as const
const rose = ["#4c0519", "#fecdd3"] as const
const violet = ["#2e1065", "#ddd6fe"] as const
const green = ["#052e16", "#bbf7d0"] as const
const blue = ["#172554", "#bfdbfe"] as const

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices Mesh",
    description: "An API gateway routes traffic through independently deployable services backed by shared platform infrastructure.",
    nodes: [node("gateway", "API Gateway", "hexagon", 40, 130, ...blue), node("users", "User Service", "rectangle", 300, 30, ...cyan), node("orders", "Order Service", "rectangle", 300, 140, ...amber), node("payments", "Payment Service", "rectangle", 300, 250, ...rose), node("database", "Data Stores", "cylinder", 590, 140, ...green, 170, 100)],
    edges: [edge("gateway-users", "gateway", "users"), edge("gateway-orders", "gateway", "orders"), edge("gateway-payments", "gateway", "payments"), edge("users-data", "users", "database"), edge("orders-data", "orders", "database"), edge("payments-data", "payments", "database")],
  },
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description: "Source changes move through automated checks, an artifact registry, and staged deployments into production.",
    nodes: [node("commit", "Commit", "pill", 30, 140, ...violet), node("build", "Build", "rectangle", 250, 140, ...blue), node("test", "Test Suite", "diamond", 470, 112, ...amber, 190, 110), node("registry", "Artifact Registry", "cylinder", 720, 140, ...green, 180, 100), node("production", "Production", "hexagon", 980, 140, ...rose)],
    edges: [edge("commit-build", "commit", "build"), edge("build-test", "build", "test"), edge("test-registry", "test", "registry", "pass"), edge("registry-production", "registry", "production", "deploy")],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "Producers publish domain events to a broker while independent consumers process them asynchronously.",
    nodes: [node("producer", "Order API", "rectangle", 40, 140, ...cyan), node("broker", "Event Bus", "cylinder", 300, 130, ...amber, 170, 100), node("search", "Search Indexer", "rectangle", 590, 30, ...blue), node("email", "Notifications", "rectangle", 590, 145, ...rose), node("analytics", "Analytics", "rectangle", 590, 260, ...violet)],
    edges: [edge("producer-broker", "producer", "broker", "publish"), edge("broker-search", "broker", "search"), edge("broker-email", "broker", "email"), edge("broker-analytics", "broker", "analytics")],
  },
  {
    id: "zero-trust",
    name: "Zero-Trust Access",
    description: "Every request is authenticated and authorized before reaching protected services and data boundaries.",
    nodes: [node("client", "Client", "circle", 40, 140, ...violet, 110, 110), node("identity", "Identity Provider", "pill", 240, 140, ...blue), node("policy", "Policy Engine", "diamond", 470, 112, ...amber, 190, 110), node("service", "Protected API", "hexagon", 740, 140, ...cyan), node("data", "Encrypted Data", "cylinder", 1000, 140, ...green, 170, 100)],
    edges: [edge("client-identity", "client", "identity"), edge("identity-policy", "identity", "policy"), edge("policy-service", "policy", "service", "allow / deny"), edge("service-data", "service", "data")],
  },
  {
    id: "observability",
    name: "Observability Stack",
    description: "Application telemetry flows through collection and aggregation into searchable metrics, traces, and alerts.",
    nodes: [node("app", "Application", "rectangle", 40, 140, ...cyan), node("collector", "Telemetry Collector", "hexagon", 300, 140, ...blue), node("metrics", "Metrics", "cylinder", 600, 30, ...green, 160, 96), node("traces", "Traces", "cylinder", 600, 145, ...violet, 160, 96), node("alerts", "Alerting", "diamond", 600, 260, ...rose, 160, 100)],
    edges: [edge("app-collector", "app", "collector", "OTLP"), edge("collector-metrics", "collector", "metrics"), edge("collector-traces", "collector", "traces"), edge("collector-alerts", "collector", "alerts")],
  },
]