import { tool as createTool } from "ai";
import { z } from "zod";
import { createPractice } from "./ai-functions";

export const practiceTool = createTool({
  description: "Generate a practice session",
  parameters: z.object({
    focus: z.string().describe("The focus of the practice session"),
  }),
  execute: async function ({ focus }) {
    const practice = await createPractice(focus);
    return practice;
  },
});

export const tools = {
  practiceTool: practiceTool,
};
