import { auth } from "@trigger.dev/sdk";

import { requireUserId } from "@/lib/api-auth";
import { db } from "@/lib/prisma";

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  let body: { runId?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const runId = typeof body.runId === "string" ? body.runId.trim() : "";

  if (!runId) {
    return Response.json({ error: "runId is required" }, { status: 400 });
  }

  const taskRun = await db.taskRun.findUnique({
    where: { runId },
  });

  if (!taskRun) {
    return Response.json({ error: "Run not found" }, { status: 404 });
  }

  if (taskRun.userId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const token = await auth.createPublicToken({
      scopes: {
        read: {
          runs: [runId],
        },
      },
    });

    return Response.json({ token });
  } catch (error) {
    console.error("Failed to create design run token", { error, runId, userId });
    return Response.json({ error: "Failed to create token" }, { status: 500 });
  }
}
