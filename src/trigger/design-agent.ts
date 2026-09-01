import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { logger, task } from "@trigger.dev/sdk";

import { getLiveblocksClient } from "@/lib/liveblocks";

export type DesignAgentInput = {
  prompt: string;
  roomId: string;
  projectId: string;
};

const allowedShapes = ["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"] as const;
const allowedColors = [
  { name: "Cyan", backgroundColor: "#083344", textColor: "#a5f3fc" },
  { name: "Amber", backgroundColor: "#451a03", textColor: "#fde68a" },
  { name: "Rose", backgroundColor: "#4c0519", textColor: "#fecdd3" },
  { name: "Violet", backgroundColor: "#2e1065", textColor: "#ddd6fe" },
  { name: "Green", backgroundColor: "#052e16", textColor: "#bbf7d0" },
  { name: "Blue", backgroundColor: "#172554", textColor: "#bfdbfe" },
] as const;

const defaultNodeSizes: Record<(typeof allowedShapes)[number], { width: number; height: number }> = {
  rectangle: { width: 180, height: 96 },
  diamond: { width: 220, height: 140 },
  circle: { width: 120, height: 120 },
  pill: { width: 180, height: 72 },
  cylinder: { width: 160, height: 120 },
  hexagon: { width: 180, height: 110 },
};

function sanitizeNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function normalizeShape(value: unknown): (typeof allowedShapes)[number] {
  return allowedShapes.includes(value as (typeof allowedShapes)[number])
    ? (value as (typeof allowedShapes)[number])
    : "rectangle";
}

function normalizeColor(value: unknown) {
  const match = allowedColors.find((candidate) => candidate.name.toLowerCase() === String(value ?? "").toLowerCase());
  return match ?? allowedColors[0];
}

async function ensureStatusFeed(client: ReturnType<typeof getLiveblocksClient>, roomId: string) {
  try {
    await client.getOrCreateRoom(roomId, { defaultAccesses: [] });

    try {
      await client.getFeed({ roomId, feedId: "ai-status-feed" });
      return true;
    } catch {
      try {
        await client.createFeed({
          roomId,
          feedId: "ai-status-feed",
          metadata: {
            name: "AI Status",
            type: "agent-status",
          },
        });
        return true;
      } catch (error) {
        logger.warn("Failed to create AI status feed", {
          roomId,
          error: error instanceof Error ? error.message : String(error),
        });
        return false;
      }
    }
  } catch (error) {
    logger.warn("Failed to ensure Liveblocks room exists for AI status feed", {
      roomId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

async function pushStatus(
  client: ReturnType<typeof getLiveblocksClient>,
  roomId: string,
  phase: "start" | "processing" | "complete" | "error",
  message: string,
  details: Record<string, unknown> = {}
) {
  const feedReady = await ensureStatusFeed(client, roomId);
  if (!feedReady) return;

  try {
    await client.createFeedMessage({
      roomId,
      feedId: "ai-status-feed",
      data: {
        type: "ai-status",
        phase,
        text: message,
        message,
        timestamp: new Date().toISOString(),
        ...details,
      },
    });
  } catch (error) {
    logger.warn("Failed to publish AI status update", {
      roomId,
      phase,
      message,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function setAIPresence(
  client: ReturnType<typeof getLiveblocksClient>,
  roomId: string,
  { cursor = null, thinking = false }: { cursor?: { x: number; y: number } | null; thinking?: boolean }
) {
  try {
    await client.getOrCreateRoom(roomId, { defaultAccesses: [] });
    await client.setPresence(roomId, {
      userId: "ghost-ai-agent",
      data: {
        cursor,
        thinking,
        tabId: "ghost-ai-agent",
      },
      userInfo: {
        name: "Ghost AI",
        color: "#f59e0b",
      },
      ttl: 120,
    });
  } catch (error) {
    logger.warn("Failed to update AI presence", {
      roomId,
      thinking,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function parseDesignPlan(text: string) {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  const candidate = start >= 0 && end > start ? trimmed.slice(start, end + 1) : trimmed;

  try {
    const parsed = JSON.parse(candidate);
    if (!parsed || typeof parsed !== "object") {
      return { summary: "Generated a collaborative canvas plan.", actions: [] };
    }

    const actions = Array.isArray(parsed.actions) ? parsed.actions : [];
    return {
      summary: typeof parsed.summary === "string" && parsed.summary.trim() ? parsed.summary : "Updated the canvas based on the requested design.",
      actions: actions.filter((action: unknown): action is Record<string, unknown> => Boolean(action && typeof action === "object")),
    };
  } catch {
    return { summary: "Generated a collaborative canvas plan.", actions: [] };
  }
}

function toCanvasAction(action: Record<string, unknown>) {
  const type = typeof action.type === "string" ? action.type : "";

  if (type === "add-node") {
    const label = typeof action.label === "string" ? action.label : "New component";
    const shape = normalizeShape(action.shape);
    const color = normalizeColor(action.color ?? action.backgroundColor ?? action.textColor);
    const size = defaultNodeSizes[shape];
    return {
      type: "add-node" as const,
      id: typeof action.id === "string" ? action.id : `ai-node-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      label,
      shape,
      color: color.name,
      backgroundColor: color.backgroundColor,
      textColor: color.textColor,
      position: {
        x: sanitizeNumber((action.position as any)?.x ?? 120, 120, -5000, 5000),
        y: sanitizeNumber((action.position as any)?.y ?? 140, 140, -5000, 5000),
      },
      width: sanitizeNumber(action.width, size.width, 80, 700),
      height: sanitizeNumber(action.height, size.height, 48, 700),
    };
  }

  if (type === "move-node") {
    return {
      type: "move-node" as const,
      id: typeof action.id === "string" ? action.id : "",
      position: {
        x: sanitizeNumber((action.position as any)?.x ?? 0, 0, -5000, 5000),
        y: sanitizeNumber((action.position as any)?.y ?? 0, 0, -5000, 5000),
      },
    };
  }

  if (type === "resize-node") {
    return {
      type: "resize-node" as const,
      id: typeof action.id === "string" ? action.id : "",
      width: sanitizeNumber(action.width, 180, 80, 700),
      height: sanitizeNumber(action.height, 96, 48, 700),
    };
  }

  if (type === "update-node-data") {
    return {
      type: "update-node-data" as const,
      id: typeof action.id === "string" ? action.id : "",
      label: typeof action.label === "string" ? action.label : undefined,
      backgroundColor: typeof action.backgroundColor === "string" ? action.backgroundColor : undefined,
      textColor: typeof action.textColor === "string" ? action.textColor : undefined,
      shape: typeof action.shape === "string" ? normalizeShape(action.shape) : undefined,
    };
  }

  if (type === "delete-node") {
    return { type: "delete-node" as const, id: typeof action.id === "string" ? action.id : "" };
  }

  if (type === "add-edge") {
    return {
      type: "add-edge" as const,
      id: typeof action.id === "string" ? action.id : `ai-edge-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      source: typeof action.source === "string" ? action.source : "",
      target: typeof action.target === "string" ? action.target : "",
      label: typeof action.label === "string" ? action.label : "",
    };
  }

  if (type === "delete-edge") {
    return { type: "delete-edge" as const, id: typeof action.id === "string" ? action.id : "" };
  }

  return null;
}

async function applyCanvasChanges(client: ReturnType<typeof getLiveblocksClient>, roomId: string, actions: Array<Record<string, unknown>>) {
  const normalizedActions = actions
    .map((action) => toCanvasAction(action))
    .filter((action): action is Exclude<typeof action, null> => Boolean(action));

  if (!normalizedActions.length) {
    return { applied: 0 };
  }

  await client.mutateStorage(roomId, async ({ root }) => {
    const mutableRoot = root as any;
    let flow = mutableRoot.get("canvas");

    if (!flow) {
      mutableRoot.set("canvas", {
        nodes: {},
        edges: {},
      });
      flow = mutableRoot.get("canvas");
    }

    const nodes = flow?.get ? flow.get("nodes") : undefined;
    const edges = flow?.get ? flow.get("edges") : undefined;

    for (const action of normalizedActions) {
      if (!nodes || !edges) continue;

      if (action.type === "add-node") {
        const fallbackShape = defaultNodeSizes[action.shape];
        const node = {
          id: action.id,
          type: "canvasNode",
          position: action.position,
          data: {
            label: action.label,
            shape: action.shape,
            backgroundColor: action.backgroundColor,
            textColor: action.textColor,
          },
          style: {
            width: action.width ?? fallbackShape.width,
            height: action.height ?? fallbackShape.height,
          },
        };
        nodes.set(action.id, node);
      }

      if (action.type === "move-node") {
        const current = nodes.get(action.id);
        if (!current) continue;
        nodes.set(action.id, { ...current, position: action.position });
      }

      if (action.type === "resize-node") {
        const current = nodes.get(action.id);
        if (!current) continue;
        nodes.set(action.id, { ...current, style: { ...current.style, width: action.width, height: action.height } });
      }

      if (action.type === "update-node-data") {
        const current = nodes.get(action.id);
        if (!current) continue;
        const nextData = { ...current.data };
        if (action.label !== undefined) nextData.label = action.label;
        if (action.backgroundColor !== undefined) nextData.backgroundColor = action.backgroundColor;
        if (action.textColor !== undefined) nextData.textColor = action.textColor;
        if (action.shape !== undefined) nextData.shape = action.shape;
        nodes.set(action.id, { ...current, data: nextData });
      }

      if (action.type === "delete-node") {
        nodes.delete(action.id);
      }

      if (action.type === "add-edge") {
        if (!action.source || !action.target) continue;
        edges.set(action.id, {
          id: action.id,
          type: "canvasEdge",
          source: action.source,
          target: action.target,
          data: { label: action.label ?? "" },
        });
      }

      if (action.type === "delete-edge") {
        edges.delete(action.id);
      }
    }
  });

  return { applied: normalizedActions.length };
}

export const designAgent = task({
  id: "design-agent",
  run: async (payload: DesignAgentInput, { ctx }) => {
    const client = getLiveblocksClient();
    const { prompt, roomId, projectId } = payload;

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable.");
    }

    logger.log("Design agent request received", {
      prompt,
      roomId,
      projectId,
      runId: ctx.run.id,
    });

    try {
      await setAIPresence(client, roomId, { cursor: { x: 120, y: 120 }, thinking: true });
      await pushStatus(client, roomId, "start", `Starting design generation for ${projectId}`, {
        projectId,
        roomId,
        promptPreview: prompt.slice(0, 140),
      });

      const result = await generateText({
        model: google("gemini-2.5-flash"),
        system: `You are Ghost AI, a collaborative architecture designer. Generate a diagram plan for the requested product or system.

Rules:
- Return valid JSON only.
- Structure: { "summary": "...", "actions": [ ... ] }
- Actions can only use these types: add-node, move-node, resize-node, update-node-data, delete-node, add-edge, delete-edge.
- Allowed node shapes: rectangle, diamond, circle, pill, cylinder, hexagon.
- Use only these colors: Cyan (#083344/#a5f3fc), Amber (#451a03/#fde68a), Rose (#4c0519/#fecdd3), Violet (#2e1065/#ddd6fe), Green (#052e16/#bbf7d0), Blue (#172554/#bfdbfe).
- Keep layouts organized with consistent vertical spacing, left-to-right flows, and clear component relationships.
- Prefer a modest number of actions: 3-12 total actions, with realistic node IDs and flow connections.
- Ensure each add-node includes label, shape, and color name.
- Ensure add-edge and delete-edge use valid node ids from the working diagram.
- Do not include markdown fences or commentary outside the JSON object.`,
        prompt: `Design a system for this request: ${prompt}`,
      });

      await pushStatus(client, roomId, "processing", "Gemini is turning the prompt into canvas actions", {
        promptPreview: prompt.slice(0, 120),
      });

      const { summary, actions } = parseDesignPlan(result.text);
      const filtered = actions.filter((action: unknown) => {
        const parsed = toCanvasAction(action as Record<string, unknown>);
        return parsed && (parsed.type !== "move-node" || parsed.id) && (parsed.type !== "delete-node" || parsed.id) && (parsed.type !== "delete-edge" || parsed.id);
      });

      const { applied } = await applyCanvasChanges(client, roomId, filtered as Array<Record<string, unknown>>);

      await pushStatus(client, roomId, "complete", summary, {
        projectId,
        roomId,
        actionsApplied: applied,
      });

      await setAIPresence(client, roomId, { cursor: null, thinking: false });

      logger.log("Design agent completed successfully", {
        roomId,
        projectId,
        summary,
        actionsApplied: applied,
        runId: ctx.run.id,
      });

      return {
        ok: true,
        summary,
        actionsApplied: applied,
        roomId,
        projectId,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown design generation error";
      logger.error("Design agent failed", {
        roomId,
        projectId,
        prompt,
        message,
        runId: ctx.run.id,
      });

      await pushStatus(client, roomId, "error", "Design generation failed while updating the canvas", {
        projectId,
        roomId,
        error: message,
      });
      await setAIPresence(client, roomId, { cursor: null, thinking: false });

      return {
        ok: false,
        error: message,
        roomId,
        projectId,
      };
    }
  },
});
