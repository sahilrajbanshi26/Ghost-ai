import { logger, task } from "@trigger.dev/sdk";

export type DesignAgentInput = {
  prompt: string;
  roomId: string;
  projectId: string;
};

export const designAgent = task({
  id: "design-agent",
  run: async (payload: DesignAgentInput, { ctx }) => {
    logger.log("Design agent request received", {
      payload,
      runId: ctx.run.id,
    });

    return {
      ok: true,
      message: "Design job received",
      prompt: payload.prompt,
      roomId: payload.roomId,
      projectId: payload.projectId,
    };
  },
});
