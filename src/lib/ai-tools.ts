import { tool as createTool } from "ai";
import { z } from "zod";
import { createPractice } from "./ai-functions";

export const practiceTool = createTool({
  description: "Generate a practice session",
  parameters: z.object({
    focus: z.string().describe("The focus of the practice session"),
  }),
  execute: async function ({ focus }) {
    const practicePlan = await createPractice(focus);
    return practicePlan;
  },
});

export const tools = {
  practiceTool: practiceTool,
};
