import { tool as createTool } from "ai";
import { z } from "zod";
import { createPractice } from "./ai-functions";
import { PracticePlanSchema } from "./schemas/practice-plan";

export const practiceTool = createTool({
  description:
    "Generate a structured tennis practice session with warmup, drill, and game components",
  parameters: z.object({
    focus: z
      .string()
      .describe(
        "The focus of the practice session (e.g., 'forehand technique', 'net play', 'footwork')",
      ),
  }),
  execute: async function ({ focus }) {
    const practicePlan = await createPractice(focus);

    // Parse and validate the practice plan
    try {
      const parsedPlan = JSON.parse(practicePlan) as unknown;
      const validatedPlan = PracticePlanSchema.parse(parsedPlan);
      return validatedPlan;
    } catch (error) {
      console.error(
        "[practiceTool] Failed to parse/validate practice plan:",
        error,
      );
      // Return a fallback structure if parsing fails
      return {
        warmup: "Dynamic tennis warmup focusing on movement and ball feel",
        drill: `Cooperative drill targeting ${focus} with emphasis on technique and consistency`,
        game: `Competitive mini-game incorporating ${focus} with modified scoring rules`,
      };
    }
  },
});

export const tools = {
  practiceTool: practiceTool,
};
