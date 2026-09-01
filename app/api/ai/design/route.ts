import { tasks } from "@trigger.dev/sdk";

import { getProjectAccess } from "@/lib/collaborators";
import { requireUserId } from "@/lib/api-auth";
import { db } from "@/lib/prisma";

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  let body: { prompt?: unknown; roomId?: unknown; projectId?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const roomId = typeof body.roomId === "string" ? body.roomId.trim() : "";
  const projectId = typeof body.projectId === "string" ? body.projectId.trim() : "";

  if (!prompt || !roomId || !projectId) {
    return Response.json(
      { error: "prompt, roomId, and projectId are required" },
      { status: 400 }
    );
  }

  const access = await getProjectAccess(projectId, userId);

  if (!access?.canView) {
    return Response.json({ error: "Project not found or access denied" }, { status: 404 });
  }

  try {
    const handle = await tasks.trigger(
      "design-agent",
      { prompt, roomId, projectId },
      {
        tags: ["design-agent", projectId],
      }
    );

    await db.taskRun.create({
      data: {
        runId: handle.id,
        projectId,
        userId,
      },
    });

    return Response.json({ runId: handle.id, taskId: "design-agent" }, { status: 202 });
  } catch (error) {
    console.error("Failed to trigger design agent", { error, projectId, roomId, userId });
    return Response.json({ error: "Failed to trigger design task" }, { status: 500 });
  }
}
