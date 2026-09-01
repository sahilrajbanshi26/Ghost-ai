import { currentUser } from "@clerk/nextjs/server";
import { auth, tasks } from "@trigger.dev/sdk";

import { getProjectAccess } from "@/lib/collaborators";
import { db } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

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

  const emails = [
    user.primaryEmailAddress?.emailAddress,
    ...user.emailAddresses.map((entry) => entry.emailAddress),
  ].filter((email): email is string => Boolean(email));

  const access = await getProjectAccess(projectId, userId, emails);

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

    const publicToken = await auth.createPublicToken({
      scopes: {
        read: {
          runs: [handle.id],
        },
      },
    });

    return Response.json({ runId: handle.id, publicToken: publicToken, taskId: "design-agent" }, { status: 202 });
  } catch (error) {
    console.error("Failed to trigger design agent", { error, projectId, roomId, userId });
    return Response.json({ error: "Failed to trigger design task" }, { status: 500 });
  }
}
