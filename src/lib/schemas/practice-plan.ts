import { z } from "zod";

// Simple practice plan schema for tennis sessions
export const PracticePlanSchema = z.object({
  warmup: z.string().describe("5-10 minute tennis-specific warmup activities"),
  drill: z.string().describe("Main practice drill targeting the focus area"),
  game: z.string().describe("Competitive mini-game to apply the skills"),
});

export type PracticePlan = z.infer<typeof PracticePlanSchema>;

// Validation helper
export const validatePracticePlan = (data: unknown): PracticePlan => {
  return PracticePlanSchema.parse(data);
};

// Type guard
export const isPracticePlan = (data: unknown): data is PracticePlan => {
  return PracticePlanSchema.safeParse(data).success;
};
